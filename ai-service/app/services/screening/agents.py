import re
import logging
from typing import List, Dict, Any
from app.providers.factory import get_ai_provider
from app.schemas.screening import JobAnalysisResult, CVExtractedData, EvidenceMatch, ScreeningDecisionResult
from app.core.config import settings

logger = logging.getLogger("ai_service.services.screening.agents")

# Agent 1: Skills Matching Agent (Strict Word Boundary Match)
def evaluate_skills(job: JobAnalysisResult, cv: CVExtractedData) -> Dict[str, Any]:
    cv_skills_lower = [s.lower().strip() for s in cv.skills]
    
    crit_reqs = [s.name for s in job.critical_skills]
    imp_reqs = [s.name for s in job.important_skills]
    nice_reqs = [s.name for s in job.nice_to_have_skills]
    
    all_job_skills = crit_reqs + imp_reqs + nice_reqs
    if not all_job_skills:
        all_job_skills = ["Software Engineering"]

    matched = []
    missing = []

    for req in all_job_skills:
        req_lower = req.lower().strip()
        is_matched = False

        for cv_s in cv_skills_lower:
            if not cv_s:
                continue
            # Exact match or strict word-boundary regex match
            if req_lower == cv_s:
                is_matched = True
                break
            elif len(cv_s) >= 3 and (re.search(rf'\b{re.escape(cv_s)}\b', req_lower) or re.search(rf'\b{re.escape(req_lower)}\b', cv_s)):
                is_matched = True
                break

        if is_matched:
            matched.append(req)
        else:
            missing.append(req)

    total = len(all_job_skills)
    score = (len(matched) / total * 100.0) if total > 0 else 0.0

    matched_critical = [req for req in crit_reqs if req in matched]

    return {
        "score": round(score, 1),
        "matched": matched,
        "missing": missing,
        "total_critical": len(crit_reqs),
        "matched_critical_count": len(matched_critical),
    }

# Agent 2: Experience Evaluation Agent
def evaluate_experience(job: JobAnalysisResult, cv: CVExtractedData) -> Dict[str, Any]:
    total_exp_years = sum(exp.duration_years for exp in cv.experience) if cv.experience else 0.0
    min_years = job.minimum_experience_years

    if min_years <= 0:
        exp_score = 80.0 if cv.experience else 40.0
    else:
        if total_exp_years <= 0:
            exp_score = 20.0
        else:
            ratio = total_exp_years / min_years
            exp_score = min(100.0, ratio * 80.0)

    matched_roles = [f"{exp.title} ({exp.duration_years} yrs)" for exp in cv.experience]
    missing_reqs = []
    if total_exp_years < min_years:
        missing_reqs.append(f"Requires {min_years} yrs, candidate has {total_exp_years} yrs.")

    return {
        "score": round(exp_score, 1),
        "total_years": total_exp_years,
        "matched_experience": matched_roles,
        "missing_requirements": missing_reqs,
    }

# Agent 3: Education Evaluation Agent
def evaluate_education(job: JobAnalysisResult, cv: CVExtractedData) -> Dict[str, Any]:
    if not cv.education:
        return {"score": 40.0}

    cv_edu_text = " ".join(cv.education).lower()
    has_degree = any(term in cv_edu_text for term in ["bs", "bachelor", "master", "ms", "phd", "degree", "computer", "engineering", "cs"])

    score = 100.0 if has_degree else 60.0
    return {"score": score}

# Agent 4: Evidence Extraction Agent
def extract_evidence(job: JobAnalysisResult, cv: CVExtractedData, matched_skills: List[str]) -> List[EvidenceMatch]:
    evidence_list: List[EvidenceMatch] = []
    
    for skill in matched_skills[:5]:
        found_quote = f"Candidate lists {skill} proficiency."
        if cv.experience:
            for exp in cv.experience:
                if any(skill.lower() in h.lower() for h in exp.highlights):
                    found_quote = f"Demonstrated {skill} as {exp.title}."
                    break

        evidence_list.append(EvidenceMatch(
            requirement=skill,
            evidence_quote=found_quote,
            is_matched=True
        ))

    return evidence_list

# Agent 5: Final Decision & Score Synthesis Agent
def synthesize_screening_decision(
    job: JobAnalysisResult,
    cv: CVExtractedData,
    skills_eval: Dict[str, Any],
    exp_eval: Dict[str, Any],
    edu_eval: Dict[str, Any],
    evidence: List[EvidenceMatch]
) -> ScreeningDecisionResult:
    # Transparent weighted scoring formula:
    # Skills = 40%, Experience = 30%, Education = 15%, Relevance = 15%
    skills_score = skills_eval["score"]
    exp_score = exp_eval["score"]
    edu_score = edu_eval["score"]
    rel_score = (skills_score + exp_score) / 2.0

    overall_match_score = round(
        skills_score * 0.40 +
        exp_score * 0.30 +
        edu_score * 0.15 +
        rel_score * 0.15,
        1
    )

    threshold = settings.CV_PASS_THRESHOLD
    has_critical_reqs = skills_eval.get("total_critical", 0) > 0
    matched_crit_cnt = skills_eval.get("matched_critical_count", 0)

    min_exp_years = job.minimum_experience_years
    cand_exp_years = exp_eval.get("total_years", 0.0)

    # Experience Deficit: If job requires min_exp_years (e.g. 3 yrs) and candidate has less than 75% of required years (e.g. 1 yr or fresh grad), knockout!
    has_exp_deficit = (min_exp_years > 0) and (cand_exp_years < (min_exp_years * 0.75))

    knockout_reasons: List[str] = []

    if has_exp_deficit:
        knockout_reasons.append(
            f"Experience Deficit: Position requires minimum {min_exp_years} yrs experience, but candidate has only {cand_exp_years} yrs."
        )

    if skills_score < 50.0:
        knockout_reasons.append(
            f"Skill Overlap Deficit: Candidate matched only {len(skills_eval['matched'])} skills ({skills_score}%), falling below 50% skill requirement threshold."
        )

    if has_critical_reqs and matched_crit_cnt == 0:
        knockout_reasons.append(
            f"Critical Skill Deficit: Candidate matched 0 critical skills required for {job.normalized_title}."
        )

    if overall_match_score < threshold:
        knockout_reasons.append(
            f"Match Score Deficit: Candidate overall score ({overall_match_score}%) is below pass threshold ({threshold}%)."
        )

    qualified = len(knockout_reasons) == 0

    if qualified and overall_match_score >= 85.0:
        recommendation = "strong_match"
    elif qualified and overall_match_score >= 70.0:
        recommendation = "match"
    elif qualified and overall_match_score >= 50.0:
        recommendation = "borderline"
    else:
        recommendation = "no_match"

    if qualified:
        summary = (
            f"Candidate {cv.candidate_name} qualified for assessment for {job.normalized_title}. "
            f"Overall Match: {overall_match_score}% (Threshold: {threshold}%). "
            f"Matched {len(skills_eval['matched'])} required skills and {cand_exp_years} yrs experience."
        )
    else:
        summary = (
            f"Candidate {cv.candidate_name} KNOCKED OUT for {job.normalized_title}. "
            f"Overall Score: {overall_match_score}%. Reasons: {' | '.join(knockout_reasons)}"
        )

    return ScreeningDecisionResult(
        match_score=overall_match_score,
        recommendation=recommendation,
        qualified=qualified,
        skills_score=skills_score,
        experience_score=exp_score,
        education_score=edu_score,
        relevance_score=round(rel_score, 1),
        matched_skills=skills_eval["matched"],
        missing_skills=skills_eval["missing"],
        matched_experience=exp_eval["matched_experience"],
        missing_requirements=exp_eval["missing_requirements"] + (knockout_reasons if not qualified else []),
        evidence=evidence,
        reasoning_summary=summary
    )
