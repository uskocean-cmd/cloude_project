import { NextResponse } from 'next/server';
import { verifyAccessToken, JwtPayload } from './jwt';

/**
 * AuthorizationヘッダーからBearerトークンを取得・検証してユーザー情報を返す
 * @returns 認証済みユーザーのJWTペイロード、または null（未認証の場合）
 */
export const getAuthUser = (request: Request): JwtPayload | null => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  if (!token) {
    return null;
  }

  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
};

/**
 * 認証ミドルウェア。未認証の場合は 401 レスポンスを返す。
 * @returns 認証済みユーザーのJWTペイロード、または 401 NextResponse
 */
export const requireAuth = (
  request: Request
): JwtPayload | NextResponse => {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return user;
};

/**
 * 上長権限チェックミドルウェア。
 * 未認証の場合は 401、上長でない場合は 403 レスポンスを返す。
 * @returns 認証済み上長ユーザーのJWTペイロード、または 401/403 NextResponse
 */
export const requireSupervisor = (
  request: Request
): JwtPayload | NextResponse => {
  const result = requireAuth(request);

  if (result instanceof NextResponse) {
    return result;
  }

  if (!result.isSupervisor) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return result;
};
