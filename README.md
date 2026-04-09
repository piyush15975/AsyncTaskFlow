# AsyncTaskFlow

AsyncTaskFlow is a distributed background task system built with FastAPI, Redis, Celery, and a React/Vite dashboard. It is designed for long-running work that should not block the request cycle, including text summarization and PDF article extraction tasks.

The system includes task queues, retries, a dead-letter queue, worker health checks, queue monitoring, OpenRouter status tracking, and a live frontend dashboard.

## Highlights

- FastAPI API for creating and managing asynchronous tasks
- Redis-backed queues and task metadata
- Celery workers for background processing and worker control messages
- Retry queues, scheduled retries, and DLQ support
- Circuit breaker and rate-limit aware OpenRouter integration
- React + Vite dashboard with live queue and worker monitoring

## Project Layout

- `src/api/` - FastAPI service, task APIs, queue APIs, and health endpoints
- `src/worker/` - Worker service, task execution logic, and OpenRouter integration
- `frontend/` - React dashboard used to monitor queues, workers, and task state
- `utils/` - Maintenance scripts for debugging, cleanup, and testing
- `prompts/` - Prompt templates used by task execution
- `screenshots/` - UI screenshots for reference

## Requirements

- Python 3.11 or newer
- Node.js 18 or newer
- pnpm 8 or newer
- Redis access
- An OpenRouter API key for the summarization and PDF extraction flows

## Configuration

The repository includes [`.env.example`](.env.example). Create matching `.env` files for the services you run and set at least these values:

```env
REDIS_URL=redis://<user>:<password>@<host>:<port>/0
CELERY_BROKER_URL=redis://<user>:<password>@<host>:<port>/0
CELERY_RESULT_BACKEND=redis://<user>:<password>@<host>:<port>/1
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=google/gemini-2.5-flash-lite-preview-06-17
DEBUG=true
LOG_LEVEL=INFO
```

Notes:

- If your Redis provider requires TLS, use `rediss://` instead of `redis://`.
- The API and worker both read environment values from the current working directory, so keep their `.env` files where the service is started.
- The frontend uses a Vite proxy to `http://localhost:8000`, so it can talk to the API without extra client-side configuration.

## Run Locally

### 1) Start Redis and configure env values

Make sure Redis is reachable and the required values are present in the service environment.

### 2) Run the API service

```bash
cd src/api
uv sync
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000` and the interactive docs at `http://localhost:8000/docs`.

### 3) Run the worker service

```bash
cd src/worker
uv sync
uv run celery -A main:app worker --loglevel=info --concurrency=2 --prefetch-multiplier=1
```

If you need the worker to use a different concurrency level, adjust `CELERY_WORKER_CONCURRENCY` in the environment.

### 4) Run the frontend

```bash
cd frontend
pnpm install
pnpm dev
```

The dashboard runs on `http://localhost:5173`.

## What the App Does

AsyncTaskFlow centers around two application-specific jobs:

- Text summarization tasks submitted to `POST /api/v1/tasks/summarize/`
- PDF extraction tasks submitted to `POST /api/v1/tasks/pdfxtract`

Tasks are stored in Redis, processed by workers, and tracked through queue state changes. Failed work can move through retry queues and eventually into the DLQ.

## API Overview

### Health

- `GET /health` - Full health check
- `GET /live` - Liveness probe
- `GET /ready` - Readiness probe
- `GET /` - Basic API status and docs link

### Application Tasks

- `POST /api/v1/tasks/summarize/` - Create a summarization task
- `POST /api/v1/tasks/pdfxtract` - Create a PDF extraction task

### Task Management

- `GET /api/v1/tasks/` - List tasks with filtering, sorting, and pagination
- `GET /api/v1/tasks/summaries/` - List task summaries without full payloads
- `GET /api/v1/tasks/{task_id}` - Fetch a single task
- `POST /api/v1/tasks/{task_id}/retry` - Retry a failed or DLQ task
- `POST /api/v1/tasks/requeue-orphaned` - Requeue orphaned pending tasks
- `DELETE /api/v1/tasks/{task_id}` - Delete a task and its metadata

### Queue Monitoring

- `GET /api/v1/queues/status` - Queue depth and task-state snapshot
- `GET /api/v1/queues/status/stream` - SSE stream for live queue updates
- `GET /api/v1/queues/{queue_name}/tasks` - List task IDs from a specific queue
- `GET /api/v1/queues/dlq` - Inspect dead-letter queue tasks

### Worker Management

- `GET /api/v1/workers/` - Worker health and circuit breaker status
- `POST /api/v1/workers/reset-circuit-breaker` - Reset circuit breakers on all workers
- `POST /api/v1/workers/open-circuit-breaker` - Open circuit breakers to pause processing

### OpenRouter Monitoring

- `GET /api/v1/openrouter/status` - Cached OpenRouter service status
- `GET /api/v1/openrouter/metrics` - Usage metrics and state breakdown

## Redis Data Model

AsyncTaskFlow stores queue state and telemetry in Redis keys such as:

- `tasks:pending:primary` - Primary FIFO queue
- `tasks:pending:retry` - Retry queue
- `tasks:scheduled` - Delayed retry schedule
- `dlq:tasks` - Dead-letter queue
- `task:{uuid}` - Task metadata hash
- `worker:heartbeat:{worker-id}` - Worker liveness marker
- `queue-updates` - Pub/Sub channel for live queue updates
- `openrouter:state` - Centralized OpenRouter status
- `openrouter:rate_limit_config` - Shared rate-limit configuration
- `openrouter:rate_limit:bucket` - Distributed token bucket state

## Frontend

The dashboard is a Vite app backed by React Router and a set of reusable UI components.

Useful pages:

- Dashboard overview
- Task history
- Task cleanup

The Vite dev server proxies API requests to the backend, so you can use the UI without changing client-side API URLs during local development.

## Utilities

The `utils/` directory contains scripts for common maintenance tasks, including:

- Endpoint checks
- Queue and Redis cleanup
- Counter repair and synchronization
- Task injection for testing
- OpenRouter credit monitoring
- Realtime update verification

See [utils/README.md](utils/README.md) for script-specific usage.

## Troubleshooting

- If the API starts but reports unavailable services, verify Redis connectivity and the values in your `.env` files.
- If worker startup fails, confirm that the Redis broker URL and OpenRouter API key are set correctly.
- If the frontend cannot reach the API, confirm the backend is running on port `8000` and the Vite proxy is intact.
- If you use a hosted Redis service, confirm whether the provider expects `redis://` or `rediss://`.

## License

MIT. See [LICENSE](LICENSE).
