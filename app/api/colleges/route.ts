import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const search = searchParams.get("search")?.trim() || "";
    const location = searchParams.get("location")?.trim() || "";
    const minFees = Number(searchParams.get("minFees") || "0");
    const maxFees = Number(searchParams.get("maxFees") || "10000000");
    const page = Number(searchParams.get("page") || "1");
    const pageSize = Number(searchParams.get("pageSize") || "6");

    const where = {
      AND: [
        search
          ? {
              name: {
                contains: search,
                mode: "insensitive" as const
              }
            }
          : {},
        location
          ? {
              location: {
                equals: location,
                mode: "insensitive" as const
              }
            }
          : {},
        {
          fees: {
            gte: minFees,
            lte: maxFees
          }
        }
      ]
    };

    const [total, colleges] = await Promise.all([
      prisma.college.count({ where }),
      prisma.college.findMany({
        where,
        orderBy: [{ rating: "desc" }, { name: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);

    const response = NextResponse.json({
      data: colleges,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize))
      }
    });
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (e) {
    const response = NextResponse.json({ error: "Failed to fetch colleges" }, { status: 500 });
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }
}
