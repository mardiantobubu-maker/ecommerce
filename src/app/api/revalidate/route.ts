import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, now: Date.now() });
    }

    return NextResponse.json(
      { revalidated: false, message: 'Missing path to revalidate' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { revalidated: false, message: err.message },
      { status: 500 }
    );
  }
}
