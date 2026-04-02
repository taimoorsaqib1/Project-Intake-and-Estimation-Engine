import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function getRequiredSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  return session;
}

export async function getOptionalSession() {
  return getServerSession(authOptions);
}

export async function requireRole(role: "ADMIN" | "REVIEWER") {
  const session = await getRequiredSession();
  if (session.user.role !== role) redirect("/dashboard");
  return session;
}
