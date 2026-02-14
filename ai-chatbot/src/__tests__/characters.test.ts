import { describe, it, expect } from 'vitest';
import { CHARACTERS, getCharacterById } from '@/lib/characters';

describe('CHARACTERS', () => {
  it('3体のキャラクターが定義されている', () => {
    expect(CHARACTERS).toHaveLength(3);
  });

  it('各キャラクターに必要なフィールドがすべて存在する', () => {
    for (const character of CHARACTERS) {
      expect(character.id).toBeTruthy();
      expect(character.name).toBeTruthy();
      expect(character.description).toBeTruthy();
      expect(character.avatar).toBeTruthy();
      expect(character.systemPrompt).toBeTruthy();
      expect(character.color).toBeTruthy();
    }
  });

  it('全キャラクターのIDがユニークである', () => {
    const ids = CHARACTERS.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('アーサー・コグウェルのキャラクター情報が正しい', () => {
    const arthur = CHARACTERS.find((c) => c.id === 'arthur');
    expect(arthur).toBeDefined();
    expect(arthur!.name).toBe('アーサー・コグウェル');
    expect(arthur!.systemPrompt).toContain('発明家');
    expect(arthur!.color).toBe('#c8a86e');
  });

  it('リヴェットのキャラクター情報が正しい', () => {
    const rivet = CHARACTERS.find((c) => c.id === 'rivet');
    expect(rivet).toBeDefined();
    expect(rivet!.name).toBe('リヴェット');
    expect(rivet!.systemPrompt).toContain('機械工');
    expect(rivet!.color).toBe('#d4a84b');
  });

  it('ネビュラ卿のキャラクター情報が正しい', () => {
    const nebula = CHARACTERS.find((c) => c.id === 'nebula');
    expect(nebula).toBeDefined();
    expect(nebula!.name).toBe('ネビュラ卿');
    expect(nebula!.systemPrompt).toContain('探検家');
    expect(nebula!.color).toBe('#6b9dba');
  });

  it('各キャラクターのsystemPromptに日本語応答の指示が含まれる', () => {
    for (const character of CHARACTERS) {
      expect(character.systemPrompt).toContain('日本語で応答');
    }
  });

  it('各キャラクターのavatarパスがSVGファイルを指している', () => {
    for (const character of CHARACTERS) {
      expect(character.avatar).toMatch(/^\/avatars\/.+\.svg$/);
    }
  });
});

describe('getCharacterById', () => {
  it('有効なIDで正しいキャラクターを返す', () => {
    const arthur = getCharacterById('arthur');
    expect(arthur).toBeDefined();
    expect(arthur!.name).toBe('アーサー・コグウェル');
  });

  it('各キャラクターIDで正しいキャラクターを取得できる', () => {
    expect(getCharacterById('arthur')!.id).toBe('arthur');
    expect(getCharacterById('rivet')!.id).toBe('rivet');
    expect(getCharacterById('nebula')!.id).toBe('nebula');
  });

  it('無効なIDの場合undefinedを返す', () => {
    expect(getCharacterById('nonexistent')).toBeUndefined();
  });

  it('空文字列の場合undefinedを返す', () => {
    expect(getCharacterById('')).toBeUndefined();
  });
});
