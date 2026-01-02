// TypeScript definitions for Frappe Gantt
// Project: https://github.com/frappe/gantt
// Definitions by: Claude Code

declare module 'frappe-gantt' {
  export interface FrappeGanttTask {
    id: string;
    name: string;
    start: string; // 'YYYY-MM-DD' format
    end: string; // 'YYYY-MM-DD' format
    progress: number; // 0-100
    dependencies?: string; // Comma-separated task IDs: "task1,task2"
    custom_class?: string; // CSS classes for custom styling
  }

  export type ViewMode = 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month' | 'Year';

  export interface GanttConfig {
    header_height?: number;
    column_width?: number;
    step?: number;
    view_modes?: ViewMode[];
    bar_height?: number;
    bar_corner_radius?: number;
    arrow_curve?: number;
    padding?: number;
    view_mode?: ViewMode;
    date_format?: string;
    popup_trigger?: 'click' | 'hover';
    language?: string;
    custom_popup_html?: (task: FrappeGanttTask) => string;
    on_click?: (task: FrappeGanttTask) => void;
    on_date_change?: (task: FrappeGanttTask, start: Date, end: Date) => void;
    on_progress_change?: (task: FrappeGanttTask, progress: number) => void;
    on_view_change?: (mode: ViewMode) => void;
  }

  export default class Gantt {
    constructor(selector: string, tasks: FrappeGanttTask[], config?: GanttConfig);

    change_view_mode(mode: ViewMode): void;
    refresh(tasks: FrappeGanttTask[]): void;
    clear(): void;
  }
}
