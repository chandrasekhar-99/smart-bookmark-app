# Smart Bookmark App

A simple bookmark manager built with **Next.js (App Router)**, **Supabase (Auth, Database, Realtime)**, and **Tailwind CSS**. Users can sign in with Google OAuth, add bookmarks, and see their list update in real-time across tabs.

---

## Features

* Google OAuth login (no email/password)
* Add, view, and delete bookmarks (URL + title)
* Bookmarks are **private per user**
* **Realtime updates** across tabs without page refresh
* Fully deployed on **Vercel**

---

## Tech Stack

* **Next.js** (App Router)
* **Supabase** (Auth, Database, Realtime)
* **Tailwind CSS**

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/chandrasekhar-99/smart-bookmark-app
cd smart-bookmark-app
```

### 2. Install dependencies

```bash
npm install
# or
yarn
```

### 3. Setup environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_REDIRECT_URL=http://localhost:3000/dashboard
```

* `NEXT_PUBLIC_REDIRECT_URL` points to your local dashboard during development.
* For Vercel deployment, set it to:

```
https://smart-bookmark-app-sepia-zeta.vercel.app/dashboard
```

---

## Supabase Table & Policies

Create a table `bookmarks` with columns:

| Column     | Type                                            |
| ---------- | ----------------------------------------------- |
| id         | uuid (primary key, default `gen_random_uuid()`) |
| user_id    | uuid                                            |
| title      | text                                            |
| url        | text                                            |
| created_at | timestamp (default `now()`)                     |

**Enable Realtime** for the table and add these RLS policies:

```sql
-- Allow authenticated users to delete their own bookmarks
ALTER POLICY "Allow delete for authenticated users"
ON "public"."bookmarks"
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to insert bookmarks
ALTER POLICY "Allow insert for authenticated users"
ON "public"."bookmarks"
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to select their own bookmarks
ALTER POLICY "Allow select for authenticated users"
ON "public"."bookmarks"
TO authenticated
USING (auth.uid() = user_id);
```

---

## Problems I Ran Into and How I Solved Them

### 1. Realtime bookmark list not updating

**Problem:**

* Adding a new bookmark in one tab did not automatically appear in another tab.
* Only refreshing the page showed the updated list.

**Cause:**

* Supabase Realtime subscription was using the old syntax or subscribing before the `userId` was available.
* RLS policies were not allowing the user to select their own rows.

**Solution:**

* Updated to Supabase JS v2 Realtime syntax:

```ts
const subscription = supabase
  .channel("bookmarks")
  .on("postgres_changes", { event: "INSERT", table: "bookmarks", filter: `user_id=eq.${userId}` }, (payload) => {
    setBookmarks(prev => [payload.new as Bookmark, ...prev]);
  })
  .subscribe();
```

* Ensured **RLS SELECT policy** allows each user to see only their own bookmarks.
* Subscribed **only after `userId` is loaded**.

### 2. OAuth redirect worked locally but not on Vercel

**Problem:**

* Google login redirected correctly on localhost, but on Vercel it did not go to `/dashboard`.

**Cause:**

* The production redirect URL was not registered in Supabase.
* The project’s Site URL was still set to localhost.

**Solution:**

* Updated **Site URL** in Supabase:

```
https://smart-bookmark-app-sepia-zeta.vercel.app
```

* Added **redirect URLs** in Supabase:

```
http://localhost:3000/dashboard
https://smart-bookmark-app-sepia-zeta.vercel.app/dashboard
```

* Updated Vercel environment variable:

```
NEXT_PUBLIC_REDIRECT_URL=https://smart-bookmark-app-sepia-zeta.vercel.app/dashboard
```

* Redeployed the app.

---

## Deployment

* The app is deployed on **Vercel**: [https://smart-bookmark-app-sepia-zeta.vercel.app](https://smart-bookmark-app-sepia-zeta.vercel.app)

