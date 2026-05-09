import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";

const bodySchema = z.object({
  name: z.string().min(3).max(80),
  collegeIds: z.array(z.string()).min(2).max(3)
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req);
    const items = await prisma.savedComparison.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: "desc" }
    });

    const collegeMap = await prisma.college.findMany({
      where: {
        id: {
          in: items.flatMap((item) => item.collegeIds)
        }
      },
      select: {
        id: true,
        name: true,
        location: true,
        fees: true,
        rating: true,
        placementRate: true
      }
    });

    const collegeById = Object.fromEntries(collegeMap.map((college) => [college.id, college]));

    const hydrated = items.map((item) => ({
      ...item,
      colleges: item.collegeIds.map((id) => collegeById[id]).filter(Boolean)
    }));

    const response = NextResponse.json({ data: hydrated });
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    const msg = error instanceof Error && error.message === "Unauthorized" ? "Unauthorized" : "Failed to fetch saved comparisons";
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

    const comparison = await prisma.savedComparison.create({
      data: {
        userId: payload.userId,
        name: body.name,
        collegeIds: body.collegeIds
      }
    });

    const response = NextResponse.json({ data: comparison }, { status: 201 });
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    let status = 500;
    let msg = "Failed to save comparison";
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
