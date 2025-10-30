"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface SwapRequest {
  _id: string
  status: string
  requesterSlot: {
    title: string
    startTime: string
    endTime: string
  }
  targetSlot: {
    title: string
    startTime: string
    endTime: string
  }
  requester?: {
    name: string
  }
  targetUser?: {
    name: string
  }
}

export default function Requests() {
  const router = useRouter()
  const [incoming, setIncoming] = useState<SwapRequest[]>([])
  const [outgoing, setOutgoing] = useState<SwapRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/swap-requests", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setIncoming(data.incoming)
      setOutgoing(data.outgoing)
    } catch (err) {
      console.error("Failed to fetch requests:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSwapResponse = async (requestId: string, accept: boolean) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/swap-response/${requestId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accept }),
      })

      if (res.ok) {
        fetchRequests()
      }
    } catch (err) {
      console.error("Failed to respond to swap:", err)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            SlotSwapper
          </Link>
          <div className="flex gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium">
              Dashboard
            </Link>
            <Link href="/marketplace" className="text-gray-600 hover:text-indigo-600 font-medium">
              Marketplace
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Swap Requests</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Incoming Requests */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Incoming Requests</h2>
            {incoming.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">No incoming requests.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {incoming.map((request) => (
                  <div key={request._id} className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>{request.requester?.name}</strong> wants to swap:
                    </p>
                    <div className="bg-blue-50 p-3 rounded mb-3">
                      <p className="font-medium text-gray-900">{request.requesterSlot.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(request.requesterSlot.startTime).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 text-center">for your</p>
                    <div className="bg-green-50 p-3 rounded mb-4">
                      <p className="font-medium text-gray-900">{request.targetSlot.title}</p>
                      <p className="text-sm text-gray-600">{new Date(request.targetSlot.startTime).toLocaleString()}</p>
                    </div>
                    {request.status === "PENDING" && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleSwapResponse(request._id, false)}
                          className="flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-lg font-semibold hover:bg-red-50 transition"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleSwapResponse(request._id, true)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                        >
                          Accept
                        </button>
                      </div>
                    )}
                    {request.status !== "PENDING" && (
                      <div className="text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            request.status === "ACCEPTED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Requests */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Outgoing Requests</h2>
            {outgoing.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">No outgoing requests.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {outgoing.map((request) => (
                  <div key={request._id} className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600 mb-3">
                      Waiting for <strong>{request.targetUser?.name}</strong> to respond:
                    </p>
                    <div className="bg-blue-50 p-3 rounded mb-3">
                      <p className="font-medium text-gray-900">{request.requesterSlot.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(request.requesterSlot.startTime).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 text-center">for their</p>
                    <div className="bg-green-50 p-3 rounded mb-4">
                      <p className="font-medium text-gray-900">{request.targetSlot.title}</p>
                      <p className="text-sm text-gray-600">{new Date(request.targetSlot.startTime).toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        {request.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
