import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import { collegeTrackingStatuses } from "@/lib/college-tracking";

const bodySchema = z.object({
  collegeId: z.string(),
  status: z.enum(collegeTrackingStatuses).optional(),
  deadline: z.string().nullable().optional(),
  notes: z.string().nullable().optional()
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req);
    const items = await prisma.savedCollege.findMany({
      where: { userId: payload.userId },
      include: { college: true },
      orderBy: { createdAt: "desc" }
    });

    const response = NextResponse.json({ data: items });
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    const msg = error instanceof Error && error.message === "Unauthorized" ? "Unauthorized" : "Failed to fetch saved colleges";
    const response = NextResponse.json({ error: msg }, { status });
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = requireAuth(req);
    const body = bodySchema.parse(await req.json());

    const saved = await prisma.savedCollege.upsert({
      where: {
        userId_collegeId: {
          userId: payload.userId,
          collegeId: body.collegeId
        }
      },
      create: {
        userId: payload.userId,
        collegeId: body.collegeId,
        status: body.status || "LONG_LIST",
        deadline: body.deadline ? new Date(body.deadline) : null,
        notes: body.notes || null
      },
      update: {
        status: body.status || "LONG_LIST",
        deadline: body.deadline ? new Date(body.deadline) : null,
        notes: body.notes || null
      },
      include: {
        college: true
      }
    });

    const response = NextResponse.json({ data: saved }, { status: 201 });
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    let status = 500;
    let msg = "Failed to save college";
    if (error instanceof z.ZodError) {
      status = 400;
      msg = error.issues[0]?.message || "Invalid input";
    } else if (error instanceof Error && error.message === "Unauthorized") {
      status = 401;
      msg = "Unauthorized";
    }
    const response = NextResponse.json({ error: msg }, { status });
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const payload = requireAuth(req);
    const body = bodySchema.parse(await req.json());

    await prisma.savedCollege.deleteMany({
      where: {
        userId: payload.userId,
        collegeId: body.collegeId
      }
    });

    const response = NextResponse.json({ success: true });
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    let status = 500;
    let msg = "Failed to remove saved college";
    if (error instanceof z.ZodError) {
      status = 400;
      msg = error.issues[0]?.message || "Invalid input";
    } else if (error instanceof Error && error.message === "Unauthorized") {
      status = 401;
      msg = "Unauthorized";
    }
    const response = NextResponse.json({ error: msg }, { status });
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }
}
