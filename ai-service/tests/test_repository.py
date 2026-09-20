import asyncio
from types import SimpleNamespace
from unittest.mock import MagicMock, patch
import pytest
from app.repositories.application_repo import get_application_context, get_candidate_cv_data

@pytest.mark.asyncio
async def test_application_context_parallel_reads_preserve_tenant_scope():
    app = {'id':'application','organization_id':'org','job_id':'job','candidate_id':'candidate'}
    results = {'applications':app,'jobs':{'id':'job'},'candidates':{'id':'candidate'}}
    queries = {}
    for table, row in results.items():
        q=MagicMock()
        q.select.return_value=q; q.eq.return_value=q; q.limit.return_value=q
        q.execute.return_value=SimpleNamespace(data=[row])
        queries[table]=q
    db=MagicMock(); db.table.side_effect=lambda table:queries[table]
    both_started=asyncio.Event(); child_reads=0
    async def run(fn):
        nonlocal child_reads
        result=fn()
        if result.data[0]['id']!='application':
            child_reads+=1
            if child_reads==2: both_started.set()
            await asyncio.wait_for(both_started.wait(),1)
        return result
    with patch('app.repositories.application_repo.get_supabase_client',return_value=db),patch('app.repositories.application_repo.run_sync',side_effect=run):
        data=await get_application_context('application')
    assert data==(app,results['jobs'],results['candidates'])
    for table in ['jobs','candidates']:
        queries[table].eq.assert_any_call('organization_id','org')

@pytest.mark.asyncio
async def test_saved_resume_text_skips_storage_download():
    db=MagicMock(); q=db.table.return_value
    q.select.return_value=q; q.eq.return_value=q; q.order.return_value=q; q.limit.return_value=q
    q.execute.return_value=SimpleNamespace(data=[{'extracted_text':'Saved evidence','original_filename':'resume.pdf','mime_type':'application/pdf'}])
    with patch('app.repositories.application_repo.get_supabase_client',return_value=db):
        content, _, _, text=await get_candidate_cv_data('application')
    assert content==b'' and text=='Saved evidence'
    db.storage.from_.assert_not_called()
