import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";

const bodySchema = z.object({
  collegeIds: z.array(z.string()).min(2).max(3),
  save: z.boolean().optional(),
  name: z.string().min(3).max(80).optional()
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.parse(await req.json());

    const colleges = await prisma.college.findMany({
      where: {
        id: {
          in: body.collegeIds
        }
      },
      select: {
        id: true,
        name: true,
        fees: true,
        placementRate: true,
        rating: true,
        location: true
      }
    });

    if (colleges.length < 2) {
      const response = NextResponse.json({ error: "At least 2 valid colleges required" }, { status: 400 });
      Object.entries(corsHeaders()).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    let savedComparison = null;
    if (body.save) {
      const payload = requireAuth(req);
      savedComparison = await prisma.savedComparison.create({
        data: {
          userId: payload.userId,
          name: body.name || `Comparison - ${new Date().toLocaleDateString()}`,
          collegeIds: colleges.map((c) => c.id)
        }
      });
    }

    const response = NextResponse.json({
      data: {
        colleges,
        savedComparison
      }
    });
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    let status = 500;
    let msg = "Failed to compare colleges";
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
