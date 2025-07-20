import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Check if session exists and is valid
    const sessions = await sql`
      SELECT us.*, u.name, u.email 
      FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE us.session_token = ${sessionToken} 
      AND us.expires_at > NOW()
    `

    if (sessions.length === 0) {
      // Session expired or doesn't exist
      const response = NextResponse.json({ user: null }, { status: 200 })
      response.cookies.set("session", "", {
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
      return response
    }

    const session = sessions[0]
    const user = {
      id: session.user_id,
      name: session.name,
      email: session.email,
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
