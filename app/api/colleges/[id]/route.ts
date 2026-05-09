import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsHeaders } from "@/lib/cors";

type Params = {
  params: {
    id: string;
  };
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(_: Request, { params }: Params) {
  try {
    const college = await prisma.college.findUnique({
      where: { id: params.id },
      include: {
        courses: true,
        reviews: {
          orderBy: {
            createdAt: "desc"
          }
        },
        placements: {
          orderBy: {
            year: "desc"
          }
        }
      }
    });

    if (!college) {
      const response = NextResponse.json({ error: "College not found" }, { status: 404 });
      Object.entries(corsHeaders()).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    const response = NextResponse.json({ data: college });
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (e) {
    const response = NextResponse.json({ error: "Failed to fetch college details" }, { status: 500 });
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }
}
