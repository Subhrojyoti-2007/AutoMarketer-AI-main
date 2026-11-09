import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { platform, content } = body;

    if (!platform || !content) {
      return NextResponse.json(
        { error: "platform and content are required" },
        { status: 400 }
      );
    }

    // Simulate database/API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const jobId = `job_${Math.random().toString(36).substring(2, 11)}`;
    const dispatchedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      dispatchedAt,
      jobId,
      platform,
    });
  } catch (error: any) {
    console.error("Error deploying campaign asset:", error);
    return NextResponse.json(
      { error: error.message || "Failed to deploy asset" },
      { status: 500 }
    );
  }
}
