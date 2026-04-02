import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/lib/auth'
import { prisma } from '@/server/lib/db'

export async function POST(req: NextRequest) {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: req.headers
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only allow role update for users who are currently CONSUMER
    // This prevents escalation attacks
    if (session.user.role !== 'CONSUMER') {
      return NextResponse.json(
        { error: 'Role already set' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { role } = body

    // Validate role
    if (!role || !['CONSUMER', 'VENDOR'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Update user role
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update OAuth role error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
