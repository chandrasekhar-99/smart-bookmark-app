"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface Props {
  userId: string;
}

const BookmarkForm = ({ userId }: Props) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!title || !url) return alert("Title and URL are required");

    // Ensure the URL starts with http:// or https://
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    setLoading(true);

    const { error } = await supabase.from("bookmarks").insert([
      { user_id: userId, title, url: formattedUrl },
    ]);

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      setTitle("");
      setUrl("");
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-md p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="p-2 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none"
      />
      <input
        type="text"
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="p-2 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none"
      />
      <button
        onClick={handleAdd}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded font-bold disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Bookmark"}
      </button>
    </div>
  );
};

export default BookmarkForm;
