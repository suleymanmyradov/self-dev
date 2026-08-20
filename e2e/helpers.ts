import { SignJWT } from 'jose';
import { randomUUID } from 'crypto';

/**
 * Generate a valid JWT token pair for E2E tests.
 *
 * Uses the same JWT_SECRET as the frontend proxy (from .env.local) so the
 * proxy's checkToken() will validate the token as 'valid'.
 *
 * Returns { accessToken, refreshToken } that can be set as cookies.
 */
export interface TestAuthOptions {
  userId?: string;
  username?: string;
}

export async function generateTestTokens(options: TestAuthOptions = {}): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET ||
      '36be8f513d378b3e8560303d509a7a540385bc50b717c3d487c788210703390b',
  );
  const issuer = process.env.JWT_ISSUER || 'growth-auth';
  const audience = process.env.JWT_AUDIENCE || 'growth-api';

  const userId = options.userId ?? randomUUID();
  const username = options.username ?? 'e2e-test-user';
  const sessionId = randomUUID();
  const now = Math.floor(Date.now() / 1000);

  const accessToken = await new SignJWT({
    jti: randomUUID(),
    sub: userId,
    sid: sessionId,
    usr: username,
    rls: ['user'],
    typ: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setIssuer(issuer)
    .setAudience([audience])
    .setExpirationTime('1h')
    .setNotBefore(now)
    .sign(secret);

  const refreshToken = await new SignJWT({
    jti: randomUUID(),
    sub: userId,
    sid: sessionId,
    usr: username,
    rls: ['user'],
    typ: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setIssuer(issuer)
    .setAudience([audience])
    .setExpirationTime('24h')
    .setNotBefore(now)
    .sign(secret);

  return { accessToken, refreshToken };
}

/**
 * Set auth cookies on the browser context for an authenticated E2E session.
 */
export async function setAuthCookies(
  page: import('@playwright/test').Page,
  options: TestAuthOptions = {},
): Promise<void> {
  const { accessToken, refreshToken } = await generateTestTokens(options);
  await page.context().addCookies([
    {
      name: 'auth-token',
      value: accessToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
    {
      name: 'refresh-token',
      value: refreshToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
}
