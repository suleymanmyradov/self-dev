import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const AUTH_COOKIE_NAME = 'auth-token'

/**
 * GET /api/auth/session
 *
 * Reports whether a session cookie is present WITHOUT exposing the token to the
 * browser. Tokens live exclusively in httpOnly cookies; the client learns the
 * authenticated user via the BFF-proxied /profile/me, not from here.
 */
export async function GET() {
  const cookieStore = await cookies()
  const authenticated = !!cookieStore.get(AUTH_COOKIE_NAME)?.value

  return NextResponse.json(
    { authenticated },
    { status: authenticated ? 200 : 401 },
  )
}
