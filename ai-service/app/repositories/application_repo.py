import logging
from typing import Dict, Any, Tuple
from app.db.supabase import get_supabase_client, run_sync

logger = logging.getLogger("ai_service.repositories.application_repo")

async def get_application_context(application_id: str) -> Tuple[Dict[str, Any], Dict[str, Any], Dict[str, Any]]:
    """
    Retrieves the application, job, and candidate records from Supabase.
    Raises ValueError if any required record is missing.
    """
    supabase = get_supabase_client()

    # 1. Fetch Application
    app_res = await run_sync(
        lambda: supabase.table("applications")
        .select("*")
        .eq("id", application_id)
        .single()
        .execute()
    )
    if not app_res.data:
        raise ValueError(f"Application {application_id} not found.")
    app_data = app_res.data

    job_id = app_data.get("job_id")
    candidate_id = app_data.get("candidate_id")

    # 2. Fetch Job
    job_res = await run_sync(
        lambda: supabase.table("jobs")
        .select("id, title, description, requirements")
        .eq("id", job_id)
        .single()
        .execute()
    )
    if not job_res.data:
        raise ValueError(f"Job {job_id} for application {application_id} not found.")
    job_data = job_res.data

    # 3. Fetch Candidate
    candidate_res = await run_sync(
        lambda: supabase.table("candidates")
        .select("id, full_name, email")
        .eq("id", candidate_id)
        .single()
        .execute()
    )
    if not candidate_res.data:
        raise ValueError(f"Candidate {candidate_id} for application {application_id} not found.")
    candidate_data = candidate_res.data

    return app_data, job_data, candidate_data

async def get_candidate_cv_bytes(application_id: str) -> bytes:
    """
    Fetches the candidate document path from `candidate_documents` and downloads
    the file bytes securely from Supabase Storage `candidate_documents` bucket.
    """
    supabase = get_supabase_client()
    
    docs_res = await run_sync(
        lambda: supabase.table("candidate_documents")
        .select("file_path, extracted_text")
        .eq("application_id", application_id)
        .execute()
    )
    
    if not docs_res.data:
        raise ValueError(f"No candidate document found for application {application_id}.")
        
    doc = docs_res.data[0]
    file_path = doc.get("file_path")
    
    if not file_path:
        # Fallback to returning the extracted text as bytes (if previously extracted and no file path exists)
        extracted_text = doc.get("extracted_text")
        if extracted_text:
            return extracted_text.encode("utf-8")
        raise ValueError(f"Document for application {application_id} has no file_path and no extracted_text.")
        
    # Download file from storage
    try:
        file_res = await run_sync(
            lambda: supabase.storage.from_("candidate_documents").download(file_path)
        )
        return file_res
    except Exception as e:
        logger.error(f"Failed to download CV file '{file_path}': {e}")
        raise ValueError(f"Failed to download CV file from storage: {e}")
