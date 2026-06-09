import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from .database import Base

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    specialty = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    notes = relationship("ClinicalNote", back_populates="doctor")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String, nullable=False)
    medical_record_number = Column(String, unique=True, index=True, nullable=False)
    summary = Column(Text, nullable=True)
    risk_score = Column(String, default="Low")         # "Low", "Medium", "High"
    progression_trend = Column(String, default="Stable")  # "Improving", "Stable", "Worsening"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    symptom_logs = relationship("SymptomLog", back_populates="patient", cascade="all, delete-orphan")
    notes = relationship("ClinicalNote", back_populates="patient", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="patient", cascade="all, delete-orphan")


class SymptomLog(Base):
    __tablename__ = "symptom_logs"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    date = Column(Date, default=datetime.date.today)
    symptoms_json = Column(Text, nullable=False)    # e.g., '["Fever", "Cough"]'
    severities_json = Column(Text, nullable=False)  # e.g., '{"Fever": "Medium", "Cough": "Low"}'
    notes = Column(Text, nullable=True)
    voice_note_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="symptom_logs")
    timeline_events = relationship("TimelineEvent", back_populates="symptom_log")


class ClinicalNote(Base):
    __tablename__ = "clinical_notes"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="notes")
    doctor = relationship("Doctor", back_populates="notes")


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    symptom_log_id = Column(Integer, ForeignKey("symptom_logs.id"), nullable=True)
    date = Column(Date, nullable=False)
    event_type = Column(String, nullable=False)  # "Symptom", "Medication", "Lab", "Visit", "Diagnosis"
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String, nullable=True)     # "Low", "Medium", "High"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="timeline_events")
    symptom_log = relationship("SymptomLog", back_populates="timeline_events")
