"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface Bookmark {
  id: string
  title: string
  url: string
  user_id: string
  created_at: string
}

const PAGE_SIZE = 10

export default function BookmarksPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(true) // Initial loading
  const [adding, setAdding] = useState(false)  // Adding bookmark
  const [deletingIds, setDeletingIds] = useState<string[]>([]) // Deleting bookmarks

  // Pagination
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [fetchingMore, setFetchingMore] = useState(false)

  // Fetch session and bookmarks
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push("/")
      } else {
        setUser(session.user)
        await fetchBookmarks(session.user.id, 1)
      }
      setLoading(false)
    }

    fetchSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) router.push("/")
      else {
        setUser(session.user)
        fetchBookmarks(session.user.id, 1)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  // Fetch bookmarks with pagination
  const fetchBookmarks = async (userId: string, pageNumber: number) => {
    const from = (pageNumber - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) {
      console.error("Error fetching bookmarks:", error)
      return
    }

    if (pageNumber === 1) {
      setBookmarks(data || [])
    } else {
      setBookmarks((prev) => [...prev, ...(data || [])])
    }

    setHasMore((data?.length || 0) === PAGE_SIZE)
  }

  // Load more bookmarks
  const loadMore = async () => {
    if (!user || !hasMore) return
    setFetchingMore(true)
    const nextPage = page + 1
    await fetchBookmarks(user.id, nextPage)
    setPage(nextPage)
    setFetchingMore(false)
  }

  // Add bookmark
  const addBookmark = async () => {
    if (!title || !url || !user) return

    setAdding(true)
    let formattedUrl = url.trim()
    if (!/^https?:\/\//i.test(formattedUrl)) formattedUrl = `https://${formattedUrl}`

    try {
      new URL(formattedUrl)
    } catch {
      alert("Invalid URL")
      setAdding(false)
      return
    }

    const { data, error } = await supabase
      .from("bookmarks")
      .insert({ title, url: formattedUrl, user_id: user.id })
      .select()

    if (error) {
      console.error("Error adding bookmark:", error)
      setAdding(false)
      return
    }

    setBookmarks((prev) => [data![0], ...prev])
    setTitle("")
    setUrl("")
    setAdding(false)
  }

  // Delete bookmark
  const deleteBookmark = async (id: string) => {
    setDeletingIds((prev) => [...prev, id])
    const { error } = await supabase.from("bookmarks").delete().eq("id", id)
    if (error) {
      console.error(error)
      setDeletingIds((prev) => prev.filter((i) => i !== id))
      return
    }
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
    setDeletingIds((prev) => prev.filter((i) => i !== id))
  }

  // Logout
  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) return <p className="text-center mt-40 text-gray-600">Loading bookmarks...</p>

  return (
    <div className="min-h-screen py-10 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Your Bookmarks</h1>
          <button
            onClick={signOut}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition shadow-md"
          >
            Logout
          </button>
        </div>

        {/* Add Bookmark */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-400"
          />
          <input
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-400"
          />
          <button
            onClick={addBookmark}
            disabled={adding}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow-md transition disabled:opacity-50"
          >
            {adding ? "Adding..." : "Add"}
          </button>
        </div>

        {/* Bookmark List */}
        <div className="space-y-3">
          {bookmarks.length === 0 && <p className="text-gray-500 text-center">No bookmarks yet.</p>}

          {bookmarks.map((b) => (
            <div key={b.id} className="flex justify-between items-center bg-gray-50 border rounded-lg px-4 py-3 shadow-sm">
              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                {b.title}
              </a>
              <button
                onClick={() => deleteBookmark(b.id)}
                disabled={deletingIds.includes(b.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition disabled:opacity-50"
              >
                {deletingIds.includes(b.id) ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={fetchingMore}
            className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition disabled:opacity-50 shadow-md"
          >
            {fetchingMore ? "Loading..." : "Load More"}
          </button>
        )}
      </div>
    </div>
  )
}
