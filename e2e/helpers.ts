import { SignJWT, importPKCS8 } from 'jose';
import { randomUUID } from 'crypto';

/**
 * Generate a valid JWT token pair for E2E tests.
 *
 * Signs with the ES256 private key from JWT_PRIVATE_KEY (matching the public
 * key the proxy/backend verify with). ES256 is the only accepted algorithm.
 *
 * Returns { accessToken, refreshToken } that can be set as cookies.
 */
export interface TestAuthOptions {
  userId?: string;
  username?: string;
}

// Env vars carry PEMs on one line with literal \n escapes.
function normalizePem(pem: string): string {
  return pem.replace(/\\n/g, '\n');
}

async function getSigningKey(): Promise<Parameters<SignJWT['sign']>[0]> {
  const privateKey = process.env.JWT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error(
      'JWT_PRIVATE_KEY is required for E2E auth tokens (ES256-only; generate a pair with `make jwt-keygen` in backend/)',
    );
  }
  return importPKCS8(normalizePem(privateKey), 'ES256');
}

export async function generateTestTokens(options: TestAuthOptions = {}): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const key = await getSigningKey();
  const alg = 'ES256';
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
    .setProtectedHeader({ alg })
    .setIssuedAt(now)
    .setIssuer(issuer)
    .setAudience([audience])
    .setExpirationTime('1h')
    .setNotBefore(now)
    .sign(key);

  const refreshToken = await new SignJWT({
    jti: randomUUID(),
    sub: userId,
    sid: sessionId,
    usr: username,
    rls: ['user'],
    typ: 'refresh',
  })
    .setProtectedHeader({ alg })
    .setIssuedAt(now)
    .setIssuer(issuer)
    .setAudience([audience])
    .setExpirationTime('24h')
    .setNotBefore(now)
    .sign(key);

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
