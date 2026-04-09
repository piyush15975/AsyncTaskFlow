export enum TaskState {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SCHEDULED = 'SCHEDULED',
  DLQ = 'DLQ',
}

export enum TaskType {
  SUMMARIZE = 'summarize',
  PDFXTRACT = 'pdfxtract',
}

export interface TaskSummary {
  task_id: string;
  state: TaskState;
  retry_count: number;
  max_retries: number;
  last_error?: string | null;
  error_type?: string | null;
  retry_after?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  task_type?: TaskType | null;
  content_length?: number | null;
  has_result: boolean;
  error_history: TaskErrorHistoryEntry[];
  state_history: TaskStateHistoryEntry[];
}

export interface TaskDetail extends TaskSummary {
  content: string;
  result?: string | null;
}

export interface TaskStateHistoryEntry {
  state: TaskState;
  timestamp: string;
  [key: string]: unknown;
}

export interface TaskErrorHistoryEntry {
  timestamp?: string;
  message?: string;
  error?: string;
  [key: string]: unknown;
}

export interface TaskSummaryListResponse {
  tasks: TaskSummary[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  status?: TaskState | null;
}

export interface TaskListResponse {
  tasks: TaskDetail[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  status?: TaskState | null;
}

export interface TaskDeleteResponse {
  task_id: string;
  message: string;
}

export interface QueueStatus {
  queues: {
    primary: number;
    retry: number;
    scheduled: number;
    dlq: number;
    [key: string]: number;
  };
  states: Record<string, number>;
  retry_ratio: number;
}

export interface OpenRouterStatus {
  status: string;
  message: string;
  balance?: number | null;
  usage_today?: number | null;
  usage_month?: number | null;
  last_check?: string | null;
  error_details?: string | null;
  consecutive_failures?: number | null;
  circuit_breaker_open?: boolean | null;
  cache_hit?: boolean | null;
}

export interface WorkerDetail {
  worker_id: string;
  worker_name?: string;
  status: string;
  last_heartbeat?: string | number | null;
  timestamp?: string | number | null;
  heartbeat_age_seconds?: number | null;
  error?: string | null;
  circuit_breaker: {
    state: string;
    note?: string;
    success_count?: number;
    fail_count?: number;
  };
}

export interface WorkerStatus {
  overall_status: string;
  total_workers: number;
  healthy_workers: number;
  stale_workers: number;
  circuit_breaker_states: Record<string, number>;
  worker_details: WorkerDetail[];
  timestamp: string;
  error?: string;
}

export interface SSEMessage {
  type: 'initial_status' | 'queue_update' | 'heartbeat' | 'error' | 'fatal_error' | string;
  message?: string;
  queue_depths?: QueueStatus['queues'];
  state_counts?: QueueStatus['states'];
  retry_ratio?: number;
  timestamp?: string | number;
}
