'use server'

import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hash } from 'bcryptjs'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

async function checkAdmin() {
    const session = await getServerSession(authOptions)
    // @ts-ignore
    if (!session || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }
    return session
}

export async function getUsers() {
    await checkAdmin()
    return await prisma.user.findMany({
        orderBy: { name: 'asc' },
    })
}

export async function createUser(formData: FormData) {
    await checkAdmin()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string
    const initiationDate = formData.get('initiationDate') as string
    const phone = formData.get('phone') as string

    if (!name || !email || !password || !role) {
        return { error: 'Missing fields' }
    }

    try {
        const hashedPassword = await hash(password, 12)
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                initiationDate: initiationDate && initiationDate !== '' ? new Date(initiationDate) : null,
                phone: phone || null,
            },
        })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to create user' }
    }
}

export async function deleteUser(id: string) {
    await checkAdmin()

    try {
        await prisma.user.delete({ where: { id } })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to delete user' }
    }
}

export async function updatePassword(formData: FormData) {
    await checkAdmin()

    const id = formData.get('id') as string
    const password = formData.get('password') as string

    if (!id || !password) {
        return { error: 'Missing fields' }
    }

    try {
        const hashedPassword = await hash(password, 12)
        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to update password' }
    }
}

export async function updateUser(formData: FormData) {
    await checkAdmin()

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const role = formData.get('role') as string
    const initiationDate = formData.get('initiationDate') as string
    const phone = formData.get('phone') as string

    if (!id || !name || !email || !role) {
        return { error: 'Missing fields' }
    }

    try {
        await prisma.user.update({
            where: { id },
            data: {
                name,
                email,
                role,
                initiationDate: initiationDate && initiationDate !== '' ? new Date(initiationDate) : null,
                phone: phone || null,
            },
        })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (error) {
        console.error('Update user error:', error)
        return { error: `Failed to update user: ${(error as Error).message}` }
    }
}

export async function getUsersProgress() {
    await checkAdmin()

    const users = await prisma.user.findMany({
        where: {
            role: {
                in: ['APPRENTICE', 'FELLOWCRAFT']
            }
        },
        include: {
            attendancesAsApprentice: {
                where: {
                    status: 'APPROVED'
                },
                include: {
                    activity: true
                }
            }
        },
        orderBy: {
            name: 'asc'
        }
    })

    return users
}

export async function getAdminPendingAttendance() {
    await checkAdmin()

    return await prisma.attendance.findMany({
        where: {
            status: 'PENDING',
        },
        include: { activity: true, apprentice: true, master: true },
        orderBy: { date: 'desc' },
    })
}

export async function getAdminApprovedAttendance() {
    await checkAdmin()

    return await prisma.attendance.findMany({
        where: {
            status: 'APPROVED',
        },
        include: { activity: true, apprentice: true, master: true },
        orderBy: { date: 'desc' },
    })
}
