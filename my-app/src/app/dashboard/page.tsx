"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import  BookmarkForm  from "../../components/BookmarkForm";
import  BookmarkList  from "../../components/BookmarkList";

const DashboardPage = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then((res) => {
      setUserId(res.data.user?.id || null);
    });
  }, []);

  if (!userId) return <p>Loading user...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-zinc-900 via-purple-900 to-zinc-950 p-4">
      <h1 className="text-3xl font-bold text-white mb-6">Your Bookmarks</h1>
      <BookmarkForm userId={userId} />
      <BookmarkList userId={userId} />
    </div>
  );
}

export default DashboardPage;