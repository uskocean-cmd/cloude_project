import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getUserId } from '@/lib/userId';

describe('getUserId', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('UUIDを生成して返す', () => {
    const userId = getUserId();
    expect(userId).toBeTruthy();
    expect(typeof userId).toBe('string');
    expect(userId.length).toBeGreaterThan(0);
  });

  it('UUID形式の文字列を返す', () => {
    const userId = getUserId();
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(userId).toMatch(uuidPattern);
  });

  it('2回呼び出しても同じ値を返す', () => {
    const first = getUserId();
    const second = getUserId();
    expect(first).toBe(second);
  });

  it('localStorageに保存される', () => {
    const userId = getUserId();
    const stored = localStorage.getItem('chatbot-user-id');
    expect(stored).toBe(userId);
  });

  it('localStorageに既存の値がある場合はそれを返す', () => {
    const existingId = 'existing-test-uuid-12345';
    localStorage.setItem('chatbot-user-id', existingId);
    const userId = getUserId();
    expect(userId).toBe(existingId);
  });
});
