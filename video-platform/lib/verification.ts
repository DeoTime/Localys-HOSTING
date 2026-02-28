import { createHmac, timingSafeEqual } from 'crypto';

const getSecret = () =>
  process.env.ORDER_VERIFICATION_SECRET || 'dev-secret-change-in-production';

export function generateToken(orderId: string): string {
  return createHmac('sha256', getSecret()).update(orderId).digest('hex');
}

export function verifyToken(orderId: string, token: string): boolean {
  const expected = generateToken(orderId);
  if (expected.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}
