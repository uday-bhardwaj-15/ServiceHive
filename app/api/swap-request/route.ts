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

export async function POST(req: NextRequest) {
  try {
    const userId = getAuthUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { mySlotId, theirSlotId } = await req.json()

    if (!mySlotId || !theirSlotId) {
      return NextResponse.json({ error: "Missing slot IDs" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const eventsCollection = db.collection("events")
    const swapRequestsCollection = db.collection("swapRequests")

    // Verify both slots exist and are SWAPPABLE
    const mySlot = await eventsCollection.findOne({
      _id: new ObjectId(mySlotId),
      userId: new ObjectId(userId),
      status: "SWAPPABLE",
    })

    const theirSlot = await eventsCollection.findOne({
      _id: new ObjectId(theirSlotId),
      status: "SWAPPABLE",
    })

    if (!mySlot || !theirSlot) {
      return NextResponse.json({ error: "One or both slots are not available" }, { status: 400 })
    }

    // Create swap request
    const result = await swapRequestsCollection.insertOne({
      requesterUserId: new ObjectId(userId),
      requesterSlotId: new ObjectId(mySlotId),
      targetUserId: theirSlot.userId,
      targetSlotId: new ObjectId(theirSlotId),
      status: "PENDING",
      createdAt: new Date(),
    })

    // Update both slots to SWAP_PENDING
    await eventsCollection.updateMany(
      {
        _id: {
          $in: [new ObjectId(mySlotId), new ObjectId(theirSlotId)],
        },
      },
      { $set: { status: "SWAP_PENDING" } },
    )

    return NextResponse.json(
      {
        id: result.insertedId.toString(),
        status: "PENDING",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create swap request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
