"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">SlotSwapper</h1>
          <p className="text-xl text-gray-600 mb-8">
            Swap your calendar slots with other users. Mark your busy slots as swappable and find the perfect time
            exchange.
          </p>

          {isLoggedIn ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700 mb-6">Welcome back! Ready to swap?</p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/marketplace"
                  className="px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition"
                >
                  Browse Slots
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition"
              >
                Log In
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
