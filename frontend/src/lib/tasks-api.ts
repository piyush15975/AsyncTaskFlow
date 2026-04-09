import {
  type TaskDeleteResponse,
  type TaskDetail,
  type TaskSummaryListResponse,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchTaskSummaries(
  params: Record<string, unknown>,
): Promise<TaskSummaryListResponse> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return requestJson<TaskSummaryListResponse>(
    `/api/v1/tasks/summaries/${query ? `?${query}` : ''}`,
  );
}

export async function fetchTaskDetail(taskId: string): Promise<TaskDetail> {
  return requestJson<TaskDetail>(`/api/v1/tasks/${encodeURIComponent(taskId)}`);
}

export async function deleteTask(taskId: string): Promise<TaskDeleteResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/tasks/${encodeURIComponent(taskId)}`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<TaskDeleteResponse>;
}
