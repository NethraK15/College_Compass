import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { corsHeaders } from "@/lib/cors";

const bodySchema = z.object({
  exam: z.enum(["JEE", "NEET", "CAT"]),
  rank: z.number().int().positive()
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.parse(await req.json());

    const matchingRules = await prisma.eligibilityRule.findMany({
      where: {
        exam: body.exam,
        minRank: {
          lte: body.rank
        },
        maxRank: {
          gte: body.rank
        }
      },
      include: {
        college: true
      },
      orderBy: {
        college: {
          rating: "desc"
        }
      }
    });

    const response = NextResponse.json({
      data: matchingRules.map((rule) => ({
        id: rule.college.id,
        name: rule.college.name,
        location: rule.college.location,
        fees: rule.college.fees,
        rating: rule.college.rating,
        rankRange: `${rule.minRank} - ${rule.maxRank}`
      }))
    });
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    const status = error instanceof z.ZodError ? 400 : 500;
    const msg = error instanceof z.ZodError ? error.issues[0]?.message || "Invalid input" : "Failed to predict eligible colleges";
    const response = NextResponse.json({ error: msg }, { status });
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }
}
