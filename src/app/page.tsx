"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.push("/bookmarks") // redirect logged-in users
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.push("/bookmarks")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" })
  }

  if (loading) return <p className="text-center mt-40">Checking session...</p>

  return (
    <div className="min-h-screen flex items-center justify-center">
      <button
        onClick={signIn}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
      >
        Sign in with Google
      </button>
    </div>
  )
}
