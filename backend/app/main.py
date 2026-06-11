import os
import shutil
import json
from contextlib import asynccontextmanager
from typing import List
import httpx
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import datetime

from .database import engine, Base, get_db
from .config import settings
from . import models, schemas, auth, ai, pdf, transcribe

# Initialize database tables
Base.metadata.create_all(bind=engine)


def _seed_database():
    """Seeds the database with demo doctor, patients and symptom logs on first startup."""
    db = next(get_db())
    try:
        demo_email = "doctor@carechrono.com"
        doctor = db.query(models.Doctor).filter(models.Doctor.email == demo_email).first()
        if not doctor:
            print("Seeding database with demo doctor, patient records, and symptom logs...")
            hashed_pwd = auth.get_password_hash("password123")
            doctor = models.Doctor(
                email=demo_email,
                hashed_password=hashed_pwd,
                full_name="Dr. Sarah Jenkins, MD",
                specialty="Geriatric Medicine"
            )
            db.add(doctor)
            db.commit()
            db.refresh(doctor)

            # Patient 1: John Doe
            john = models.Patient(
                name="John Doe",
                date_of_birth=datetime.date(1981, 4, 15),
                gender="Male",
                medical_record_number="MRN-88291",
                summary="Seeding progression...",
                risk_score="High",
                progression_trend="Worsening"
            )
            db.add(john)
            db.commit()
            db.refresh(john)

            logs_john = [
                models.SymptomLog(patient_id=john.id, date=datetime.date(2026, 6, 5),
                    symptoms_json=json.dumps(["Fever"]),
                    severities_json=json.dumps({"Fever": "Low"}),
                    notes="Started feeling slightly hot today and fatigued."),
                models.SymptomLog(patient_id=john.id, date=datetime.date(2026, 6, 6),
                    symptoms_json=json.dumps(["Fever", "Cough"]),
                    severities_json=json.dumps({"Fever": "Medium", "Cough": "Low"}),
                    notes="Woke up with a dry cough. Fever feels higher."),
                models.SymptomLog(patient_id=john.id, date=datetime.date(2026, 6, 7),
                    symptoms_json=json.dumps(["Fever", "Cough", "Fatigue"]),
                    severities_json=json.dumps({"Fever": "High", "Cough": "Medium", "Fatigue": "High"}),
                    notes="Very weak. Coughing a lot. Fever persists."),
                models.SymptomLog(patient_id=john.id, date=datetime.date(2026, 6, 8),
                    symptoms_json=json.dumps(["Fever", "Cough", "Fatigue", "Breathlessness"]),
                    severities_json=json.dumps({"Fever": "High", "Cough": "High", "Fatigue": "High", "Breathlessness": "High"}),
                    notes="Finding it hard to breathe when moving around. Worried."),
            ]
            for log in logs_john:
                db.add(log)
            db.commit()

            john_logs_list = db.query(models.SymptomLog).filter(models.SymptomLog.patient_id == john.id).all()
            analysis_john = ai.rule_based_fallback_analyzer(
                [{"date": l.date, "symptoms_json": l.symptoms_json, "severities_json": l.severities_json, "notes": l.notes} for l in john_logs_list],
                john.name
            )
            john.summary = analysis_john["summary"]
            john.risk_score = analysis_john["risk_score"]
            john.progression_trend = analysis_john["progression_trend"]
            db.add(john)
            db.commit()

            for ev in analysis_john["events"]:
                log_ref = next((l for l in john_logs_list if l.date.strftime("%Y-%m-%d") == ev["date"]), None)
                db.add(models.TimelineEvent(
                    patient_id=john.id,
                    symptom_log_id=log_ref.id if log_ref else None,
                    date=datetime.datetime.strptime(ev["date"], "%Y-%m-%d").date(),
                    event_type=ev["event_type"], title=ev["title"],
                    description=ev["description"], severity=ev["severity"]
                ))
            db.commit()

            # Patient 2: Mary Watson
            mary = models.Patient(
                name="Mary Watson",
                date_of_birth=datetime.date(1948, 11, 22),
                gender="Female",
                medical_record_number="MRN-44912",
                summary="Seeding progression...",
                risk_score="Low",
                progression_trend="Improving"
            )
            db.add(mary)
            db.commit()
            db.refresh(mary)

            logs_mary = [
                models.SymptomLog(patient_id=mary.id, date=datetime.date(2026, 6, 6),
                    symptoms_json=json.dumps(["Joint Pain"]),
                    severities_json=json.dumps({"Joint Pain": "Medium"}),
                    notes="Right knee and fingers aching. Hard to open jars."),
                models.SymptomLog(patient_id=mary.id, date=datetime.date(2026, 6, 7),
                    symptoms_json=json.dumps(["Joint Pain", "Fatigue"]),
                    severities_json=json.dumps({"Joint Pain": "High", "Fatigue": "Low"}),
                    notes="Very painful joints today, stayed in bed most of the morning."),
                models.SymptomLog(patient_id=mary.id, date=datetime.date(2026, 6, 8),
                    symptoms_json=json.dumps(["Joint Pain"]),
                    severities_json=json.dumps({"Joint Pain": "Low"}),
                    notes="Knee pain improved after resting. Feeling much better today."),
            ]
            for log in logs_mary:
                db.add(log)
            db.commit()

            mary_logs_list = db.query(models.SymptomLog).filter(models.SymptomLog.patient_id == mary.id).all()
            analysis_mary = ai.rule_based_fallback_analyzer(
                [{"date": l.date, "symptoms_json": l.symptoms_json, "severities_json": l.severities_json, "notes": l.notes} for l in mary_logs_list],
                mary.name
            )
            mary.summary = analysis_mary["summary"]
            mary.risk_score = analysis_mary["risk_score"]
            mary.progression_trend = analysis_mary["progression_trend"]
            db.add(mary)
            db.commit()

            for ev in analysis_mary["events"]:
                log_ref = next((l for l in mary_logs_list if l.date.strftime("%Y-%m-%d") == ev["date"]), None)
                db.add(models.TimelineEvent(
                    patient_id=mary.id,
                    symptom_log_id=log_ref.id if log_ref else None,
                    date=datetime.datetime.strptime(ev["date"], "%Y-%m-%d").date(),
                    event_type=ev["event_type"], title=ev["title"],
                    description=ev["description"], severity=ev["severity"]
                ))
            db.commit()
            print("Database successfully seeded.")
    except Exception as e:
        print(f"Error seeding database: {str(e)}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan handler — runs startup logic before yield and cleanup after."""
    _seed_database()
    yield


app = FastAPI(title="CareChrono API", version="1.0.0", lifespan=lifespan)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local prototype development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




# --- AUTH ENDPOINTS ---

@app.post("/api/auth/register", response_model=schemas.DoctorResponse)
def register(doctor: schemas.DoctorCreate, db: Session = Depends(get_db)):
    db_doctor = db.query(models.Doctor).filter(models.Doctor.email == doctor.email).first()
    if db_doctor:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = auth.get_password_hash(doctor.password)
    db_doctor = models.Doctor(
        email=doctor.email,
        hashed_password=hashed_pwd,
        full_name=doctor.full_name,
        specialty=doctor.specialty
    )
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

@app.post("/api/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    doctor = db.query(models.Doctor).filter(models.Doctor.email == form_data.username).first()
    if not doctor or not auth.verify_password(form_data.password, doctor.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(
        data={"sub": doctor.email, "doctor_id": doctor.id}
    )
    return {"access_token": access_token, "token_type": "bearer"}


# --- PATIENTS ENDPOINTS ---

@app.get("/api/patients", response_model=List[schemas.PatientResponse])
def get_patients(db: Session = Depends(get_db)):
    # Patient list endpoint allows access to patient list for both doctor and routing
    return db.query(models.Patient).all()

@app.post("/api/patients", response_model=schemas.PatientResponse)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    # Check MRN uniqueness
    db_patient = db.query(models.Patient).filter(models.Patient.medical_record_number == patient.medical_record_number).first()
    if db_patient:
        raise HTTPException(status_code=400, detail="Medical Record Number already exists")
    
    db_patient = models.Patient(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@app.get("/api/patients/{patient_id}", response_model=schemas.PatientDetailResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


# --- SYMPTOM LOGGING & COMPILATION ---

@app.post("/api/patients/{patient_id}/symptoms", response_model=schemas.SymptomLogResponse)
def log_daily_symptom(
    patient_id: int,
    log_in: schemas.SymptomLogCreate,
    db: Session = Depends(get_db)
):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    log_date = log_in.date or datetime.date.today()
    
    # Check if a symptom log already exists for this date
    existing_log = db.query(models.SymptomLog).filter(
        models.SymptomLog.patient_id == patient_id,
        models.SymptomLog.date == log_date
    ).first()

    if existing_log:
        existing_log.symptoms_json = log_in.symptoms_json
        existing_log.severities_json = log_in.severities_json
        existing_log.notes = log_in.notes
        existing_log.voice_note_path = log_in.voice_note_path
        db_log = existing_log
    else:
        db_log = models.SymptomLog(
            patient_id=patient_id,
            date=log_date,
            symptoms_json=log_in.symptoms_json,
            severities_json=log_in.severities_json,
            notes=log_in.notes,
            voice_note_path=log_in.voice_note_path
        )
        db.add(db_log)

    db.commit()
    db.refresh(db_log)
    return db_log

@app.post("/api/patients/{patient_id}/compile-timeline")
async def compile_patient_timeline(
    patient_id: int,
    db: Session = Depends(get_db)
):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    symptom_logs = db.query(models.SymptomLog).filter(models.SymptomLog.patient_id == patient_id).all()
    
    # Structure logs array for AI analysis
    serialized_logs = []
    for l in symptom_logs:
        serialized_logs.append({
            "date": l.date,
            "symptoms_json": l.symptoms_json,
            "severities_json": l.severities_json,
            "notes": l.notes or ""
        })

    # Query AI analysis
    try:
        analysis = await ai.generate_timeline_analysis(serialized_logs, patient.name)
        
        # Clear existing timeline events for this patient
        db.query(models.TimelineEvent).filter(models.TimelineEvent.patient_id == patient_id).delete()
        
        # Insert newly parsed timeline events
        for ev in analysis.get("events", []):
            log_ref = next((l for l in symptom_logs if l.date.strftime("%Y-%m-%d") == ev["date"]), None)
            db_event = models.TimelineEvent(
                patient_id=patient_id,
                symptom_log_id=log_ref.id if log_ref else None,
                date=datetime.datetime.strptime(ev["date"], "%Y-%m-%d").date(),
                event_type=ev["event_type"],
                title=ev["title"],
                description=ev["description"],
                severity=ev.get("severity")
            )
            db.add(db_event)
            
        # Update Patient Profile
        patient.summary = analysis.get("summary")
        patient.risk_score = analysis.get("risk_score", "Low")
        patient.progression_trend = analysis.get("progression_trend", "Stable")
        db.add(patient)
        
        db.commit()
        db.refresh(patient)
    except Exception as ex:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Timeline analysis compilation failed: {str(ex)}")

    return {"status": "success", "risk_score": patient.risk_score, "progression_trend": patient.progression_trend, "summary": patient.summary}


# --- CLINICAL CONSULTATION NOTES ---

@app.post("/api/patients/{patient_id}/notes", response_model=schemas.ClinicalNoteResponse)
def create_clinical_note(
    patient_id: int,
    note_in: schemas.ClinicalNoteCreate,
    db: Session = Depends(get_db),
    current_doctor: models.Doctor = Depends(auth.get_current_doctor)
):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    note = models.ClinicalNote(
        patient_id=patient_id,
        doctor_id=current_doctor.id,
        content=note_in.content
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


# --- TIMELINE ENDPOINT ---

@app.get("/api/patients/{patient_id}/timeline", response_model=List[schemas.TimelineEventResponse])
def get_patient_timeline(
    patient_id: int,
    db: Session = Depends(get_db)
):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    return db.query(models.TimelineEvent)\
             .filter(models.TimelineEvent.patient_id == patient_id)\
             .order_by(models.TimelineEvent.date.desc())\
             .all()


# --- PDF REPORT GENERATION ---

@app.get("/api/patients/{patient_id}/pdf")
def get_patient_report_pdf(
    patient_id: int,
    db: Session = Depends(get_db)
):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    events = db.query(models.TimelineEvent)\
               .filter(models.TimelineEvent.patient_id == patient_id)\
               .order_by(models.TimelineEvent.date.asc())\
               .all()
               
    # Prepare data dicts
    patient_dict = {
        "name": patient.name,
        "date_of_birth": patient.date_of_birth,
        "gender": patient.gender,
        "medical_record_number": patient.medical_record_number,
        "summary": patient.summary,
        "risk_score": patient.risk_score,
        "progression_trend": patient.progression_trend
    }
    
    events_list = []
    for e in events:
        events_list.append({
            "date": e.date,
            "event_type": e.event_type,
            "title": e.title,
            "description": e.description,
            "severity": e.severity
        })
        
    pdf_buffer = pdf.generate_patient_pdf(patient_dict, events_list)
    filename = f"CareChrono_{patient.name.replace(' ', '_')}_Summary.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# --- VOICE TRANSCRIPTION ENDPOINT ---

@app.post("/api/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...)
):
    # Save the file temporarily
    temp_dir = "temp_audio"
    os.makedirs(temp_dir, exist_ok=True)
    
    file_path = os.path.join(temp_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        text = await transcribe.transcribe_audio_file(file_path)
    finally:
        # Cleanup temp file
        if os.path.exists(file_path):
            os.remove(file_path)
            
    return {"transcript": text}

# --- GEMINI CHATBOT ENDPOINT ---

_CHAT_FALLBACK_RESPONSES = {
    "fever": "Fever can have many causes including infections. If fever exceeds 38.5°C (101.3°F), persists more than 3 days, or is accompanied by breathlessness, seek medical attention promptly.",
    "cough": "A persistent cough lasting more than 3 weeks, or one that produces blood-tinged mucus, warrants a medical evaluation.",
    "pain": "Pain that is severe, sudden, or accompanied by other symptoms like fever or difficulty breathing should be evaluated by a healthcare professional.",
    "default": "I'm your CareChrono health assistant. I can help you understand symptom patterns, medication reminders, and when to seek care. Please consult a healthcare professional for personalized medical advice."
}

def _local_chat_fallback(message: str) -> str:
    msg_lower = message.lower()
    for keyword, response in _CHAT_FALLBACK_RESPONSES.items():
        if keyword in msg_lower:
            return response
    return _CHAT_FALLBACK_RESPONSES["default"]


@app.post("/api/chat", response_model=schemas.ChatResponse)
async def chat_with_ai(chat: schemas.ChatRequest):
    """Chat endpoint. Uses Gemini if API key is configured, falls back to local responses."""
    if settings.GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{
                    "parts": [{
                        "text": (
                            "You are CareChrono AI, a compassionate healthcare assistant. "
                            "Answer briefly and clearly in 2-3 sentences. "
                            f"Question: {chat.message}"
                        )
                    }]
                }]
            }
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(url, json=payload)

            if response.status_code == 200:
                data = response.json()
                answer = data["candidates"][0]["content"]["parts"][0]["text"]
                return {"response": answer}

            # Gemini returned non-200 (quota, bad key etc.) — use fallback
            return {"response": _local_chat_fallback(chat.message)}

        except Exception:
            return {"response": _local_chat_fallback(chat.message)}

    # No valid Gemini key configured — use built-in local fallback
    return {"response": _local_chat_fallback(chat.message)}
