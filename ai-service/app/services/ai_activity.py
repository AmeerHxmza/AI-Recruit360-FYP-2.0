import logging
from typing import Optional, Dict, Any
from app.db.supabase import get_supabase_client, run_sync

logger = logging.getLogger("ai_service.services.ai_activity")

async def log_ai_activity(
    application_id: str,
    event_type: str,
    organization_id: Optional[str] = None,
    status: str = "success",
    metadata: Optional[Dict[str, Any]] = None,
    duration_ms: Optional[int] = None
) -> None:
    """
    Log an AI activity event to the Supabase ai_activity_logs table.
    
    :param application_id: Associated candidate application ID
    :param event_type: Event type (e.g. cv_screened, assessment_generated, etc.)
    :param organization_id: Organization ID (optional, but highly recommended for RLS)
    :param status: Status of the event (success, error, failed)
    :param metadata: Any additional JSON metadata (e.g. score, model used)
    :param duration_ms: Duration of the AI operation in milliseconds
    """
    supabase = get_supabase_client()
    
    payload = {
        "application_id": application_id,
        "event_type": event_type,
        "status": status,
        "metadata": metadata or {}
    }
    
    if not organization_id and application_id:
        try:
            app_lookup = await run_sync(
                lambda: supabase.table("applications").select("organization_id").eq("id", application_id).limit(1).execute()
            )
            if app_lookup.data and len(app_lookup.data) > 0:
                organization_id = app_lookup.data[0].get("organization_id")
        except Exception:
            pass

    if organization_id:
        payload["organization_id"] = organization_id
    else:
        logger.warning(f"Skipping ai_activity_logs insert for app {application_id}: missing organization_id")
        return

    if duration_ms is not None:
        payload["metadata"]["duration_ms"] = duration_ms

    try:
        await run_sync(
            lambda: supabase.table("ai_activity_logs").insert(payload).execute()
        )
    except Exception as e:
        logger.error(f"Failed to log AI activity '{event_type}' for app {application_id}: {e}")
