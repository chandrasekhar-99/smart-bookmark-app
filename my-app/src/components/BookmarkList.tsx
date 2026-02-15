"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  created_at: string;
}

interface Props {
  userId: string;
}

const BookmarkList = ({ userId }: Props) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch bookmarks
  const fetchBookmarks = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    if (data) setBookmarks(data as Bookmark[]);

    setLoading(false);
  };

  // Delete bookmark (optimistic update)
  const deleteBookmark = async (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));

    const { error } = await supabase.from("bookmarks").delete().eq("id", id);
    if (error) {
      setError(error.message);
      fetchBookmarks(); // revert if delete fails
    }
  };

  useEffect(() => {
    if (!userId) return;

    const init = async () => {
      await fetchBookmarks();
    };
    init();

    // Realtime subscription (Supabase v2)
    const subscription = supabase
      .channel("bookmarks")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newBookmark = payload.new as Bookmark; // ✅ cast to Bookmark
          setBookmarks((prev) => [newBookmark, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const oldBookmark = payload.old as Bookmark; // ✅ cast to Bookmark
          setBookmarks((prev) => prev.filter((b) => b.id !== oldBookmark.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId]);

  return (
    <div className="w-full max-w-md mt-6 flex flex-col gap-3">
      {loading && <p className="text-white/70">Loading bookmarks...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!loading && bookmarks.length === 0 && (
        <p className="text-white/50 text-center">No bookmarks yet.</p>
      )}

      {bookmarks.map((b) => (
        <div
          key={b.id}
          className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/20 text-white"
        >
          <a
            href={b.url.startsWith("http") ? b.url : `https://${b.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate max-w-[80%] hover:underline"
          >
            {b.title}
          </a>
          <button
            onClick={() => deleteBookmark(b.id)}
            className="bg-red-500 hover:bg-red-700 py-1 px-3 rounded"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default BookmarkList;
