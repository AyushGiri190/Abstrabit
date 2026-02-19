"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true) // Initial session check
  const [signingIn, setSigningIn] = useState(false) // Disable button while signing in

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        router.push("/bookmarks") // Redirect logged-in users
      }
      setLoading(false)
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.push("/bookmarks")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const signIn = async () => {
    setSigningIn(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" })
      if (error) throw error
    } catch (err: any) {
      console.error("Sign-in error:", err.message)
      alert("Failed to sign in. Please try again.")
    } finally {
      setSigningIn(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600 text-lg">Checking session...</p>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Welcome to Bookmarks App</h1>
      <button
        onClick={signIn}
        disabled={signingIn}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition disabled:opacity-50"
      >
        {signingIn ? "Signing in..." : "Sign in with Google"}
      </button>
    </div>
  )
}
