import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/revalidate?tag=articles
// Header: x-revalidate-secret must match the REVALIDATE_SECRET env var.
//
// 'use cache' content (articles, categories, templates, site settings) is
// written via adminway straight into the DB, so Next.js has no way to know it
// changed. Hit this endpoint after admin edits to invalidate the stale cache
// instead of waiting for cacheLife('hours'/'days') to expire.
const ALLOWED_TAGS = new Set([
  'articles',
  'categories',
  'site-settings',
  'habit-templates',
  'goal-templates',
]);

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'revalidation not configured' }, { status: 503 });
  }
  if (req.headers.get('x-revalidate-secret') !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const tag = req.nextUrl.searchParams.get('tag') ?? 'articles';
  if (!ALLOWED_TAGS.has(tag) && !tag.startsWith('article:')) {
    return NextResponse.json({ error: 'unknown tag' }, { status: 400 });
  }

  revalidateTag(tag, 'max');
  return NextResponse.json({ revalidated: true, tag });
}
