import { SignJWT, importPKCS8 } from 'jose';
import { randomUUID } from 'crypto';

/**
 * Generate a valid JWT token pair for E2E tests.
 *
 * Signs with the ES256 private key from JWT_PRIVATE_KEY (matching the public
 * key the proxy/backend verify with). Falls back to the legacy HS256
 * JWT_SECRET for environments that haven't migrated yet.
 *
 * Returns { accessToken, refreshToken } that can be set as cookies.
 */
export interface TestAuthOptions {
  userId?: string;
  username?: string;
}

interface SigningKey {
  key: Parameters<SignJWT['sign']>[0];
  alg: 'ES256' | 'HS256';
}

// Env vars carry PEMs on one line with literal \n escapes.
function normalizePem(pem: string): string {
  return pem.replace(/\\n/g, '\n');
}

async function getSigningKey(): Promise<SigningKey> {
  const privateKey = process.env.JWT_PRIVATE_KEY;
  if (privateKey) {
    return { key: await importPKCS8(normalizePem(privateKey), 'ES256'), alg: 'ES256' };
  }
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET ||
      '36be8f513d378b3e8560303d509a7a540385bc50b717c3d487c788210703390b',
  );
  return { key: secret, alg: 'HS256' };
}

export async function generateTestTokens(options: TestAuthOptions = {}): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const { key, alg } = await getSigningKey();
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
