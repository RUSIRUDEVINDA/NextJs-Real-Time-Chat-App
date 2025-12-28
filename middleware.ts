import { NextRequest, NextResponse } from "next/server"
import { redis } from "./app/lib/redis"
import { nanoid } from "nanoid"

export const middleware = async (req: NextRequest) => {
    const pathname = req.nextUrl.pathname

    // Only run on /room/[roomId]
    const roomMatch = pathname.match(/^\/room\/([^/]+)$/)
    if (!roomMatch) return NextResponse.next()

    const roomId = roomMatch[1]

    // Check if room exists
    const meta = await redis.hgetall<{ connected: string[]; createdAt: number; ownerToken: string }>(
        `meta:${roomId}`
    )

    if (!meta) {
        return NextResponse.redirect(new URL("/?error=room-not-found", req.url))
    }

    const existingToken = req.cookies.get("x-auth-token")?.value

    // Parse connected array
    let connectedTokens: string[] = []
    if (meta.connected) {
        connectedTokens = typeof meta.connected === "string"
            ? JSON.parse(meta.connected)
            : meta.connected
    }

    // 1. If user already has a valid token for this room, let them in
    if (existingToken && connectedTokens.includes(existingToken)) {
        const response = NextResponse.next()
        if (meta.ownerToken === existingToken) {
            response.cookies.set("is-owner", "true", { path: `/room/${roomId}` })
        }
        return response
    }

    // 2. Room is full check
    if (connectedTokens.length >= 2) {
        return NextResponse.redirect(new URL("/?error=room-full", req.url))
    }

    // 3. New user joining
    const response = NextResponse.next()
    const token = nanoid()

    response.cookies.set("x-auth-token", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    })

    const isOwner = connectedTokens.length === 0
    if (isOwner) {
        response.cookies.set("is-owner", "true", { path: `/room/${roomId}` })
    }

    // Update Redis
    const newConnected = [...connectedTokens, token]
    const updates: Record<string, any> = {
        connected: JSON.stringify(newConnected),
    }

    if (isOwner) {
        updates.ownerToken = token
    }

    await redis.hset(`meta:${roomId}`, updates)

    return response
}

export const config = {
    matcher: "/room/:path*",
}
