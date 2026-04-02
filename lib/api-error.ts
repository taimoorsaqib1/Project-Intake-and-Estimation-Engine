import { NextResponse } from "next/server";
import type { ZodError } from "zod";

interface ApiErrorBody {
  error: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
}

export function apiError(
  message: string,
  status: number,
  opts?: { code?: string; fieldErrors?: Record<string, string[]>; headers?: Record<string, string> }
) {
  const body: ApiErrorBody = { error: message };
  if (opts?.code) body.code = opts.code;
  if (opts?.fieldErrors) body.fieldErrors = opts.fieldErrors;
  return NextResponse.json(body, { status, headers: opts?.headers });
}

export function apiValidationError(zodError: ZodError) {
  return apiError("Validation failed", 422, {
    code: "VALIDATION_ERROR",
    fieldErrors: zodError.flatten().fieldErrors as Record<string, string[]>,
  });
}

export function apiUnauthorized() {
  return apiError("Unauthorized", 401, { code: "UNAUTHORIZED" });
}

export function apiForbidden() {
  return apiError("Forbidden", 403, { code: "FORBIDDEN" });
}

export function apiNotFound(resource = "Resource") {
  return apiError(`${resource} not found`, 404, { code: "NOT_FOUND" });
}

export function apiRateLimited(retryAfter: number) {
  return apiError("Too many requests. Please try again later.", 429, {
    code: "RATE_LIMITED",
    headers: { "Retry-After": String(retryAfter) },
  });
}
