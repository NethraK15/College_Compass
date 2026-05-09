import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";

const bodySchema = z.object({
  title: z.string().min(6).max(120),
  body: z.string().min(10).max(1000)
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        answers: {
          orderBy: { createdAt: "asc" },
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    const response = NextResponse.json({ data: questions });
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (e) {
    const response = NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
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

    const question = await prisma.question.create({
      data: {
        title: body.title,
        body: body.body,
        userId: payload.userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        answers: true
      }
    });

    const response = NextResponse.json({ data: question }, { status: 201 });
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    let status = 500;
    let msg = "Failed to post question";
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
