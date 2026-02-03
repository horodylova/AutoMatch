import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only Super Admins can add new users' }, { status: 403 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return NextResponse.json({ error: 'Admin with this email already exists' }, { status: 400 });
    }

    // Hash default password '00000'
    const passwordHash = await bcrypt.hash('00000', 10);

    await prisma.admin.create({
      data: {
        email,
        passwordHash,
        role: 'ADMIN',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Add admin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
