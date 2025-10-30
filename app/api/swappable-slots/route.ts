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
    const eventsCollection = db.collection("events")
    const usersCollection = db.collection("users")

    const swappableSlots = await eventsCollection
      .aggregate([
        {
          $match: {
            status: "SWAPPABLE",
            userId: { $ne: new ObjectId(userId) },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "owner",
          },
        },
        {
          $unwind: "$owner",
        },
        {
          $project: {
            _id: 1,
            title: 1,
            startTime: 1,
            endTime: 1,
            status: 1,
            "owner.name": 1,
            "owner.email": 1,
            "owner._id": 1,
          },
        },
      ])
      .toArray()

    return NextResponse.json(swappableSlots)
  } catch (error) {
    console.error("Get swappable slots error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
