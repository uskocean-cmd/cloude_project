import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../password';

describe('hashPassword', () => {
  it('平文パスワードをbcryptハッシュ（$2b$始まり）に変換すること', async () => {
    const hash = await hashPassword('password123');
    expect(hash).toMatch(/^\$2b\$/);
  });

  it('ハッシュ文字列が元のパスワードと異なること', async () => {
    const plaintext = 'password123';
    const hash = await hashPassword(plaintext);
    expect(hash).not.toBe(plaintext);
  });

  it('同じパスワードでハッシュを2回生成すると異なる値になること（ソルトの検証）', async () => {
    const password = 'samePassword';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    // bcryptはソルトをランダム生成するため、同じパスワードでも異なるハッシュになる
    expect(hash1).not.toBe(hash2);
  });

  it('空文字のハッシュ化が正常に動作すること（境界値）', async () => {
    const hash = await hashPassword('');
    expect(hash).toMatch(/^\$2b\$/);
  });

  it('72文字を超える長いパスワードのハッシュ化が正常に動作すること（境界値）', async () => {
    // bcryptは最大72バイト処理するが、それ以上の文字列も例外を投げずに処理する
    const longPassword = 'a'.repeat(100);
    const hash = await hashPassword(longPassword);
    expect(hash).toMatch(/^\$2b\$/);
  });
});

describe('verifyPassword', () => {
  it('正しいパスワードとハッシュを比較するとtrueを返すこと', async () => {
    const plaintext = 'password123';
    const hash = await hashPassword(plaintext);
    const result = await verifyPassword(plaintext, hash);
    expect(result).toBe(true);
  });

  it('誤ったパスワードとハッシュを比較するとfalseを返すこと', async () => {
    const hash = await hashPassword('password123');
    const result = await verifyPassword('wrongpassword', hash);
    expect(result).toBe(false);
  });

  it('空文字のパスワードを正しいパスワードのハッシュと比較するとfalseを返すこと', async () => {
    const hash = await hashPassword('password123');
    const result = await verifyPassword('', hash);
    expect(result).toBe(false);
  });

  it('不正なハッシュ文字列を渡してもエラーにならずfalseを返すこと', async () => {
    const result = await verifyPassword('password123', 'invalid-hash');
    expect(result).toBe(false);
  });

  it('ハッシュ化した空文字を空文字で検証するとtrueを返すこと', async () => {
    const hash = await hashPassword('');
    const result = await verifyPassword('', hash);
    expect(result).toBe(true);
  });

  it('異なるハッシュから生成されたハッシュでも同じパスワードならtrueを返すこと', async () => {
    const password = 'samePassword';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    // 異なるハッシュでも元のパスワードが同じなら検証はtrueになる
    const result1 = await verifyPassword(password, hash1);
    const result2 = await verifyPassword(password, hash2);
    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });
});
