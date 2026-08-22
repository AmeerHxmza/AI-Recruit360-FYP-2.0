from app.schemas.screening import JobAnalysisResult, CVExtractedData, SkillRequirement, CVExtractedExperience
from app.services.screening.agents import (
    evaluate_skills,
    evaluate_experience,
    evaluate_education,
    synthesize_screening_decision
)

def test_multi_agent_screening_qualified():
    job = JobAnalysisResult(
        normalized_title="Senior AI Engineer",
        critical_skills=[SkillRequirement(name="Python", importance="critical"), SkillRequirement(name="FastAPI", importance="critical")],
        important_skills=[SkillRequirement(name="LangGraph", importance="important")],
        nice_to_have_skills=[],
        minimum_experience_years=2.0,
        preferred_experience_years=3.0,
        education_requirements=["BS Software Engineering"],
        responsibilities=["Develop production AI microservices"],
        technical_domains=["AI Development"]
    )

    cv = CVExtractedData(
        candidate_name="Ameer Hamza",
        skills=["Python", "FastAPI", "LangGraph", "Next.js", "PostgreSQL"],
        experience=[CVExtractedExperience(title="AI Developer", duration_years=2.5, highlights=["Built FastAPI microservices"])],
        education=["BS Software Engineering"],
        projects=[],
        certifications=[]
    )

    skills_eval = evaluate_skills(job, cv)
    exp_eval = evaluate_experience(job, cv)
    edu_eval = evaluate_education(job, cv)

    decision = synthesize_screening_decision(job, cv, skills_eval, exp_eval, edu_eval, [])

    assert decision.match_score >= 70.0
    assert decision.qualified is True
    assert decision.recommendation in ["match", "strong_match"]
    assert "Python" in decision.matched_skills

def test_multi_agent_screening_unqualified():
    job = JobAnalysisResult(
        normalized_title="Senior AI Engineer",
        critical_skills=[SkillRequirement(name="Python", importance="critical"), SkillRequirement(name="FastAPI", importance="critical")],
        important_skills=[SkillRequirement(name="LangGraph", importance="important")],
        nice_to_have_skills=[],
        minimum_experience_years=5.0,
        preferred_experience_years=7.0,
        education_requirements=["BS CS"],
        responsibilities=[],
        technical_domains=[]
    )

    cv = CVExtractedData(
        candidate_name="Unqualified Candidate",
        skills=["Photoshop", "Graphic Design"],
        experience=[],
        education=[],
        projects=[],
        certifications=[]
    )

    skills_eval = evaluate_skills(job, cv)
    exp_eval = evaluate_experience(job, cv)
    edu_eval = evaluate_education(job, cv)

    decision = synthesize_screening_decision(job, cv, skills_eval, exp_eval, edu_eval, [])

    assert decision.match_score < 70.0
    assert decision.qualified is False
    assert decision.recommendation == "no_match"
