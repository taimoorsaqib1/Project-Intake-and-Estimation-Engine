import { getAnalyticsData } from "@/lib/analytics";
import { apiUnauthorized, apiForbidden } from "@/lib/api-error";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiUnauthorized();
  if (session.user.role !== "ADMIN") return apiForbidden();

  const data = await getAnalyticsData();
  return NextResponse.json(data);
}
