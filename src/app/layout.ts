import "./globals.css"
import { ReactNode } from "react"

export const metadata = {
  title: "Bookmark Manager",
  description: "Manage your bookmarks with Supabase OAuth",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">{children}</body>
    </html>
  )
}
