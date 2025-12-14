import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { EventModel } from '@/database'

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const formData = await req.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries());
        } catch (error) {
            return NextResponse.json({ message: 'Invalid form data format' }, { status: 400 })
        }

        const createdEvent = await EventModel.create(event);
        return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, { status: 201 })
    } catch (e) {
        console.log(e);
        return NextResponse.json({ message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'Unknown' }, { status: 500 });
    }
}