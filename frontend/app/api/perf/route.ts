import { NextResponse } from 'next/server';
import { getPublicJobBySlugAction } from '@/app/actions/jobs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'getPublicJob') {
    const slug = searchParams.get('slug') || 'senior-ai-engineer';
    
    for (let i = 0; i < 5; i++) { // Run a few times
      await getPublicJobBySlugAction(slug);
    }
    
    return NextResponse.json({ success: true, message: 'Check server console for PERF logs' });
  }

  if (action === 'submitApplication') {
    // We will just return, as submitting 5 applications would clutter the DB
    return NextResponse.json({ success: false, message: 'Run this manually via UI to avoid DB clutter' });
  }

  return NextResponse.json({ success: false, message: 'Invalid action' });
}
