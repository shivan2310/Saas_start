import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ApiResponse } from "@/types";

const updateUserSchema = z.object({
  uid: z.string().min(1, "UID is required"),
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Server-side Zod validation
    const validationResult = updateUserSchema.safeParse(body);
    if (!validationResult.success) {
      const apiErrorResponse: ApiResponse = {
        success: false,
        error: validationResult.error.errors[0].message,
      };
      return NextResponse.json(apiErrorResponse, { status: 400 });
    }

    const { uid, displayName } = validationResult.data;

    const apiSuccessResponse: ApiResponse<{ uid: string; displayName: string }> = {
      success: true,
      data: { uid, displayName },
      message: "User profile updated successfully",
    };

    return NextResponse.json(apiSuccessResponse, { status: 200 });
  } catch (error: any) {
    console.error("API Error [POST /api/user]:", error);
    const apiErrorResponse: ApiResponse = {
      success: false,
      error: "Internal Server Error",
    };
    return NextResponse.json(apiErrorResponse, { status: 500 });
  }
}
