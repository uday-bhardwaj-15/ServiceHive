"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Event {
  _id: string
  title: string
  startTime: string
  endTime: string
  status: "BUSY" | "SWAPPABLE" | "SWAP_PENDING"
}

export default function Dashboard() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    startTime: "",
    endTime: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setEvents(data)
    } catch (err) {
      console.error("Failed to fetch events:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setFormData({ title: "", startTime: "", endTime: "" })
        setShowForm(false)
        fetchEvents()
      }
    } catch (err) {
      console.error("Failed to create event:", err)
    }
  }

  const handleToggleSwappable = async (eventId: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem("token")
      const newStatus = currentStatus === "BUSY" ? "SWAPPABLE" : "BUSY"
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        fetchEvents()
      }
    } catch (err) {
      console.error("Failed to update event:", err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
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
            <Link href="/marketplace" className="text-gray-600 hover:text-indigo-600 font-medium">
              Marketplace
            </Link>
            <Link href="/requests" className="text-gray-600 hover:text-indigo-600 font-medium">
              Requests
            </Link>
            <button onClick={handleLogout} className="text-gray-600 hover:text-red-600 font-medium">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Calendar</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            {showForm ? "Cancel" : "Add Event"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Team Meeting"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Create Event
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No events yet. Create one to get started!</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleTimeString()}
                  </p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                      event.status === "SWAPPABLE"
                        ? "bg-green-100 text-green-800"
                        : event.status === "SWAP_PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
                {event.status !== "SWAP_PENDING" && (
                  <button
                    onClick={() => handleToggleSwappable(event._id, event.status)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      event.status === "BUSY"
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-600 text-white hover:bg-gray-700"
                    }`}
                  >
                    {event.status === "BUSY" ? "Make Swappable" : "Make Busy"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
