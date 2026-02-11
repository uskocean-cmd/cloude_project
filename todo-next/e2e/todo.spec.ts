import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // localStorageをクリアしてからページを開く
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('h1');
});

test.describe('TODOアプリ - タスクの追加と削除', () => {
  test('タスクを追加できる', async ({ page }) => {
    // テキストを入力して追加
    await page.getByPlaceholder('新しいタスクを入力...').fill('買い物に行く');
    await page.getByRole('button', { name: '追加' }).click();

    // タスクが表示される
    await expect(page.getByText('買い物に行く')).toBeVisible();
    // カウントが表示される
    await expect(page.getByText('1 件の未完了タスク / 全 1 件')).toBeVisible();
  });

  test('複数のタスクを追加できる', async ({ page }) => {
    const tasks = ['タスクA', 'タスクB', 'タスクC'];

    for (const task of tasks) {
      await page.getByPlaceholder('新しいタスクを入力...').fill(task);
      await page.getByRole('button', { name: '追加' }).click();
    }

    // すべてのタスクが表示される
    for (const task of tasks) {
      await expect(page.getByText(task)).toBeVisible();
    }
    await expect(page.getByText('3 件の未完了タスク / 全 3 件')).toBeVisible();
  });

  test('空のテキストではタスクが追加されない', async ({ page }) => {
    await page.getByRole('button', { name: '追加' }).click();
    // カウントが表示されない（タスクが0件）
    await expect(page.getByText(/件の未完了タスク/)).not.toBeVisible();
  });

  test('タスクを削除できる', async ({ page }) => {
    // タスクを追加
    await page.getByPlaceholder('新しいタスクを入力...').fill('削除するタスク');
    await page.getByRole('button', { name: '追加' }).click();
    await expect(page.getByText('削除するタスク')).toBeVisible();

    // 削除ボタンをクリック（hover で表示されるのでforceクリック）
    await page.getByRole('button', { name: '削除' }).click({ force: true });

    // タスクが消える
    await expect(page.getByText('削除するタスク')).not.toBeVisible();
    await expect(page.getByText(/件の未完了タスク/)).not.toBeVisible();
  });

  test('複数タスクのうち1つだけ削除できる', async ({ page }) => {
    // 2つのタスクを追加
    await page.getByPlaceholder('新しいタスクを入力...').fill('残すタスク');
    await page.getByRole('button', { name: '追加' }).click();
    await page.getByPlaceholder('新しいタスクを入力...').fill('消すタスク');
    await page.getByRole('button', { name: '追加' }).click();

    await expect(page.getByText('2 件の未完了タスク / 全 2 件')).toBeVisible();

    // 「消すタスク」の削除ボタンをクリック
    const deleteTarget = page.locator('li', { hasText: '消すタスク' });
    await deleteTarget.getByRole('button', { name: '削除' }).click({ force: true });

    // 「消すタスク」は消え、「残すタスク」は残る
    await expect(page.getByText('消すタスク')).not.toBeVisible();
    await expect(page.getByText('残すタスク')).toBeVisible();
    await expect(page.getByText('1 件の未完了タスク / 全 1 件')).toBeVisible();
  });

  test('追加後に入力フィールドがクリアされる', async ({ page }) => {
    const input = page.getByPlaceholder('新しいタスクを入力...');
    await input.fill('テストタスク');
    await page.getByRole('button', { name: '追加' }).click();

    await expect(input).toHaveValue('');
  });
});
