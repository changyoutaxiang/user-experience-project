import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { tasks: true, members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: '获取项目列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, budget, startDate, endDate } = body

    const project = await prisma.project.create({
      data: {
        name,
        description,
        budget: budget || 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        ownerId: (session.user as any).id,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json(
      { error: '创建项目失败' },
      { status: 500 }
    )
  }
}
