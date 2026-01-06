import { Schema, model, models, type HydratedDocument, type Model, type Types } from "mongoose";
import { EventModel } from "./event.model";

export interface Booking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

type BookingDocument = HydratedDocument<Booking>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<Booking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true, // faster queries like: find({ eventId })
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => EMAIL_RE.test(v),
        message: "Invalid email.",
      },
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

BookingSchema.pre("save", async function (this: BookingDocument) {
  // Enforce referential integrity at the application layer.
  const exists = await EventModel.exists({ _id: this.eventId });
  if (!exists) throw new Error("Referenced Event does not exist.");

  // Extra runtime guard (in addition to schema validator) so failures are explicit.
  if (!EMAIL_RE.test(this.email)) throw new Error("Invalid email.");
});

  // In development, delete the cached model to pick up schema changes
if (process.env.NODE_ENV === "development" && models.Booking) {
  delete models.Booking;
}

export const BookingModel: Model<Booking> = model<Booking>("Booking", BookingSchema);
