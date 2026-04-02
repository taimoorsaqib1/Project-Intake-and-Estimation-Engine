# AI-Powered Project Intake and Estimation Engine

A full-stack Next.js application that accepts project briefs (via web form or webhook), runs them through an AI pipeline to produce effort estimates and tech recommendations, and gives an internal team a real-time dashboard to review, assign, and progress briefs through a sales pipeline.

---

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables and fill in your values
cp .env.example .env.local

# Push the database schema
npx prisma db push

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | NextAuth JWT signing secret |
| `NEXTAUTH_URL` | Canonical URL of the app |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `DEEPSEEK_API_KEY` | DeepSeek API key (preferred AI provider) |
| `OPENAI_API_KEY` | OpenAI fallback key (used when DeepSeek key is absent) |
| `WEBHOOK_SECRET` | HMAC-SHA256 secret for the intake webhook |

---

## Architecture

### Data Model Decisions

The schema is designed around `Brief` as the central aggregate, with related records kept in separate tables so each concern can evolve independently.

```
User ──< Brief >── BriefAnalysis ──── EstimateOverride
               |
               ├──< BriefEvent   (immutable audit log)
               └──< BriefNote    (threaded, self-referential)
```

**Brief** owns the intake data (`title`, `description`, `budgetRange`, `timelineUrgency`, `contactName`, `contactEmail`), the current pipeline `stage` (`NEW → UNDER_REVIEW → PROPOSAL_SENT → WON / ARCHIVED`), and the optional `assigneeId` foreign key. Separating stage from the analysis record means a brief can be moved through the pipeline even if AI analysis fails.

**BriefAnalysis** is a strict 1-to-1 relation (`@unique` on `briefId`). Keeping it separate means the heavy AI output fields (`features Json`, `techStack Json`, `rawResponse Text`, `complexityScore`) never bloat the core `Brief` row, and the analysis can be retried or replaced without touching the brief itself. `status` (`PENDING → COMPLETED / FAILED`) makes partial states visible at the database level rather than hiding them in application logic.

**EstimateOverride** is a second 1-to-1 layer on top of `BriefAnalysis`. Rather than mutating the AI output, overrides are stored as a separate record that wins at read time. The original AI output is always preserved, giving a full audit trail of what the model said versus what the team accepted.

**BriefEvent** is an append-only event log. Every stage change, assignment, and note addition writes a row here. This gives the `StageTimeline` component a complete, chronological history without having to diff state across queries.

**BriefNote** uses a `parentId` self-referential foreign key for threaded replies. A `null` parent means a top-level comment; a non-null parent means a reply. This avoids a separate `BriefNoteReply` table while keeping the hierarchy queryable.

**Indexes** were chosen to match the most common access patterns:
- `Brief(stage)`, `Brief(assigneeId)`, `Brief(createdAt)` — individual filters for listing and Kanban
- `Brief(stage, assigneeId)`, `Brief(stage, createdAt)` — composite indexes for the Kanban board (filter by stage, sort by date) and assignee-scoped list views
- `BriefEvent(briefId, createdAt)` — timeline queries are always scoped to a brief and sorted by time
- `BriefAnalysis(status)` — analytics groupBy and background retry scans

---

### Caching and Invalidation Strategy

Redis (Upstash, accessed via the REST SDK) serves two roles: **rate limiting** and **analytics caching**.

**Rate limiting** uses a fixed-window counter keyed by `rl:<endpoint>:<ip>:<window>` where `window = floor(unixSeconds / windowSize)`. On each request the counter is read, incremented, and written back with a TTL equal to the remaining seconds in the window. If Redis is unavailable the limiter fails open — legitimate traffic is never blocked because of an infrastructure hiccup. Two limits are enforced:
- Public intake form: 5 submissions / 60 s per IP
- Webhook endpoint: 20 requests / 60 s per IP

**Analytics caching** stores the full aggregated payload under a single key (`analytics:summary`) with a 60-second TTL. The analytics query hits five PostgreSQL aggregations in parallel; caching the result means those queries run at most once per minute under any level of dashboard traffic. There is no explicit cache invalidation on write — the 60-second staleness is an accepted trade-off for a metrics dashboard. If stricter freshness were required, the `POST /api/briefs` handler and the brief mutation routes would call `redis.del("analytics:summary")` after committing to the database.

**Real-time push** via Server-Sent Events fills the gap between cache updates. When a brief is created (`BRIEF_NEW`) or AI analysis finishes (`ANALYSIS_COMPLETED`), `broadcastEvent` emits on a process-global `EventEmitter`. The `/api/sse` route subscribes to that emitter and streams JSON events to every connected authenticated client. `BriefDetailSSE` on the brief detail page listens for `ANALYSIS_COMPLETED` and triggers a router refresh, so users see the AI results appear without polling.

---

### AI Pipeline Design

The pipeline is intentionally **fire-and-forget**: the `POST /api/briefs` route persists the brief, returns `201` to the client, and then calls `processBrief(brief.id)` as an unawaited promise. This keeps p99 intake latency independent of AI provider response times.

```
Client POST /api/briefs
  │
  ├─ Rate limit check (Redis)
  ├─ Schema validation (Zod)
  ├─ INSERT Brief (Postgres)
  ├─ broadcastEvent BRIEF_NEW   ─────────► SSE clients (Kanban refresh)
  └─ processBrief(id) [async, not awaited]
       │
       ├─ INSERT BriefAnalysis { status: PENDING }
       ├─ analyzeBrief(title, description)
       │    ├─ Strips HTML from description
       │    ├─ Calls AI with system prompt → JSON mode
       │    └─ Retries up to 3× with exponential backoff (500 ms base)
       │
       ├─ [success] Zod validate AI JSON
       │    └─ UPDATE BriefAnalysis { status: COMPLETED, features, ... }
       │         └─ broadcastEvent ANALYSIS_COMPLETED ─► SSE clients
       │
       └─ [failure] UPDATE BriefAnalysis { status: FAILED, errorMessage }
```

**Provider selection**: The `analyzeBrief` module checks for `DEEPSEEK_API_KEY` at startup. If present it points the OpenAI-compatible SDK at `https://api.deepseek.com` and uses `deepseek-chat`; otherwise it falls back to `gpt-4o-mini` via the standard OpenAI endpoint. Both support `response_format: { type: "json_object" }`, which eliminates markdown-wrapped responses and makes JSON parsing deterministic.

**Prompt engineering**: The system prompt specifies an exact JSON schema, per-field rules (min/max array lengths, numeric constraints, valid enum values), and ends with "Return ONLY valid JSON, no markdown, no explanation." A low temperature (0.2) is used to reduce hallucinated features while still allowing reasonable variation in tech stack recommendations.

**Output validation**: The raw AI string is `JSON.parse`d and then validated with a Zod schema (`aiAnalysisSchema`) before any database write. If either step fails the analysis is marked `FAILED` with the raw response preserved in `rawResponse` for debugging. This means a malformed AI response never corrupts the database.

**Webhook intake**: The `POST /api/webhooks/intake` route accepts the same brief schema but requires an HMAC-SHA256 signature in `x-webhook-signature`. Verification uses `timingSafeEqual` to prevent timing attacks. Valid webhooks go through the same `processBrief` pipeline.

---

### AI Tools Used During Development

- **GitHub Copilot** — used throughout for boilerplate acceleration: Prisma schema scaffolding, Zod schema generation, Tailwind component wiring, and repetitive API route patterns (rate limit → validate → persist → respond).
- **Claude (Anthropic)** — used for architectural reasoning: weighing trade-offs in the data model (separate `BriefAnalysis` vs. inline columns on `Brief`, override pattern), designing the fire-and-forget pipeline, and drafting the system prompt for the AI estimator.
- **DeepSeek Chat** — used as the default AI provider at runtime for brief analysis. Also used interactively during development to verify that the system prompt produced schema-conformant JSON across a variety of brief inputs before finalising the prompt.

---

### What I'd Improve Given More Time

**Reliable background jobs**
The current fire-and-forget pattern loses work if the process crashes between creating the `Brief` and finishing `processBrief`. Replacing the unawaited promise with a proper job queue (e.g. [Inngest](https://inngest.com) or BullMQ + Redis) would give retry guarantees, dead-letter queues, and observability into stuck or failed jobs.

**Horizontally scalable SSE**
The in-process `EventEmitter` only works when all requests hit the same Node.js instance. In any multi-replica deployment (Kubernetes, Vercel with concurrent function instances) events won't fan out. The fix is a Redis Pub/Sub channel: mutations publish to the channel, and each instance subscribes and forwards events to its local SSE connections.

**Explicit cache invalidation**
The analytics cache TTL is 60 seconds because there is no write-through invalidation. Adding `redis.del("analytics:summary")` in the brief mutation handlers (create, stage change) would make the dashboard reflect changes within one request cycle at negligible cost.

**Streaming AI responses**
For long or complex briefs, using the streaming API and writing partial results to the database would let the UI show progressive output rather than a spinner. This is straightforward with the OpenAI SDK (`stream: true`) and a chunked SSE response.

**Role-based access beyond two roles**
The current `ADMIN / REVIEWER` enum is binary. A more realistic model would have `SUBMITTER` (can create briefs via the UI but not access the dashboard), `ANALYST` (can view and add notes but not change stages), and `ADMIN` (full access including overrides and user management). NextAuth middleware and server-side session checks would need updating accordingly.

**Webhook replay and idempotency**
The webhook endpoint has no idempotency key. A retry from an external system would create a duplicate brief. Adding an `externalId` unique field to `Brief` and a `upsert` instead of `create` in the webhook handler would make intake idempotent.

**Test coverage**
Unit tests for `analyzeBrief` (mocking the OpenAI client), `processBrief` (mocking both Prisma and the AI layer), and the rate limiter would significantly reduce regression risk. Integration tests for the brief submission flow using a test database and a mocked AI provider would cover the happy path end-to-end.
