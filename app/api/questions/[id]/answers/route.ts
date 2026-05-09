import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";

const bodySchema = z.object({
  body: z.string().min(2).max(1000)
});

type Params = {
  params: {
    id: string;
  };
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const payload = requireAuth(req);
    const body = bodySchema.parse(await req.json());

    const question = await prisma.question.findUnique({ where: { id: params.id } });
    if (!question) {
      const response = NextResponse.json({ error: "Question not found" }, { status: 404 });
      Object.entries(corsHeaders()).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    const answer = await prisma.answer.create({
      data: {
        body: body.body,
        questionId: params.id,
        userId: payload.userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    const response = NextResponse.json({ data: answer }, { status: 201 });
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    let status = 500;
    let msg = "Failed to post answer";
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
