import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

function getAuthUserId(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.slice(7)
  const decoded = verifyToken(token)
  return decoded?.userId || null
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const userId = getAuthUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { requestId } = await params
    const { accept } = await req.json()

    const { db } = await connectToDatabase()
    const swapRequestsCollection = db.collection("swapRequests")
    const eventsCollection = db.collection("events")

    const swapRequest = await swapRequestsCollection.findOne({
      _id: new ObjectId(requestId),
      targetUserId: new ObjectId(userId),
    })

    if (!swapRequest) {
      return NextResponse.json({ error: "Swap request not found" }, { status: 404 })
    }

    if (accept) {
      // Accept: Exchange slot ownership
      await eventsCollection.updateOne(
        { _id: swapRequest.requesterSlotId },
        { $set: { userId: swapRequest.targetUserId, status: "BUSY" } },
      )

      await eventsCollection.updateOne(
        { _id: swapRequest.targetSlotId },
        { $set: { userId: swapRequest.requesterUserId, status: "BUSY" } },
      )

      await swapRequestsCollection.updateOne({ _id: new ObjectId(requestId) }, { $set: { status: "ACCEPTED" } })
    } else {
      // Reject: Set slots back to SWAPPABLE
      await eventsCollection.updateMany(
        {
          _id: {
            $in: [swapRequest.requesterSlotId, swapRequest.targetSlotId],
          },
        },
        { $set: { status: "SWAPPABLE" } },
      )

      await swapRequestsCollection.updateOne({ _id: new ObjectId(requestId) }, { $set: { status: "REJECTED" } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Swap response error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
