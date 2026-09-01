import re
import logging
from typing import List, Dict, Any
from app.providers.factory import get_ai_provider
from app.providers.openai import cosine_similarity
from app.schemas.screening import JobAnalysisResult, CVMetaData, EvidenceMatch, ScreeningDecisionResult
from app.core.config import settings

logger = logging.getLogger("ai_service.services.screening.agents")

# Agent 1: RAG Skills Matching Agent (Vector + Fallback Text Match)
def evaluate_skills(
    job: JobAnalysisResult, 
    job_embeddings: Dict[str, List[float]], 
    cv_chunks: List[str], 
    chunk_embeddings: List[List[float]]
) -> Dict[str, Any]:
    
    crit_reqs = [s.name for s in job.critical_skills]
    imp_reqs = [s.name for s in job.important_skills]
    nice_reqs = [s.name for s in job.nice_to_have_skills]
    
    all_job_skills = crit_reqs + imp_reqs + nice_reqs
    if not all_job_skills:
        all_job_skills = ["Software Engineering"]

    matched = []
    missing = []
    evidence_list = []

    for req in all_job_skills:
        req_emb = job_embeddings.get(req)
        best_sim = 0.0
        best_chunk = ""
        
        req_lower = req.lower().strip()
        is_matched = False
        
        # 1. High-speed Semantic Vector Search
        if req_emb and chunk_embeddings:
            for i, chunk_emb in enumerate(chunk_embeddings):
                sim = cosine_similarity(req_emb, chunk_emb)
                if sim > best_sim:
                    best_sim = sim
                    best_chunk = cv_chunks[i]
            
            if best_sim > 0.77:  # High confidence semantic match threshold
                is_matched = True

        # 2. Pure text Regex fallback
        if not is_matched:
            for chunk in cv_chunks:
                if re.search(rf'\b{re.escape(req_lower)}\b', chunk.lower()):
                    is_matched = True
                    best_chunk = chunk
                    break
        
        if is_matched:
            matched.append(req)
            if best_chunk:
                clean_chunk = best_chunk.replace('\n', ' ')
                # Snippet truncation for clean UI display
                snippet = clean_chunk if len(clean_chunk) < 150 else f"{clean_chunk[:147]}..."
                
                evidence_list.append(EvidenceMatch(
                    requirement=req,
                    evidence_quote=f"Matched from CV context: \"{snippet}\"",
                    is_matched=True
                ))
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
        "evidence": evidence_list
    }

# Agent 2: Fast Experience Evaluation
def evaluate_experience(job: JobAnalysisResult, cv: CVMetaData) -> Dict[str, Any]:
    total_exp_years = cv.total_years_experience
    min_years = job.minimum_experience_years
    job_title_lower = (job.normalized_title or "").lower()
    is_entry_or_intern = min_years <= 0 or any(kw in job_title_lower for kw in ["intern", "junior", "trainee", "associate", "entry"])

    if is_entry_or_intern:
        exp_score = 100.0 if total_exp_years > 0 else 75.0
    else:
        if min_years <= 0:
            exp_score = 100.0 if total_exp_years > 0 else 60.0
        else:
            if total_exp_years <= 0:
                exp_score = 30.0
            else:
                ratio = total_exp_years / min_years
                exp_score = min(100.0, max(50.0, ratio * 100.0))

    missing_reqs = []
    if not is_entry_or_intern and total_exp_years < min_years:
        missing_reqs.append(f"Requires {min_years} yrs, candidate has {total_exp_years} yrs.")

    return {
        "score": round(exp_score, 1),
        "total_years": total_exp_years,
        "matched_experience": [f"{total_exp_years} years of professional experience"] if total_exp_years > 0 else [],
        "missing_requirements": missing_reqs,
    }

# Agent 3: Fast Education Evaluation
def evaluate_education(job: JobAnalysisResult, cv: CVMetaData) -> Dict[str, Any]:
    score = 100.0 if cv.has_degree else 70.0
    return {"score": score}

# Agent 5: Final Decision & Score Synthesis Agent
def synthesize_screening_decision(
    job: JobAnalysisResult,
    cv: CVMetaData,
    skills_eval: Dict[str, Any],
    exp_eval: Dict[str, Any],
    edu_eval: Dict[str, Any],
    evidence: List[EvidenceMatch]
) -> ScreeningDecisionResult:
    job_title_lower = (job.normalized_title or "").lower()
    min_years = job.minimum_experience_years
    is_entry_or_intern = min_years <= 0 or any(kw in job_title_lower for kw in ["intern", "junior", "trainee", "associate", "entry"])

    skills_score = skills_eval["score"]
    exp_score = exp_eval["score"]
    edu_score = edu_eval["score"]
    
    if not evidence:
        evidence_score = 0.0
    else:
        # Since all evidence now comes from high-confidence vector matches or regex hits
        evidence_score = 80.0 

    if is_entry_or_intern:
        overall_match_score = round(
            skills_score * 0.40 +
            exp_score * 0.30 +
            edu_score * 0.15 +
            evidence_score * 0.15,
            1
        )
    else:
        overall_match_score = round(
            skills_score * 0.40 +
            exp_score * 0.30 +
            edu_score * 0.15 +
            evidence_score * 0.15,
            1
        )

    threshold = 40.0 if is_entry_or_intern else settings.CV_PASS_THRESHOLD
    has_critical_reqs = skills_eval.get("total_critical", 0) > 0
    matched_crit_cnt = skills_eval.get("matched_critical_count", 0)

    cand_exp_years = exp_eval.get("total_years", 0.0)
    has_exp_deficit = (not is_entry_or_intern) and (min_years > 0) and (cand_exp_years < (min_years * 0.75))

    knockout_reasons: List[str] = []

    if has_exp_deficit:
        knockout_reasons.append(
            f"Experience Deficit: Position requires minimum {min_years} yrs experience, but candidate has only {cand_exp_years} yrs."
        )

    if skills_score < 30.0:
        knockout_reasons.append(
            f"Skill Overlap Deficit: Candidate matched only {len(skills_eval['matched'])} skills ({skills_score}%), falling below skill requirement threshold."
        )

    if has_critical_reqs and matched_crit_cnt == 0 and not is_entry_or_intern:
        knockout_reasons.append(
            f"Critical Skill Deficit: Candidate matched 0 critical skills required for {job.normalized_title}."
        )

    if overall_match_score < threshold:
        knockout_reasons.append(
            f"Match Score Deficit: Candidate overall score ({overall_match_score}%) is below pass threshold ({threshold}%)."
        )

    qualified = len(knockout_reasons) == 0

    if qualified and overall_match_score >= 80.0:
        recommendation = "strong_match"
    elif qualified and overall_match_score >= 60.0:
        recommendation = "match"
    elif qualified and overall_match_score >= 40.0:
        recommendation = "borderline"
    else:
        recommendation = "no_match"

    if qualified:
        summary = (
            f"Candidate {cv.candidate_name} qualified for assessment for {job.normalized_title}. "
            f"Overall Match: {overall_match_score}% (Threshold: {threshold}%). "
            f"Matched {len(skills_eval['matched'])} required skills."
        )
    else:
        summary = (
            f"Candidate KNOCKED OUT for {job.normalized_title}. "
            f"Overall Score: {overall_match_score}%. Reasons: {' | '.join(knockout_reasons)}"
        )

    return ScreeningDecisionResult(
        match_score=overall_match_score,
        recommendation=recommendation,
        qualified=qualified,
        skills_score=skills_score,
        experience_score=exp_score,
        education_score=edu_score,
        relevance_score=round(evidence_score, 1),
        matched_skills=skills_eval["matched"],
        missing_skills=skills_eval["missing"],
        matched_experience=exp_eval["matched_experience"],
        missing_requirements=exp_eval["missing_requirements"] + (knockout_reasons if not qualified else []),
        evidence=evidence,
        reasoning_summary=summary
    )
