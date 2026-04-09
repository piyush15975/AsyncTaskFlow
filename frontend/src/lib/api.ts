import {
  type OpenRouterStatus,
  type QueueStatus,
  type SSEMessage,
  type WorkerDetail,
  type WorkerStatus,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export class ApiService {
  async getQueueStatus(): Promise<QueueStatus> {
    return requestJson<QueueStatus>('/api/v1/queues/status');
  }

  async getWorkerStatus(): Promise<WorkerStatus> {
    return requestJson<WorkerStatus>('/api/v1/workers/');
  }

  async getOpenRouterStatus(): Promise<OpenRouterStatus> {
    return requestJson<OpenRouterStatus>('/api/v1/openrouter/status');
  }

  createSSEConnection(
    onMessage: (data: SSEMessage) => void,
    onError?: (error: Event) => void,
  ): EventSource {
    const eventSource = new EventSource(`${API_BASE_URL}/api/v1/queues/status/stream`);

    eventSource.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data) as SSEMessage);
      } catch {
        onMessage({ type: 'error', message: 'Failed to parse SSE message' });
      }
    };

    if (onError) {
      eventSource.onerror = onError;
    }

    return eventSource;
  }
}

export const apiService = new ApiService();

export type { OpenRouterStatus, QueueStatus, SSEMessage, WorkerDetail, WorkerStatus };
