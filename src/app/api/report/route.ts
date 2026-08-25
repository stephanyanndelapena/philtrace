import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scoreReportSeverity } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { projectId, text, otpCode, photoUrl } = await req.json();

    if (!projectId || !text) {
      return NextResponse.json(
        { error: 'Project ID and report text are required.' },
        { status: 400 }
      );
    }

    // OTP Verification logic: Any 6-digit code or simulation accepted in hackathon mode
    const isValidOtp = !otpCode || otpCode.length === 6;
    if (!isValidOtp) {
      return NextResponse.json(
        { error: 'Invalid 6-digit SMS OTP verification code.' },
        { status: 400 }
      );
    }

    // Use Gemini to score severity and rationale
    const { severity, rationale } = await scoreReportSeverity(text);

    // Create whistleblower comment record in DB
    const newComment = await db.comment.create({
      data: {
        projectId,
        text,
        severity,
        rationale,
        phoneVerified: true,
        corroborationCount: 1,
        photoUrl: photoUrl || null,
      },
    });

    // Update project lastActivityAt timestamp
    await db.project.update({
      where: { id: projectId },
      data: { lastActivityAt: new Date() },
    });

    return NextResponse.json({ success: true, report: newComment });
  } catch (error) {
    console.error('Report API Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit whistleblower report' },
      { status: 500 }
    );
  }
}
