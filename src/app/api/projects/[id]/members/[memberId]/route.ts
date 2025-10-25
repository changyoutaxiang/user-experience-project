import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    // 检查成员记录是否存在
    const member = await prisma.projectMember.findUnique({
      where: { id: params.memberId },
      include: {
        project: true
      }
    })

    if (!member) {
      return NextResponse.json({ error: '成员记录不存在' }, { status: 404 })
    }

    // 验证是否属于正确的项目
    if (member.projectId !== params.id) {
      return NextResponse.json({ error: '成员不属于该项目' }, { status: 400 })
    }

    await prisma.projectMember.delete({
      where: { id: params.memberId }
    })

    return NextResponse.json({ message: '成员已移除' })
  } catch (error) {
    console.error('Remove project member error:', error)
    return NextResponse.json(
      { error: '移除项目成员失败' },
      { status: 500 }
    )
  }
}
