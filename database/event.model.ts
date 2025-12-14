import mongoose, { Schema, model, models, type HydratedDocument, type Model } from "mongoose";

export type EventMode = "online" | "offline" | "hybrid";

export interface Event {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // normalized ISO date (YYYY-MM-DD)
  time: string; // normalized time (HH:mm, 24h)
  mode: EventMode;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

type EventDocument = HydratedDocument<Event>;

function assertNonEmpty(label: string, value: unknown): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} is required.`);
  }
}

function slugify(input: string): string {
  // Lowercase + collapse whitespace + keep URL-safe characters.
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeIsoDate(input: string): string {
  // Accepts many common date formats; stores as ISO date (YYYY-MM-DD) for consistency.
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid date.");
  return d.toISOString().slice(0, 10);
}

function normalizeTime(input: string): string {
  // Stores time as HH:mm (24h). Supports "HH:mm", "HH:mm:ss", and "h:mm AM/PM".
  const trimmed = input.trim();

  const m24 = /^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(trimmed);
  if (m24) {
    const hh = m24[1].padStart(2, "0");
    const mm = m24[2];
    return `${hh}:${mm}`;
  }

  const m12 = /^(1[0-2]|0?[1-9]):([0-5]\d)\s*(am|pm)$/i.exec(trimmed);
  if (m12) {
    let hh = Number(m12[1]);
    const mm = m12[2];
    const ap = m12[3].toLowerCase();
    if (ap === "pm" && hh !== 12) hh += 12;
    if (ap === "am" && hh === 12) hh = 0;
    return `${String(hh).padStart(2, "0")}:${mm}`;
  }

  throw new Error("Invalid time.");
}

const EventSchema = new Schema<Event>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: {
      type: String,
      required: true,
      enum: ["online", "offline", "hybrid"],
    },
    audience: { type: String, required: true, trim: true },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "Agenda must have at least one item.",
      },
    },
    organizer: { type: String, required: true, trim: true },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "Tags must have at least one item.",
      },
    },
  },
  {
    timestamps: true, // auto-manages createdAt/updatedAt
    strict: true,
  },
);

// Unique index for fast slug lookups and to enforce uniqueness at the DB level.
EventSchema.index({ slug: 1 }, { unique: true });

EventSchema.pre("save", function (this: EventDocument) {
  // Validate required string fields are non-empty (beyond "required: true").
  assertNonEmpty("Title", this.title);
  assertNonEmpty("Description", this.description);
  assertNonEmpty("Overview", this.overview);
  assertNonEmpty("Image", this.image);
  assertNonEmpty("Venue", this.venue);
  assertNonEmpty("Location", this.location);
  assertNonEmpty("Date", this.date);
  assertNonEmpty("Time", this.time);
  assertNonEmpty("Audience", this.audience);
  assertNonEmpty("Organizer", this.organizer);

  if (!Array.isArray(this.agenda) || this.agenda.length === 0) {
    throw new Error("Agenda must have at least one item.");
  }

  if (!Array.isArray(this.tags) || this.tags.length === 0) {
    throw new Error("Tags must have at least one item.");
  }

  // Only regenerate slug when the title changes.
  if (this.isModified("title")) {
    const s = slugify(this.title);
    if (!s) throw new Error("Title must produce a valid slug.");
    this.slug = s;
  }

  // Normalize date/time to consistent formats.
  if (this.isNew || this.isModified("date")) this.date = normalizeIsoDate(this.date);
  if (this.isNew || this.isModified("time")) this.time = normalizeTime(this.time);
});

export const EventModel: Model<Event> =
  (models.Event as Model<Event> | undefined) ?? model<Event>("Event", EventSchema);
