import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { EventModel } from "@/database";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Await params (Next.js 15+ requirement)
    const { slug } = await params;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { message: "Slug parameter is required and must be a valid string" },
        { status: 400 }
      );
    }

    // Sanitize slug (remove whitespace, ensure it's URL-safe)
    const sanitizedSlug = slug.trim().toLowerCase();

    if (sanitizedSlug.length === 0) {
      return NextResponse.json(
        { message: "Slug cannot be empty" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Query event by slug
    const event = await EventModel.findOne({ slug: sanitizedSlug }).lean();

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { message: `Event with slug "${sanitizedSlug}" not found` },
        { status: 404 }
      );
    }

    // Return event data
    return NextResponse.json(
      { event },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    console.error("Error fetching event by slug:", error);

    // Handle specific error types
    if (error instanceof Error) {
      // Database connection errors
      if (error.name === "MongooseError" || error.message.includes("connection")) {
        return NextResponse.json(
          { message: "Database connection error. Please try again later." },
          { status: 503 }
        );
      }

      // Mongoose casting errors (invalid slug format)
      if (error.name === "CastError") {
        return NextResponse.json(
          { message: "Invalid slug format" },
          { status: 400 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        message: "Failed to fetch event",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
