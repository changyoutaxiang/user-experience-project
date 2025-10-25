import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const updateExpenseSchema = z.object({
  amount: z.number().positive('金额必须大于0').optional(),
  description: z.string().min(1, '支出描述不能为空').optional(),
  category: z.string().optional(),
  expenseDate: z.string().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: { id: true, name: true, description: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!expense) {
      return NextResponse.json({ error: '支出记录不存在' }, { status: 404 })
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Get expense error:', error)
    return NextResponse.json(
      { error: '获取支出记录失败' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const validation = updateExpenseSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    // 检查支出记录是否存在
    const existingExpense = await prisma.expense.findUnique({
      where: { id: params.id }
    })

    if (!existingExpense) {
      return NextResponse.json({ error: '支出记录不存在' }, { status: 404 })
    }

    const updateData: any = {}
    const { amount, description, category, expenseDate } = validation.data

    if (amount !== undefined) updateData.amount = amount
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (expenseDate !== undefined) updateData.date = new Date(expenseDate)

    const expense = await prisma.expense.update({
      where: { id: params.id },
      data: updateData,
      include: {
        project: {
          select: { id: true, name: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Update expense error:', error)
    return NextResponse.json(
      { error: '更新支出记录失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    // 检查支出记录是否存在
    const expense = await prisma.expense.findUnique({
      where: { id: params.id }
    })

    if (!expense) {
      return NextResponse.json({ error: '支出记录不存在' }, { status: 404 })
    }

    await prisma.expense.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: '支出记录已删除' })
  } catch (error) {
    console.error('Delete expense error:', error)
    return NextResponse.json(
      { error: '删除支出记录失败' },
      { status: 500 }
    )
  }
}
