"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Bookmark } from "./type"
import { useRouter } from "next/navigation"

export default function BookmarksPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(true)

  // Fetch session and user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.push("/") // Redirect if not logged in
      } else {
        setUser(session.user)
        fetchBookmarks(session.user.id)
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/")
      } else {
        setUser(session.user)
        fetchBookmarks(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const fetchBookmarks = async (userId: string) => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    setBookmarks(data || [])
  }

  // const addBookmark = async () => {
  //   if (!title || !url || !user) return
  
  //   // Normalize the URL
  //   let formattedUrl = url.trim()
  
  //   // If the URL does NOT start with http:// or https://, prepend https://
  //   if (!/^https?:\/\//i.test(formattedUrl)) {
  //     formattedUrl = `https://${formattedUrl}`
  //   }
  
  //   // Insert into Supabase
  //   await supabase.from("bookmarks").insert({
  //     title,
  //     url: formattedUrl,
  //     user_id: user.id,
  //   })
  
  //   // Reset input
  //   setTitle("")
  //   setUrl("")
  
  //   // Refresh bookmarks
  //   fetchBookmarks(user.id)
  // }
  const addBookmark = async () => {
    if (!title || !url || !user) return
  
    // Normalize the URL
    let formattedUrl = url.trim()
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`
    }
  
    // Insert into Supabase and get the inserted row
    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        title,
        url: formattedUrl,
        user_id: user.id,
      })
      .select() // Return the inserted row
  
    if (error) {
      console.error("Error adding bookmark:", error)
      return
    }
  
    const newBookmark = data![0] as Bookmark
  
    // Update state locally so the new bookmark appears immediately
    setBookmarks((prev) => [newBookmark, ...prev])
  
    // Reset input
    setTitle("")
    setUrl("")
  }
  
  

  const deleteBookmark = async (id: string) => {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id)
  
    if (error) {
      console.error("Error deleting bookmark:", error)
      return
    }
  
    // Update state locally to remove the deleted bookmark
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
  }
  

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) return <p className="text-center mt-40">Loading...</p>

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Bookmarks</h1>
          <button
            onClick={signOut}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* Add Bookmark */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={addBookmark}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
          >
            Add
          </button>
        </div>

        {/* Bookmark List */}
        <div className="space-y-3">
  {bookmarks.length === 0 && (
    <p className="text-gray-500 text-center">No bookmarks yet.</p>
  )}

  {bookmarks.map((b) => (
    <div
      key={b.id}
      className="flex justify-between items-center bg-gray-50 border rounded-lg px-4 py-3"
    >
      {/* Clickable link */}
      <a
        href={b.url}               // link to bookmark
        target="_blank"            // open in new tab
        rel="noopener noreferrer"  // security best practice
        className="text-blue-600 hover:underline font-medium"
      >
        {b.title}
      </a>

      {/* Delete button */}
      <button
        onClick={() => deleteBookmark(b.id)}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition"
      >
        Delete
      </button>
    </div>
  ))}
</div>
      </div>
    </div>
  )
}
