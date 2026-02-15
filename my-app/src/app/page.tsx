"use client";

import {supabase} from "@/lib/supabaseClient";

const page = () => {

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: process.env.NEXT_PUBLIC_REDIRECT_URL,
      },
    });
    if (error) console.error("Error during login:", error.message);
  }
 
    return (
      <div className="flex items-center justify-center min-h-screen px-4 
        bg-gradient-to-br from-zinc-900 via-purple-900 to-zinc-950">

        <div className="w-full max-w-md sm:max-w-lg
          flex flex-col items-center justify-center
          min-h-[360px] sm:min-h-[420px]
          p-6 sm:p-8
          bg-white/10 backdrop-blur-xl
          border border-white/20
          rounded-2xl shadow-2xl
          text-white">

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
            Smart Bookmark App
          </h1>

          <button
            className="w-full sm:w-auto
              bg-blue-500 hover:bg-blue-700
              text-white font-semibold
              py-2.5 px-6
              rounded-lg
              mt-6
              transition duration-200"
            onClick={handleLogin}
          >
            Sign in with Google
          </button>

        </div>
      </div>
    );

};

export default page;