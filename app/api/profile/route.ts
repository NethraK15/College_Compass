import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        university: true,
        academicYear: true,
        major: true,
        location: true,
        profileImage: true,
        awards: true,
        createdAt: true
      }
    });

    if (!user) {
      const response = NextResponse.json({ error: "Not found" }, { status: 404 });
      Object.entries(corsHeaders()).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }
    const response = NextResponse.json(user);
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (e) {
    const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }
}

export async function PUT(req: NextRequest) {
  try {
    const payload = requireAuth(req);
    const body = await req.json();
    const allowed: any = {};
    const fields = [
      "name",
      "bio",
      "university",
      "academicYear",
      "major",
      "location",
      "profileImage",
      "awards"
    ];
    for (const f of fields) {
      if (body[f] !== undefined) allowed[f] = body[f];
    }

    const updated = await prisma.user.update({
      where: { id: payload.userId },
      data: allowed,
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        university: true,
        academicYear: true,
        major: true,
        location: true,
        profileImage: true,
        awards: true,
        updatedAt: true
      }
    });

    const response = NextResponse.json(updated);
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (e: any) {
    const response = NextResponse.json({ error: e?.message || "Unauthorized" }, { status: 401 });
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }
}
