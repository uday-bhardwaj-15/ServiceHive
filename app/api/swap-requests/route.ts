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

export async function GET(req: NextRequest) {
  try {
    const userId = getAuthUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const swapRequestsCollection = db.collection("swapRequests")

    // Incoming requests
    const incomingRequests = await swapRequestsCollection
      .aggregate([
        {
          $match: {
            targetUserId: new ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "events",
            localField: "requesterSlotId",
            foreignField: "_id",
            as: "requesterSlot",
          },
        },
        {
          $lookup: {
            from: "events",
            localField: "targetSlotId",
            foreignField: "_id",
            as: "targetSlot",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "requesterUserId",
            foreignField: "_id",
            as: "requester",
          },
        },
        {
          $unwind: "$requesterSlot",
        },
        {
          $unwind: "$targetSlot",
        },
        {
          $unwind: "$requester",
        },
      ])
      .toArray()

    // Outgoing requests
    const outgoingRequests = await swapRequestsCollection
      .aggregate([
        {
          $match: {
            requesterUserId: new ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "events",
            localField: "requesterSlotId",
            foreignField: "_id",
            as: "requesterSlot",
          },
        },
        {
          $lookup: {
            from: "events",
            localField: "targetSlotId",
            foreignField: "_id",
            as: "targetSlot",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "targetUserId",
            foreignField: "_id",
            as: "targetUser",
          },
        },
        {
          $unwind: "$requesterSlot",
        },
        {
          $unwind: "$targetSlot",
        },
        {
          $unwind: "$targetUser",
        },
      ])
      .toArray()

    return NextResponse.json({
      incoming: incomingRequests,
      outgoing: outgoingRequests,
    })
  } catch (error) {
    console.error("Get swap requests error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
