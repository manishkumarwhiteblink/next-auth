import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        console.log(session);

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        return NextResponse.json({ success: true });
    }
}