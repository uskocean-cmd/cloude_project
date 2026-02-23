import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
  isSupervisor: boolean;
  iat?: number;
  exp?: number;
}

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'default-access-secret-for-dev';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-for-dev';
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * アクセストークンを生成する
 */
export const signAccessToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  } as jwt.SignOptions);
};

/**
 * リフレッシュトークンを生成する
 */
export const signRefreshToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  } as jwt.SignOptions);
};

/**
 * アクセストークンを検証してデコードする
 * @throws {JsonWebTokenError} トークンが無効な場合
 * @throws {TokenExpiredError} トークンが期限切れの場合
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
  return decoded as JwtPayload;
};

/**
 * リフレッシュトークンを検証してデコードする
 * @throws {JsonWebTokenError} トークンが無効な場合
 * @throws {TokenExpiredError} トークンが期限切れの場合
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
  return decoded as JwtPayload;
};
