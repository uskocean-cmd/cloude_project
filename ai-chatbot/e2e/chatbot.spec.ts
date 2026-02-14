import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.evaluate(() => localStorage.clear());
});

test.describe('キャラクター選択画面', () => {
  test('タイトルとキャラクターカードが表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Steampunk AI Chat')).toBeVisible();
    await expect(page.getByText('アーサー・コグウェル')).toBeVisible();
    await expect(page.getByText('リヴェット')).toBeVisible();
    await expect(page.getByText('ネビュラ卿')).toBeVisible();
  });

  test('サブタイトルが表示される', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByText('キャラクターを選んで会話を始めましょう')
    ).toBeVisible();
  });

  test('各キャラクターの説明文が表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/天才発明家/)).toBeVisible();
    await expect(page.getByText(/機械工の少女/)).toBeVisible();
    await expect(page.getByText(/空中都市の探検家/)).toBeVisible();
  });
});

test.describe('チャット画面遷移', () => {
  test('キャラクターをクリックするとチャット画面に遷移する', async ({ page }) => {
    // APIをモックして会話作成を模擬
    await page.route('**/api/conversations', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            _id: 'mock-conv-id',
            userId: 'test-user',
            characterId: 'arthur',
            title: '新しい会話',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
    });

    await page.route('**/api/conversations/mock-conv-id', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _id: 'mock-conv-id',
          userId: 'test-user',
          characterId: 'arthur',
          title: '新しい会話',
          messages: [],
        }),
      });
    });

    await page.goto('/');
    await page.getByText('アーサー・コグウェル').click();

    await expect(page).toHaveURL(/\/chat\/mock-conv-id/);
    await expect(page.getByText('アーサー・コグウェル')).toBeVisible();
  });
});

test.describe('チャット画面UI', () => {
  test.beforeEach(async ({ page }) => {
    // API モック
    await page.route('**/api/conversations?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/api/conversations/test-conv', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _id: 'test-conv',
          userId: 'test-user',
          characterId: 'arthur',
          title: 'テスト会話',
          messages: [],
        }),
      });
    });
  });

  test('メッセージ入力欄と送信ボタンが表示される', async ({ page }) => {
    await page.goto('/chat/test-conv');
    await expect(page.getByPlaceholder('メッセージを入力...')).toBeVisible();
    await expect(page.getByRole('button', { name: '送信' })).toBeVisible();
  });

  test('空のメッセージでは送信ボタンが無効', async ({ page }) => {
    await page.goto('/chat/test-conv');
    const sendButton = page.getByRole('button', { name: '送信' });
    await expect(sendButton).toBeDisabled();
  });

  test('テキストを入力すると送信ボタンが有効になる', async ({ page }) => {
    await page.goto('/chat/test-conv');
    const textarea = page.getByPlaceholder('メッセージを入力...');
    await textarea.fill('テストメッセージ');
    const sendButton = page.getByRole('button', { name: '送信' });
    await expect(sendButton).toBeEnabled();
  });
});
