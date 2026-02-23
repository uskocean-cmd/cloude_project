/**
 * 日付をYYYY-MM-DD形式にフォーマットする
 */
export const formatDate = (date: Date | null): string => {
  if (!date) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * 営業日（平日）かどうかを判定する
 */
export const isBusinessDay = (date: Date): boolean => {
  const dayOfWeek = date.getDay();
  return dayOfWeek !== 0 && dayOfWeek !== 6; // 0: 日曜日, 6: 土曜日
};

/**
 * 指定した日付を含む週の範囲（月曜〜金曜）を取得する
 */
export const getWeekRange = (date: Date): { start: Date; end: Date } => {
  const current = new Date(date);
  const dayOfWeek = current.getDay();

  // 月曜日を週の開始とする（0: 日曜, 1: 月曜, ..., 6: 土曜）
  const monday = new Date(current);
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(current.getDate() + diff);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  return { start: monday, end: friday };
};
