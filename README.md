SlotSwapper – Calendar Slot Exchange Platform

Live Demo: https://service-hive-mu.vercel.app

GitHub Repository: https://github.com/uday-bhardwaj-15/ServiceHive

🧭 Overview

SlotSwapper is a peer-to-peer calendar management platform that helps users exchange their busy time slots with others.
If someone can’t attend a meeting or needs a different time, they can easily swap slots with another user through the marketplace — no manual coordination required.

✨ Features

🔐 User Authentication – Secure signup/login using JWT

📅 Event Management – Create, edit, or delete calendar events

🔄 Swappable Slots – Mark specific events as available for swapping

🛍️ Marketplace – Browse other users’ swappable slots

🤝 Swap Requests – Propose and confirm time slot exchanges

⚡ Real-time Status – View pending, accepted, or rejected swap requests instantly

⚙️ How It Works
1️⃣ Create Events

Each user creates their own events (like meetings, calls, or personal tasks) with:

Title

Start & end time

Optional description

“Swappable” toggle

Example:
You have a Team Meeting from 2–3 PM and want to move it later.

2️⃣ Mark Event as Swappable

From your dashboard, mark your event as swappable.
This makes your slot visible in the Marketplace, where others can see that you’re open to exchanging it.

3️⃣ Marketplace View

Other users can browse the marketplace to see all available slots that people are willing to swap.
Each listing shows:

Event title

Time

Who posted it

4️⃣ Send a Swap Request (Requires 2 Users)

When User A finds User B’s swappable slot:

User A selects one of their own events to offer in exchange.

User A clicks “Request Swap” and submits the proposal.

User B receives the request and can Accept or Reject it.

If accepted, both users’ calendars automatically update — the two events are swapped between their accounts.

Example:

User A: Meeting 2–3 PM (wants later)

User B: Meeting 3–4 PM (wants earlier)
→ After acceptance, A gets 3–4 PM, and B gets 2–3 PM.

5️⃣ Manage Requests

Users can track their requests from the Requests page:

Incoming Requests: Others proposing to swap with you.

Outgoing Requests: Requests you’ve sent.
You can accept, reject, or cancel pending requests anytime.

🧰 Tech Stack

Frontend: Next.js 16, Tailwind CSS

Backend: Node.js, MongoDB (Mongoose), Next API Routes

Auth: JWT

Hosting: Vercel

🗂️ Database Overview
Users
{
email: String,
password: String (hashed),
createdAt: Date
}

Events
{
userId: ObjectId,
title: String,
startTime: Date,
endTime: Date,
description: String,
swappable: Boolean
}

Swap Requests
{
requesterId: ObjectId,
requestedSlotId: ObjectId,
offeredSlotId: ObjectId,
status: "pending" | "accepted" | "rejected"
}

🧩 API Summary

POST /api/auth/signup → Register user

POST /api/auth/login → Login user

POST /api/events → Create event

GET /api/swappable-slots → Fetch available swappable slots

POST /api/swap-request → Send a swap request

PATCH /api/swap-response/:id → Accept or reject swap request

⚡ Getting Started Locally

Clone repo

git clone https://github.com/uday-bhardwaj-15/ServiceHive.git
cd slot-swapper
npm install

Create .env.local

MONGODB_URI=your-mongo-uri
JWT_SECRET=your-jwt-secret

Run server

npm run dev
