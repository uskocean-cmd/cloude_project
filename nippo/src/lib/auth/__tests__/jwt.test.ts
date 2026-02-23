import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  JwtPayload,
} from '../jwt';

describe('JWT Utilities', () => {
  const testPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
    userId: 'user-123',
    email: 'test@example.com',
    isSupervisor: false,
  };

  const supervisorPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
    userId: 'supervisor-456',
    email: 'supervisor@example.com',
    isSupervisor: true,
  };

  describe('signAccessToken', () => {
    it('有効なアクセストークンを生成する', () => {
      const token = signAccessToken(testPayload);

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT形式: header.payload.signature
    });

    it('上長ユーザーのアクセストークンを生成する', () => {
      const token = signAccessToken(supervisorPayload);

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('有効なアクセストークンを検証してペイロードを返す', () => {
      const token = signAccessToken(testPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe('user-123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.isSupervisor).toBe(false);
    });

    it('上長フラグが正しくエンコード・デコードされる', () => {
      const token = signAccessToken(supervisorPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe('supervisor-456');
      expect(decoded.email).toBe('supervisor@example.com');
      expect(decoded.isSupervisor).toBe(true);
    });

    it('デコード済みトークンに iat と exp フィールドが含まれる', () => {
      const beforeSign = Math.floor(Date.now() / 1000);
      const token = signAccessToken(testPayload);
      const afterSign = Math.floor(Date.now() / 1000);

      const decoded = verifyAccessToken(token);

      expect(decoded.iat).toBeGreaterThanOrEqual(beforeSign);
      expect(decoded.iat).toBeLessThanOrEqual(afterSign + 1);
      expect(decoded.exp).toBeGreaterThan(decoded.iat!);
    });

    it('改ざんされたアクセストークンは例外をスローする', () => {
      const token = signAccessToken(testPayload);
      const parts = token.split('.');
      // ペイロード部分を改ざん
      const tamperedPayload = Buffer.from(
        JSON.stringify({ userId: 'attacker', email: 'hacker@evil.com', isSupervisor: true })
      ).toString('base64url');
      const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

      expect(() => verifyAccessToken(tamperedToken)).toThrow();
    });

    it('不正な文字列はアクセストークン検証で例外をスローする', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow();
      expect(() => verifyAccessToken('')).toThrow();
      expect(() => verifyAccessToken('a.b.c')).toThrow();
    });

    it('期限切れのアクセストークンは例外をスローする', () => {
      // 過去に期限切れとなるトークンを直接生成する
      const secret = process.env.JWT_SECRET || 'default-access-secret-for-dev';
      const expiredToken = jwt.sign(
        { userId: 'user-123', email: 'test@example.com', isSupervisor: false },
        secret,
        { expiresIn: -1 } // 即時期限切れ
      );

      expect(() => verifyAccessToken(expiredToken)).toThrow(jwt.TokenExpiredError);
    });

    it('リフレッシュトークン用の秘密鍵で署名されたトークンはアクセストークン検証で例外をスローする', () => {
      const refreshToken = signRefreshToken(testPayload);

      expect(() => verifyAccessToken(refreshToken)).toThrow();
    });
  });

  describe('signRefreshToken', () => {
    it('有効なリフレッシュトークンを生成する', () => {
      const token = signRefreshToken(testPayload);

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyRefreshToken', () => {
    it('有効なリフレッシュトークンを検証してペイロードを返す', () => {
      const token = signRefreshToken(testPayload);
      const decoded = verifyRefreshToken(token);

      expect(decoded.userId).toBe('user-123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.isSupervisor).toBe(false);
    });

    it('上長フラグがリフレッシュトークンにも正しくエンコードされる', () => {
      const token = signRefreshToken(supervisorPayload);
      const decoded = verifyRefreshToken(token);

      expect(decoded.isSupervisor).toBe(true);
    });

    it('デコード済みリフレッシュトークンに iat と exp フィールドが含まれる', () => {
      const beforeSign = Math.floor(Date.now() / 1000);
      const token = signRefreshToken(testPayload);
      const afterSign = Math.floor(Date.now() / 1000);

      const decoded = verifyRefreshToken(token);

      expect(decoded.iat).toBeGreaterThanOrEqual(beforeSign);
      expect(decoded.iat).toBeLessThanOrEqual(afterSign + 1);
      expect(decoded.exp).toBeGreaterThan(decoded.iat!);
    });

    it('改ざんされたリフレッシュトークンは例外をスローする', () => {
      const token = signRefreshToken(testPayload);
      const parts = token.split('.');
      const tamperedPayload = Buffer.from(
        JSON.stringify({ userId: 'attacker', email: 'hacker@evil.com', isSupervisor: true })
      ).toString('base64url');
      const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

      expect(() => verifyRefreshToken(tamperedToken)).toThrow();
    });

    it('不正な文字列はリフレッシュトークン検証で例外をスローする', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
      expect(() => verifyRefreshToken('')).toThrow();
    });

    it('期限切れのリフレッシュトークンは例外をスローする', () => {
      const secret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-for-dev';
      const expiredToken = jwt.sign(
        { userId: 'user-123', email: 'test@example.com', isSupervisor: false },
        secret,
        { expiresIn: -1 }
      );

      expect(() => verifyRefreshToken(expiredToken)).toThrow(jwt.TokenExpiredError);
    });

    it('アクセストークン用の秘密鍵で署名されたトークンはリフレッシュトークン検証で例外をスローする', () => {
      const accessToken = signAccessToken(testPayload);

      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
  });

  describe('アクセストークンとリフレッシュトークンの独立性', () => {
    it('アクセストークンとリフレッシュトークンは互いに検証できない', () => {
      const accessToken = signAccessToken(testPayload);
      const refreshToken = signRefreshToken(testPayload);

      // アクセストークンをリフレッシュトークン検証で使用すると失敗する
      expect(() => verifyRefreshToken(accessToken)).toThrow();
      // リフレッシュトークンをアクセストークン検証で使用すると失敗する
      expect(() => verifyAccessToken(refreshToken)).toThrow();
    });
  });
});
