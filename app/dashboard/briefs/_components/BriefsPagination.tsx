"use client";

import { useRouter } from "next/navigation";

export function BriefsPagination({ nextCursor }: { nextCursor: string | null }) {
  const router = useRouter();

  if (!nextCursor) return null;

  return (
    <div className="flex justify-center pt-2">
      <button
        onClick={() => router.push(`/dashboard/briefs?cursor=${nextCursor}`)}
        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
      >
        Load more &rarr;
      </button>
    </div>
  );
}
