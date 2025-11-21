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
        throw new Error('Missing fields')
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
    } catch (error) {
        throw new Error('Failed to create user')
    }
}

export async function getUserDependencies(id: string) {
    await checkAdmin()

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    attendancesAsApprentice: true,
                    attendancesAsMaster: true,
                }
            }
        }
    })

    if (!user) throw new Error('User not found')

    return {
        asApprentice: user._count.attendancesAsApprentice,
        asMaster: user._count.attendancesAsMaster
    }
}

export async function deleteUser(id: string) {
    await checkAdmin()

    try {
        await prisma.$transaction(async (tx) => {
            // Delete all attendances where user is apprentice
            await tx.attendance.deleteMany({
                where: { apprenticeId: id }
            })

            // Delete all attendances where user is master
            await tx.attendance.deleteMany({
                where: { masterId: id }
            })

            // Finally delete the user
            await tx.user.delete({
                where: { id }
            })
        })

        revalidatePath('/dashboard/admin')
    } catch (error) {
        console.error('Delete user error:', error)
        throw new Error('Failed to delete user')
    }
}

export async function updatePassword(formData: FormData) {
    await checkAdmin()

    const id = formData.get('id') as string
    const password = formData.get('password') as string

    if (!id || !password) {
        throw new Error('Missing fields')
    }

    try {
        const hashedPassword = await hash(password, 12)
        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        })
        revalidatePath('/dashboard/admin')
    } catch (error) {
        throw new Error('Failed to update password')
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
        throw new Error('Missing fields')
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
    } catch (error) {
        console.error('Update user error:', error)
        throw new Error(`Failed to update user: ${(error as Error).message}`)
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

export async function getUserDetails(id: string) {
    await checkAdmin()

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            initiationDate: true,
            phone: true,
        }
    })

    if (!user) throw new Error('User not found')

    const attendances = await prisma.attendance.findMany({
        where: {
            apprenticeId: id
        },
        include: {
            activity: true,
            master: true,
        },
        orderBy: {
            date: 'desc'
        }
    })

    return { user, attendances }
}

export async function updateAttendanceAdmin(formData: FormData) {
    await checkAdmin()

    const id = formData.get('id') as string
    const date = formData.get('date') as string
    const location = formData.get('location') as string
    const activityId = formData.get('activityId') as string
    const masterId = formData.get('masterId') as string

    if (!id || !date || !location || !activityId || !masterId) {
        throw new Error('Missing fields')
    }

    try {
        await prisma.attendance.update({
            where: { id },
            data: {
                date: new Date(date),
                location,
                activityId,
                masterId,
            },
        })
        revalidatePath('/dashboard/admin')
    } catch (error) {
        console.error('Update attendance error:', error)
        throw new Error('Failed to update attendance')
    }
}

export async function deleteAttendanceAdmin(id: string) {
    await checkAdmin()

    try {
        await prisma.attendance.delete({
            where: { id }
        })
        revalidatePath('/dashboard/admin')
    } catch (error) {
        console.error('Delete attendance error:', error)
        throw new Error('Failed to delete attendance')
    }
}
