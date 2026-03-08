import bcrypt from 'bcrypt';

// ソルトラウンド数（本番環境でも10が推奨値）
const SALT_ROUNDS = 10;

/**
 * 平文パスワードをbcryptでハッシュ化して返す
 * @param plaintext - ハッシュ化する平文パスワード
 * @returns bcryptでハッシュ化されたパスワード文字列
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

/**
 * 平文パスワードとハッシュを比較して一致するか返す
 * @param plaintext - 検証する平文パスワード
 * @param hash - 比較対象のbcryptハッシュ
 * @returns パスワードが一致する場合 true、一致しない場合 false
 */
export async function verifyPassword(
  plaintext: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(plaintext, hash);
  } catch {
    return false;
  }
}
