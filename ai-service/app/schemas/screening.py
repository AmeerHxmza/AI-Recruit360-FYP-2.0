from pydantic import BaseModel, Field
from typing import List, Optional

class EvidenceMatch(BaseModel):
    requirement: str
    evidence_quote: str
    is_matched: bool

class ScreeningDecisionResult(BaseModel):
    match_score: float = Field(ge=0.0, le=100.0)
    recommendation: str = Field(description="strong_match | match | borderline | no_match")
    qualified: bool
    skills_score: float = Field(ge=0.0, le=100.0)
    experience_score: float = Field(ge=0.0, le=100.0)
    education_score: float = Field(ge=0.0, le=100.0)
    relevance_score: float = Field(ge=0.0, le=100.0)
    matched_skills: List[str]
    missing_skills: List[str]
    matched_experience: List[str]
    missing_requirements: List[str]
    evidence: List[EvidenceMatch]
    reasoning_summary: str

# Compatibility types for retained legacy modules; unused by the active pipeline.
class SkillRequirement(BaseModel):
    name: str
    importance: str = Field(description="critical | important | nice_to_have")

class JobAnalysisResult(BaseModel):
    normalized_title: str
    critical_skills: List[SkillRequirement]
    important_skills: List[SkillRequirement]
    nice_to_have_skills: List[SkillRequirement]
    minimum_experience_years: float
    preferred_experience_years: float
    education_requirements: List[str]
    responsibilities: List[str]
    technical_domains: List[str]

class CVMetaData(BaseModel):
    candidate_name: str
    total_years_experience: float = Field(description="Total accumulated years of professional experience across all roles.")
    has_degree: bool = Field(description="True if the candidate has a Bachelor's degree or higher.")
    raw_text: str = Field(default="", exclude=True) # Used to hold raw text for fallback search

