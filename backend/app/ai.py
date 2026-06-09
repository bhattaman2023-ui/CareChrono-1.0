import json
import re
import datetime
import logging
import httpx
from .config import settings

logger = logging.getLogger("carechrono.ai")

SYSTEM_PROMPT = """
You are a Principal Clinical AI. Your task is to analyze a chronological sequence of daily symptom logs for a patient and output a structured diagnostic timeline, a clinical summary, a risk assessment, and a progression trend.

Analyze the progression carefully:
- Timeline Events: Extract individual symptoms or status changes on each date. Assign them event_type "Symptom", a concise title, description, and severity ("Low", "Medium", "High").
- Risk Score: Determine if the progression indicates high concern (e.g. breathlessness worsening, high fever) and output exactly one of ["Low", "Medium", "High"].
- Progression Trend: Determine if the severity is improving, stable, or worsening and output exactly one of ["Improving", "Stable", "Worsening"].
- Clinical Summary: Write a brief clinical summary of the patient's symptom pathway over the days (e.g. "Patient experienced fever for 5 days. Cough appeared on Day 2. Breathlessness worsened on Day 4. Pattern indicates progression requiring attention.")

Respond ONLY with a valid JSON object matching this schema:
{
  "events": [
    {
      "date": "YYYY-MM-DD",
      "event_type": "Symptom|Medication|Lab|Visit|Diagnosis",
      "title": "Fever (Moderate)",
      "description": "Details about the symptom from log notes",
      "severity": "Low|Medium|High"
    }
  ],
  "summary": "Clinical summary of progression",
  "risk_score": "Low|Medium|High",
  "progression_trend": "Improving|Stable|Worsening"
}
"""

def rule_based_fallback_analyzer(logs: list, patient_name: str) -> dict:
    """
    Offline analyzer that tracks symptom trends, severity changes, and risk indicators.
    Ensures timeline generation and diagnostic summaries work instantly out-of-the-box.
    """
    logger.info(f"Using offline rule-based analyzer for {patient_name}")
    
    # Sort logs by date ascending
    sorted_logs = sorted(logs, key=lambda x: x.get('date', ''))
    
    events = []
    all_symptoms_seen = set()
    symptom_history = {} # symptom_name -> list of (date, severity)
    
    # Severity points mapping to track trends
    sev_points = {"Low": 1, "Mild": 1, "Medium": 2, "Moderate": 2, "High": 3, "Severe": 3}
    
    total_severity_score = 0
    record_count = len(sorted_logs)
    
    has_breathlessness = False
    has_high_fever = False
    
    first_date = None
    last_date = None
    
    # Step 1: Parse logs and build timeline events
    for idx, log in enumerate(sorted_logs):
        log_date_str = log.get('date')
        if isinstance(log_date_str, datetime.date):
            log_date_str = log_date_str.strftime("%Y-%m-%d")
            
        if idx == 0:
            first_date = log_date_str
        last_date = log_date_str
            
        try:
            symptoms = json.loads(log.get('symptoms_json', '[]'))
            severities = json.loads(log.get('severities_json', '{}'))
        except Exception:
            symptoms = []
            severities = {}
            
        notes = log.get('notes') or ""
        
        for sym in symptoms:
            all_symptoms_seen.add(sym)
            sev = severities.get(sym, "Low")
            if sev == "Mild": sev = "Low"
            if sev in ["Medium", "Moderate"]: sev = "Medium"
            if sev in ["High", "Severe"]: sev = "High"
            
            # Map specific triggers
            if sym.lower() in ["breathlessness", "shortness of breath", "chest pressure"] and sev in ["Medium", "High"]:
                has_breathlessness = True
            if sym.lower() in ["fever", "temperature"] and sev == "High":
                has_high_fever = True
                
            total_severity_score += sev_points.get(sev, 1)
            
            if sym not in symptom_history:
                symptom_history[sym] = []
            symptom_history[sym].append((log_date_str, sev))
            
            desc = f"Patient logged {sym.lower()} with {sev.lower()} severity."
            if notes:
                desc += f" Patient comments: {notes}"
                
            events.append({
                "date": log_date_str,
                "event_type": "Symptom",
                "title": f"{sym} ({sev})",
                "description": desc,
                "severity": sev
            })
            
    # Step 2: Determine Progression Trend
    # We look at the severity points comparison between early half and later half of logs
    trend = "Stable"
    if record_count >= 2:
        midpoint = record_count // 2
        early_logs = sorted_logs[:midpoint]
        late_logs = sorted_logs[midpoint:]
        
        def get_avg_severity(logs_subset):
            subset_score = 0
            subset_count = 0
            for l in logs_subset:
                try:
                    sevs = json.loads(l.get('severities_json', '{}'))
                    for s, v in sevs.items():
                        subset_score += sev_points.get(v, 1)
                        subset_count += 1
                except Exception:
                    pass
            return subset_score / subset_count if subset_count > 0 else 0
            
        early_avg = get_avg_severity(early_logs)
        late_avg = get_avg_severity(late_logs)
        
        if late_avg - early_avg > 0.3:
            trend = "Worsening"
        elif early_avg - late_avg > 0.3:
            trend = "Improving"
            
    # Step 3: Determine Risk Score
    risk = "Low"
    if has_breathlessness:
        risk = "High"
    elif has_high_fever and trend == "Worsening":
        risk = "High"
    elif trend == "Worsening" or total_severity_score / max(record_count, 1) > 2.0:
        risk = "Medium"
        
    # Step 4: Generate Diagnostic Summary
    summary = f"Patient {patient_name} logged symptoms over {record_count} days. "
    if record_count > 0:
        sym_list = list(all_symptoms_seen)
        summary += f"Symptom list: {', '.join(sym_list)}. "
        
        # Write specific diagnostic pathways
        if "Breathlessness" in symptom_history and trend == "Worsening":
            summary += "Breathlessness escalated, indicating severe respiratory progression requiring clinical attention. "
        elif "Fever" in symptom_history:
            fever_logs = symptom_history["Fever"]
            if len(fever_logs) >= 2:
                summary += f"Fever persisted for {len(fever_logs)} days. "
                
        if trend == "Worsening":
            summary += "Pattern indicates a worsening progression that requires prompt medical evaluation."
        elif trend == "Improving":
            summary += "Symptoms show signs of resolution. Patient response is improving."
        else:
            summary += "Symptoms are currently stable."
    else:
        summary = "No daily symptom records have been logged yet."
        
    return {
        "events": events,
        "summary": summary,
        "risk_score": risk,
        "progression_trend": trend
    }


async def generate_timeline_analysis(logs: list, patient_name: str) -> dict:
    """
    Triggers progression analysis for patient history logs.
    Queries local Ollama or Gemini free-tier, falling back to local regex analyzer.
    """
    if not logs:
        return {
            "events": [],
            "summary": "No logs logged.",
            "risk_score": "Low",
            "progression_trend": "Stable"
        }
        
    # Prepare serializable input for LLM
    logs_summary = []
    for idx, log in enumerate(logs):
        log_date = log.get('date')
        if not isinstance(log_date, str):
            log_date = log_date.strftime("%Y-%m-%d")
        logs_summary.append({
            "day": idx + 1,
            "date": log_date,
            "symptoms": log.get('symptoms_json', '[]'),
            "severities": log.get('severities_json', '{}'),
            "notes": log.get('notes', '')
        })
        
    provider = settings.AI_PROVIDER.lower()
    
    if provider == "ollama":
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                prompt = (
                    f"{SYSTEM_PROMPT}\n\n"
                    f"Patient Name: {patient_name}\n"
                    f"Chronological Symptom Logs:\n{json.dumps(logs_summary, indent=2)}"
                )
                response = await client.post(
                    f"{settings.OLLAMA_URL}/api/generate",
                    json={
                        "model": settings.OLLAMA_MODEL,
                        "prompt": prompt,
                        "stream": False,
                        "format": "json"
                    }
                )
                if response.status_code == 200:
                    result_json = response.json().get("response", "")
                    json_match = re.search(r'\{.*\}', result_json, re.DOTALL)
                    if json_match:
                        parsed = json.loads(json_match.group(0))
                        if "events" in parsed:
                            return parsed
        except Exception as e:
            logger.warning(f"Ollama timeline generation failed: {str(e)}")
            
    elif provider == "gemini" and settings.GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            prompt = (
                f"{SYSTEM_PROMPT}\n\n"
                f"Patient Name: {patient_name}\n"
                f"Chronological Symptom Logs:\n{json.dumps(logs_summary, indent=2)}"
            )
            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "responseMimeType": "application/json"
                }
            }
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    text_response = data["candidates"][0]["content"]["parts"][0]["text"]
                    json_match = re.search(r'\{.*\}', text_response, re.DOTALL)
                    if json_match:
                        parsed = json.loads(json_match.group(0))
                        if "events" in parsed:
                            return parsed
        except Exception as e:
            logger.warning(f"Gemini API timeline analysis failed: {str(e)}")

    # Deterministic Local Fallback
    return rule_based_fallback_analyzer(logs, patient_name)
