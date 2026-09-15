import logging
from typing import Dict, Any, Tuple, Optional
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
        .select("id, job_id, organization_id, candidate_id, status")
        .eq("id", application_id)
        .limit(1)
        .execute()
    )
    if not app_res.data or len(app_res.data) == 0:
        raise ValueError(f"Application {application_id} not found.")
    app_data = app_res.data[0]

    job_id = app_data.get("job_id")
    candidate_id = app_data.get("candidate_id")

    # 2. Fetch Job
    job_res = await run_sync(
        lambda: supabase.table("jobs")
        .select("id, title, description, requirements")
        .eq("id", job_id).eq("organization_id", app_data["organization_id"])
        .limit(1)
        .execute()
    )
    if not job_res.data or len(job_res.data) == 0:
        raise ValueError(f"Job {job_id} for application {application_id} not found.")
    job_data = job_res.data[0]

    # 3. Fetch Candidate
    candidate_res = await run_sync(
        lambda: supabase.table("candidates")
        .select("id, full_name, email")
        .eq("id", candidate_id).eq("organization_id", app_data["organization_id"])
        .limit(1)
        .execute()
    )
    if not candidate_res.data or len(candidate_res.data) == 0:
        raise ValueError(f"Candidate {candidate_id} for application {application_id} not found.")
    candidate_data = candidate_res.data[0]

    return app_data, job_data, candidate_data

async def get_candidate_cv_data(application_id: str) -> Tuple[bytes, str, str, Optional[str]]:
    """
    Fetches candidate document metadata and content from `candidate_documents`.
    Returns: (file_bytes, filename, mime_type, pre_extracted_text)
    """
    supabase = get_supabase_client()
    
    docs_res = await run_sync(
        lambda: supabase.table("candidate_documents")
        .select("storage_path, extracted_text, original_filename, mime_type")
        .eq("application_id", application_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    
    if not docs_res.data or len(docs_res.data) == 0:
        raise ValueError(f"No candidate document found for application {application_id}.")
        
    doc = docs_res.data[0]
    filename = doc.get("original_filename") or "cv.pdf"
    mime_type = doc.get("mime_type") or "application/pdf"
    extracted_text = doc.get("extracted_text")
    
    if extracted_text and len(extracted_text.strip()) > 0:
        return b"", filename, mime_type, extracted_text.strip()
        
    storage_path = doc.get("storage_path")
    if not storage_path:
        raise ValueError(f"Document for application {application_id} has no storage_path and no extracted_text.")
        
    # Download file from storage
    try:
        file_res = await run_sync(
            lambda: supabase.storage.from_("candidate_documents").download(storage_path)
        )
        return file_res, filename, mime_type, None
    except Exception as e:
        logger.error(f"Failed to download CV file '{storage_path}': {e}")
        raise ValueError(f"Failed to download CV file from storage: {e}")

async def get_candidate_cv_bytes(application_id: str) -> bytes:
    """Backward-compatible helper."""
    file_bytes, _, _, pre_extracted = await get_candidate_cv_data(application_id)
    if pre_extracted:
        return pre_extracted.encode("utf-8")
    return file_bytes
