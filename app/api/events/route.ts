import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import connectToDatabase from "@/lib/mongodb";
import { EventModel } from "@/database";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const formData = await req.formData();

        // Extract image file FIRST before converting formData to object
        const file = formData.get("image");

        if (!file || typeof (file as any).arrayBuffer !== "function") {
            return NextResponse.json(
                { message: "Image file is required and must be a valid file upload" },
                { status: 400 },
            );
        }

        // Remove image from formData so it doesn't get included in event object
        formData.delete("image");

        let event;

        try {
            event = Object.fromEntries(formData.entries());
        } catch (error) {
            return NextResponse.json(
                { message: "Invalid form data format" },
                { status: 400 },
            );
        }

        const tagsString = formData.get('tags') as string | null;
        const agendaString = formData.get('agenda') as string | null;

        if (!tagsString || !agendaString) {
            return NextResponse.json(
                { message: "Tags and agenda are required" },
                { status: 400 },
            );
        }

        // Remove slug if it exists (it will be auto-generated from title)
        delete event.slug;

        const arrayBuffer = await (file as Blob).arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    { resource_type: "image", folder: "DevEvent" },
                    (error, results) => {
                        if (error) return reject(error);
                        resolve(results);
                    },
                )
                .end(buffer);
        });

        event.image = (uploadResult as { secure_url: string }).secure_url;

        // Normalize mode value to match schema enum
        if (event.mode) {
            const modeStr = String(event.mode).toLowerCase();
            if (modeStr.includes('online') && modeStr.includes('person')) {
                event.mode = 'hybrid';
            } else if (modeStr.includes('online')) {
                event.mode = 'online';
            } else if (modeStr.includes('offline') || modeStr.includes('person')) {
                event.mode = 'offline';
            }
        }

        // Try to parse tags/agenda as JSON; if that fails, accept comma-separated strings.
        let tags: string[];
        let agenda: string[];
        try {
            tags = JSON.parse(tagsString);
        } catch {
            tags = tagsString.split(",").map((t) => t.trim()).filter(Boolean);
        }
        try {
            agenda = JSON.parse(agendaString);
        } catch {
            agenda = agendaString.split(",").map((a) => a.trim()).filter(Boolean);
        }

        if (!Array.isArray(tags) || tags.length === 0 || !Array.isArray(agenda) || agenda.length === 0) {
            return NextResponse.json(
                { message: "Tags and agenda must be non-empty lists" },
                { status: 400 },
            );
        }

        const createdEvent = await EventModel.create({
            ...event,
            tags: tags,
            agenda: agenda,

        });
        return NextResponse.json(
            { message: "Event created successfully", event: createdEvent },
            { status: 201 },
        );
    } catch (e) {
        console.log(e);
        return NextResponse.json(
            {
                message: "Event Creation Failed",
                error: e instanceof Error ? e.message : "Unknown",
            },
            { status: 500 },
        );
    }
}

export async function GET() {
    try {
        await connectToDatabase();

        const events = await EventModel.find().sort({ createdAt: -1 });

        return NextResponse.json({ events }, { status: 200 });
    } catch (e) {
        return NextResponse.json(
            {
                message: "Event fetching failed",
                error: e instanceof Error ? e.message : "Unknown",
            },
            { status: 500 },
        );
    }
}