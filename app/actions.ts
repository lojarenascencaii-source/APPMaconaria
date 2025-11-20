'use server'

import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { hash, compare } from 'bcryptjs'
import { sendApprovalNotification } from '@/lib/email'
import crypto from 'crypto'

const prisma = new PrismaClient()

export async function getActivities() {
    return await prisma.activity.findMany()
}

export async function getMasters() {
    return await prisma.user.findMany({
        where: {
            role: {
                in: ['MASTER', 'ADMIN']
            }
        },
        select: { id: true, name: true },
    })
}

export async function submitAttendance(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        throw new Error( 'Unauthorized' }
    }

    const date = formData.get('date') as string
    const location = formData.get('location') as string
    const activityId = formData.get('activityId') as string
    const masterId = formData.get('masterId') as string

    if (!date || !location || !activityId || !masterId) {
        throw new Error( 'Missing fields' }
    }

    try {
        // Generate approval token
        const approvalToken = crypto.randomBytes(32).toString('hex')
        const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

        // Create attendance
        const attendance = await prisma.attendance.create({
            data: {
                date: new Date(date),
                location,
                activityId,
                masterId,
                // @ts-ignore
                apprenticeId: session.user.id,
                approvalToken,
                tokenExpiry,
            },
            include: {
                activity: true,
                master: true,
                apprentice: true,
            },
        })

        // Send email notification to master
        if (attendance.master.email) {
            await sendApprovalNotification(
                attendance.master.email,
                attendance.master.name,
                attendance.apprentice.name,
                attendance.activity.name,
                new Date(attendance.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
                attendance.location,
                attendance.id,
                approvalToken
            )
        }

        revalidatePath('/dashboard')
        // Success
    } catch (error) {
        console.error(error)
        throw new Error( 'Failed to submit attendance' }
    }
}

export async function getApprenticeAttendance() {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) return []

    return await prisma.attendance.findMany({
        // @ts-ignore
        where: { apprenticeId: session.user.id },
        include: { activity: true, master: true },
        orderBy: { date: 'desc' },
    })
}

export async function getPendingAttendance() {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) return []

    return await prisma.attendance.findMany({
        where: {
            // @ts-ignore
            masterId: session.user.id,
            status: 'PENDING',
        },
        include: { activity: true, apprentice: true },
        orderBy: { date: 'desc' },
    })
}

export async function approveAttendance(id: string) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) throw new Error( 'Unauthorized' }

    try {
        await prisma.attendance.update({
            where: { id },
            data: { status: 'APPROVED' },
        })
        revalidatePath('/dashboard')
        // Success
    } catch (error) {
        throw new Error( 'Failed to approve' }
    }
}

export async function deleteAttendance(id: string) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) throw new Error( 'Unauthorized' }

    try {
        // Verify the attendance belongs to the current user and is pending
        const attendance = await prisma.attendance.findUnique({
            where: { id },
        })

        // @ts-ignore
        if (!attendance || attendance.apprenticeId !== session.user.id) {
            throw new Error( 'Unauthorized' }
        }

        if (attendance.status !== 'PENDING') {
            throw new Error( 'Cannot delete approved/rejected attendance' }
        }

        await prisma.attendance.delete({
            where: { id },
        })
        revalidatePath('/dashboard')
        // Success
    } catch (error) {
        throw new Error( 'Failed to delete attendance' }
    }
}

export async function updateAttendance(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) throw new Error( 'Unauthorized' }

    const id = formData.get('id') as string
    const date = formData.get('date') as string
    const location = formData.get('location') as string
    const activityId = formData.get('activityId') as string
    const masterId = formData.get('masterId') as string

    if (!id || !date || !location || !activityId || !masterId) {
        throw new Error( 'Missing fields' }
    }

    try {
        // Verify the attendance belongs to the current user and is pending
        const attendance = await prisma.attendance.findUnique({
            where: { id },
        })

        // @ts-ignore
        if (!attendance || attendance.apprenticeId !== session.user.id) {
            throw new Error( 'Unauthorized' }
        }

        if (attendance.status !== 'PENDING') {
            throw new Error( 'Cannot edit approved/rejected attendance' }
        }

        await prisma.attendance.update({
            where: { id },
            data: {
                date: new Date(date),
                location,
                activityId,
                masterId,
            },
        })
        revalidatePath('/dashboard')
        // Success
    } catch (error) {
        console.error(error)
        throw new Error( 'Failed to update attendance' }
    }
}

export async function getApprovedAttendance() {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) return []

    return await prisma.attendance.findMany({
        where: {
            // @ts-ignore
            masterId: session.user.id,
            status: 'APPROVED',
        },
        include: { activity: true, apprentice: true },
        orderBy: { date: 'desc' },
    })
}

export async function getCurrentUser() {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return null
    }

    // @ts-ignore
    return await prisma.user.findUnique({
        // @ts-ignore
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            initiationDate: true,
        },
    })
}

export async function updateOwnProfile(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        throw new Error( 'Unauthorized' }
    }

    const email = formData.get('email') as string
    const phone = formData.get('phone') as string

    if (!email) {
        throw new Error( 'Email is required' }
    }

    try {
        // @ts-ignore
        await prisma.user.update({
            // @ts-ignore
            where: { id: session.user.id },
            data: {
                email,
                phone: phone || null,
            },
        })
        revalidatePath('/dashboard/profile')
        // Success
    } catch (error) {
        throw new Error( 'Failed to update profile' }
    }
}

export async function updateOwnPassword(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        throw new Error( 'Unauthorized' }
    }

    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error( 'All fields are required' }
    }

    if (newPassword !== confirmPassword) {
        throw new Error( 'New passwords do not match' }
    }

    if (newPassword.length < 6) {
        throw new Error( 'Password must be at least 6 characters' }
    }

    try {
        // @ts-ignore
        const user = await prisma.user.findUnique({
            // @ts-ignore
            where: { id: session.user.id },
        })

        if (!user) {
            throw new Error( 'User not found' }
        }

        const isValid = await compare(currentPassword, user.password)
        if (!isValid) {
            throw new Error( 'Current password is incorrect' }
        }

        const hashedPassword = await hash(newPassword, 12)
        await prisma.user.update({
            // @ts-ignore
            where: { id: session.user.id },
            data: { password: hashedPassword },
        })

        revalidatePath('/dashboard/profile')
        // Success
    } catch (error) {
        throw new Error( 'Failed to update password' }
    }
}

export async function resendApprovalRequest(attendanceId: string) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        throw new Error( 'Unauthorized' }
    }

    try {
        const attendance = await prisma.attendance.findUnique({
            where: { id: attendanceId },
            include: {
                activity: true,
                master: true,
                apprentice: true,
            },
        })

        if (!attendance) {
            throw new Error( 'Attendance not found' }
        }

        // @ts-ignore
        if (attendance.apprenticeId !== session.user.id) {
            throw new Error( 'Unauthorized' }
        }

        if (attendance.status !== 'PENDING') {
            throw new Error( 'Can only resend for pending approvals' }
        }

        // Send email notification to master
        if (attendance.master.email) {
            await sendApprovalNotification(
                attendance.master.email,
                attendance.master.name,
                attendance.apprentice.name,
                attendance.activity.name,
                new Date(attendance.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
                attendance.location,
                attendance.id
            )
        }

        // Success
    } catch (error) {
        console.error(error)
        throw new Error( 'Failed to resend notification' }
    }
}
