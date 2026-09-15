from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

def test_liveness_needs_no_database():
    assert TestClient(app).get("/api/v1/health/live").json()=={"status":"alive"}

def test_readiness_reports_database_outage():
    with patch("app.api.routes.health.get_supabase_client",side_effect=RuntimeError("Unavailable")):
        response=TestClient(app).get("/api/v1/health")
    assert response.status_code==503
    assert response.json()["dependencies"]["supabase"]=="unavailable"

def test_service_endpoints_require_secret(monkeypatch):
    monkeypatch.setattr(settings,"AI_SERVICE_SHARED_SECRET","test-secret-"*4)
    response=TestClient(app).post("/api/v1/interviews/initialize",json={"application_id":"app"})
    assert response.status_code==401

def test_missing_configuration_fails_closed(monkeypatch):
    monkeypatch.setattr(settings,"AI_SERVICE_SHARED_SECRET","")
    response=TestClient(app).post("/api/v1/interviews/initialize",json={"application_id":"app"})
    assert response.status_code==503
