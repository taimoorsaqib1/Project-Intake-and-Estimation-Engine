"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Reply } from "lucide-react";
import { useState, useTransition } from "react";

type Note = {
  id: string;
  content: string;
  createdAt: Date;
  author: { id: string; name: string };
  replies: {
    id: string;
    content: string;
    createdAt: Date;
    author: { id: string; name: string };
  }[];
};

interface NotesThreadProps {
  briefId: string;
  notes: Note[];
  currentUserId: string;
  currentUserName: string;
}

export function NotesThread({ briefId, notes: initialNotes, currentUserId, currentUserName }: NotesThreadProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isPending, startTransition] = useTransition();

  async function postNote(parentId: string | null, text: string) {
    const res = await fetch(`/api/briefs/${briefId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, parentId }),
    });
    if (!res.ok) return;
    const { note } = await res.json();

    if (!parentId) {
      setNotes((prev) => [
        ...prev,
        { ...note, author: { id: currentUserId, name: currentUserName }, replies: [] },
      ]);
      setContent("");
    } else {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === parentId
            ? {
                ...n,
                replies: [
                  ...n.replies,
                  { ...note, author: { id: currentUserId, name: currentUserName } },
                ],
              }
            : n
        )
      );
      setReplyTo(null);
      setReplyContent("");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    startTransition(() => postNote(null, content.trim()));
  }

  function handleReply(noteId: string) {
    if (!replyContent.trim()) return;
    startTransition(() => postNote(noteId, replyContent.trim()));
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        Notes ({notes.length})
      </h3>

      {/* New note form */}
      <form onSubmit={handleSubmit} className="mb-5 space-y-2">
        <Textarea
          placeholder="Add an internal note…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
          {isPending ? "Posting…" : "Add Note"}
        </Button>
      </form>

      {/* Notes thread */}
      {notes.length === 0 ? (
        <p className="text-sm text-slate-400">No notes yet. Be the first to add one.</p>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="space-y-2">
              <NoteItem note={note} />

              {/* Replies */}
              {note.replies.map((reply) => (
                <div key={reply.id} className="ml-8">
                  <NoteItem note={reply} />
                </div>
              ))}

              {/* Reply form */}
              {replyTo === note.id ? (
                <div className="ml-8 space-y-2">
                  <Textarea
                    placeholder="Write a reply…"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={2}
                    className="resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleReply(note.id)}
                      disabled={isPending || !replyContent.trim()}
                    >
                      Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setReplyTo(null); setReplyContent(""); }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  className="ml-8 text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  onClick={() => setReplyTo(note.id)}
                >
                  <Reply className="w-3 h-3" />
                  Reply
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NoteItem({
  note,
}: {
  note: {
    id: string;
    content: string;
    createdAt: Date;
    author: { name: string };
  };
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium text-slate-700">{note.author.name}</span>
        <span className="text-xs text-slate-400">
          {new Date(note.createdAt).toLocaleString()}
        </span>
      </div>
      <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
    </div>
  );
}
