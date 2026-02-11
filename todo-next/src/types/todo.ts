export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  startDate?: string;
  endDate?: string;
}

export type FilterType = 'all' | 'active' | 'completed';
