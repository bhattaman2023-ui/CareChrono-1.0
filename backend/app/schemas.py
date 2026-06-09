from pydantic import BaseModel, EmailStr
from typing import List, Optional
import datetime

# --- Auth Schemas ---
class DoctorBase(BaseModel):
    email: EmailStr
    full_name: str
    specialty: Optional[str] = None

class DoctorCreate(DoctorBase):
    password: str

class DoctorResponse(DoctorBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    doctor_id: Optional[int] = None


# --- Symptom Log Schemas ---
class SymptomLogBase(BaseModel):
    symptoms_json: str    # JSON string e.g., '["Fever", "Cough"]'
    severities_json: str  # JSON string e.g., '{"Fever": "Medium", "Cough": "Low"}'
    notes: Optional[str] = None
    voice_note_path: Optional[str] = None
    date: Optional[datetime.date] = None

class SymptomLogCreate(SymptomLogBase):
    pass

class SymptomLogResponse(SymptomLogBase):
    id: int
    patient_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Timeline Event Schemas ---
class TimelineEventBase(BaseModel):
    date: datetime.date
    event_type: str  # "Symptom", "Medication", "Lab", "Visit", "Diagnosis"
    title: str
    description: Optional[str] = None
    severity: Optional[str] = None  # "Low", "Medium", "High"

class TimelineEventCreate(TimelineEventBase):
    patient_id: int
    symptom_log_id: Optional[int] = None

class TimelineEventResponse(TimelineEventBase):
    id: int
    patient_id: int
    symptom_log_id: Optional[int] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Clinical Note Schemas (Doctor notes) ---
class ClinicalNoteBase(BaseModel):
    content: str

class ClinicalNoteCreate(ClinicalNoteBase):
    pass

class ClinicalNoteResponse(ClinicalNoteBase):
    id: int
    patient_id: int
    doctor_id: int
    date: datetime.datetime
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Patient Schemas ---
class PatientBase(BaseModel):
    name: str
    date_of_birth: datetime.date
    gender: str
    medical_record_number: str
    summary: Optional[str] = None
    risk_score: Optional[str] = "Low"
    progression_trend: Optional[str] = "Stable"

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class PatientDetailResponse(PatientResponse):
    symptom_logs: List[SymptomLogResponse] = []
    notes: List[ClinicalNoteResponse] = []
    timeline_events: List[TimelineEventResponse] = []

    class Config:
        from_attributes = True


# --- AI Redesign Output Schemas ---
class AISymptomEvent(BaseModel):
    date: str  # YYYY-MM-DD
    event_type: str  # "Symptom", "Medication", "Lab", "Visit", "Diagnosis"
    title: str
    description: str
    severity: str  # "Low", "Medium", "High"

class AIAnalysisResult(BaseModel):
    events: List[AISymptomEvent]
    summary: str
    risk_score: str  # "Low", "Medium", "High"
    progression_trend: str  # "Improving", "Stable", "Worsening"
