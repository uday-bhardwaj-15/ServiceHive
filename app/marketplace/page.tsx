"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface SwappableSlot {
  _id: string
  title: string
  startTime: string
  endTime: string
  owner: {
    name: string
    email: string
  }
}

interface UserEvent {
  _id: string
  title: string
  startTime: string
  endTime: string
}

export default function Marketplace() {
  const router = useRouter()
  const [slots, setSlots] = useState<SwappableSlot[]>([])
  const [userEvents, setUserEvents] = useState<UserEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<SwappableSlot | null>(null)
  const [selectedMySlot, setSelectedMySlot] = useState<string>("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const [slotsRes, eventsRes] = await Promise.all([
        fetch("/api/swappable-slots", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/events", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const slotsData = await slotsRes.json()
      const eventsData = await eventsRes.json()

      setSlots(slotsData)
      setUserEvents(eventsData.filter((e: any) => e.status === "SWAPPABLE"))
    } catch (err) {
      console.error("Failed to fetch data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestSwap = async () => {
    if (!selectedSlot || !selectedMySlot) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/swap-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mySlotId: selectedMySlot,
          theirSlotId: selectedSlot._id,
        }),
      })

      if (res.ok) {
        setSelectedSlot(null)
        setSelectedMySlot("")
        fetchData()
        alert("Swap request sent!")
      }
    } catch (err) {
      console.error("Failed to request swap:", err)
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
            <Link href="/requests" className="text-gray-600 hover:text-indigo-600 font-medium">
              Requests
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Slots</h1>

        {slots.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No swappable slots available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map((slot) => (
              <div key={slot._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{slot.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleTimeString()}
                </p>
                <p className="text-sm text-gray-700 mb-4">
                  <strong>Owner:</strong> {slot.owner.name}
                </p>
                <button
                  onClick={() => setSelectedSlot(slot)}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Request Swap
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Swap</h2>
              <p className="text-gray-600 mb-4">
                Select one of your swappable slots to offer in exchange for <strong>{selectedSlot.title}</strong>
              </p>

              {userEvents.length === 0 ? (
                <p className="text-gray-600 mb-4">
                  You don't have any swappable slots. Create and mark events as swappable first.
                </p>
              ) : (
                <div className="space-y-3 mb-6">
                  {userEvents.map((event) => (
                    <label
                      key={event._id}
                      className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="mySlot"
                        value={event._id}
                        checked={selectedMySlot === event._id}
                        onChange={(e) => setSelectedMySlot(e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-600">{new Date(event.startTime).toLocaleString()}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedSlot(null)
                    setSelectedMySlot("")
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestSwap}
                  disabled={!selectedMySlot}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
