'use server'

import connectToDatabase from "../mongodb";
import { EventModel } from "@/database";
import type { Event } from "@/database";

export const getEventBySlug = async (slug: string): Promise<Event | null> => {
    try {
        await connectToDatabase();

        if (!slug || typeof slug !== "string") {
            return null;
        }

        const sanitizedSlug = slug.trim().toLowerCase();

        if (sanitizedSlug.length === 0) {
            return null;
        }

        const event = await EventModel.findOne({ slug: sanitizedSlug }).lean();
        return event as Event | null;
    } catch (error) {
        console.error("Error fetching event by slug:", error);
        return null;
    }
};

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectToDatabase();

        const sanitizedSlug = slug.trim().toLowerCase();
        const event = await EventModel.findOne({ slug: sanitizedSlug });
        if (!event) return [];
        return await EventModel.find({ _id: { $ne: event._id }, tags: { $in: event.tags } }).lean();

    } catch {
        return [];
    }
}