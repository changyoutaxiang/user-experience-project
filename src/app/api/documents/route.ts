import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const createDocumentSchema = z.object({
  title: z.string().min(1, '文档标题不能为空'),
  url: z.string().url('URL格式不正确'),
  projectId: z.string().uuid('无效的项目ID'),
  description: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    const where: any = {}
    if (projectId) where.projectId = projectId

    const documents = await prisma.documentLink.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true }
        },
        uploadedBy: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { uploadedAt: 'desc' }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json(
      { error: '获取文档列表失败' },
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
    const validation = createDocumentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { title, url, projectId, description } = validation.data

    // 验证项目是否存在
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 })
    }

    const document = await prisma.documentLink.create({
      data: {
        title,
        url,
        description: description || null,
        projectId,
        uploadedById: (session.user as any).id,
      },
      include: {
        project: {
          select: { id: true, name: true }
        },
        uploadedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Create document error:', error)
    return NextResponse.json(
      { error: '添加文档失败' },
      { status: 500 }
    )
  }
}
