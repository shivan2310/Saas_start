import { NextResponse } from "next/server";
import { ApiResponse } from "@/types";

export async function GET() {
  const healthData: ApiResponse<{ status: string; timestamp: string }> = {
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
    },
    message: "System services functional",
  };

  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
