# Implementation Plan — Veloce Module 01

- [x] 1. Initialize Next.js project with core dependencies and environment setup





  - Scaffold Next.js 14 App Router project with TypeScript
  - Install dependencies: `prisma`, `@prisma/client`, `@upstash/redis`, `@upstash/ratelimit`, `@google/generative-ai`, `zod`, `react-hook-form`, `@hookform/resolvers`, `@tiptap/react`, `@tiptap/starter-kit`
  - Create `.env.local` with placeholders: `DATABASE_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `GEMINI_API_KEY`, `WEBHOOK_SECRET`
  - _Requirements: 1.1, 3.1_

- [x] 2. Set up database schema and Prisma client







- [x] 2.1 Define Prisma schema with Brief and BriefAnalysis models


  - Write `prisma/schema.prisma` with all models, enums, relations, and indexes as specified in the design
  - _Requirements: 2.1, 10.1_


- [x] 2.2 Run initial migration and generate Prisma client



  - Execute `prisma migrate dev --name init` against Neon PostgreSQL
  - Verify generated client types match schema
  - _Requirements: 2.1_

- [ ]* 2.3 Write unit tests for Prisma schema integrity
  - Verify enum values and required fields match requirements
  - _Requirements: 2.1, 10.1_

- [-] 3. Implement core validation schemas

- [x] 3.1 Create Zod schema for brief submission input


  - Define `briefInputSchema` covering all fields with appropriate constraints (email format, non-empty strings, enum values)
  - Export inferred TypeScript type `BriefInput`
  - _Requirements: 1.2, 10.4_

- [x] 3.2 Create Zod schema for AI pipeline response





  - Define `aiAnalysisSchema` matching the expected LLM structured output (features array, category enum, effortMin, effortMax, techStack array, complexityScore 1–5)
  - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [ ]* 3.3 Write unit tests for validation schemas
  - Test valid inputs pass, invalid inputs return correct error paths
  - _Requirements: 1.2, 2.2_

- [ ] 4. Implement HMAC verification utility
  - Write `lib/webhook/verify.ts` with a `verifyHmacSignature(secret, rawBody, signatureHeader)` function using Node.js `crypto`
  - Handle missing header and timing-safe comparison
  - _Requirements: 3.2, 3.3_

- [ ]* 4.1 Write unit tests for HMAC verification
  - Test valid signature passes, tampered body fails, missing header returns false
  - _Requirements: 3.2, 3.3_

- [ ] 5. Implement rate limiting middleware
  - Write `lib/ratelimit/index.ts` using `@upstash/ratelimit` with a sliding window of 5 requests per 10 minutes
  - Export a `checkRateLimit(ip: string)` helper that returns `{ success, reset }`
  - _Requirements: 1.5, 3.5_

- [ ] 6. Implement AI pipeline service
- [ ] 6.1 Write the LLM prompt and structured output parser
  - Create `lib/ai/pipeline.ts` with a prompt template that instructs Gemini to return JSON matching `aiAnalysisSchema`
  - Parse and validate the response with the Zod schema
  - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [ ] 6.2 Add retry logic and failure handling
  - Wrap the LLM call in a retry loop (max 3 attempts, exponential backoff)
  - On exhaustion, return a failure result with the error message
  - _Requirements: 2.6_

- [ ] 6.3 Write `runAnalysis(briefId, description, metadata)` orchestrator function
  - Creates a `PENDING` BriefAnalysis record before calling the LLM
  - Updates the record to `COMPLETED` with parsed fields or `FAILED` with error message
  - _Requirements: 2.1, 2.6_

- [ ]* 6.4 Write unit tests for AI pipeline parser
  - Mock valid LLM response, malformed JSON response, and partial response
  - Verify retry behavior and final failure state
  - _Requirements: 2.6_

- [ ] 7. Implement Brief service and API route
- [ ] 7.1 Write `lib/briefs/service.ts` with `createBrief(data, source)` function
  - Validates input with `briefInputSchema`
  - Persists `Brief` record via Prisma
  - Fires `runAnalysis` asynchronously (non-blocking)
  - Returns the created brief ID
  - _Requirements: 2.1, 3.4_

- [ ] 7.2 Implement `POST /api/briefs` route handler
  - Apply rate limiting using client IP from request headers
  - Parse and validate request body
  - Call `createBrief` service
  - Return `201` with brief ID or appropriate error responses
  - _Requirements: 1.3, 1.4, 1.5, 10.4_

- [ ]* 7.3 Write integration tests for POST /api/briefs
  - Happy path returns 201, rate limit returns 429, invalid body returns 400
  - _Requirements: 1.2, 1.5_

- [ ] 8. Implement webhook endpoint
  - Create `app/api/webhooks/intake/route.ts`
  - Read raw body before parsing for HMAC verification
  - Verify signature using `verifyHmacSignature`; return 401 on failure
  - Apply rate limiting, validate body with `briefInputSchema`
  - Call `createBrief(data, 'WEBHOOK')` — identical pipeline to form submission
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 8.1 Write integration tests for webhook endpoint
  - Valid signature + valid payload returns 201
  - Invalid signature returns 401
  - Missing signature returns 401
  - _Requirements: 3.2, 3.3_

- [ ] 9. Build the public intake form UI
- [ ] 9.1 Create the form page and layout
  - Create `app/(public)/page.tsx` as a Client Component
  - Add accessible page layout with heading and description
  - _Requirements: 1.1_

- [ ] 9.2 Implement form fields with react-hook-form and Zod
  - Wire up all fields: title (text input), description (Tiptap rich text), budgetRange (select), timelineUrgency (select), contactName (text), contactEmail (email input)
  - Apply `briefInputSchema` as the form resolver
  - Display inline field-level validation errors
  - _Requirements: 1.1, 1.2_

- [ ] 9.3 Implement form submission, loading, and success/error states
  - On submit: POST to `/api/briefs`, disable submit button and show spinner during request
  - On success: display confirmation message and reset form
  - On error (400, 429, 500): display appropriate user-facing error message
  - _Requirements: 1.3, 1.4, 1.5_
