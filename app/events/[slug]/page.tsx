import { notFound } from "next/navigation";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import {
  getSimilarEventsBySlug,
  getEventBySlug,
} from "@/lib/actions/event.actions";
import type { Event } from "@/database";
import EventCard from "@/components/EventCard";

const EventDetailItem = ({
  icon,
  alt,
  label,
}: {
  icon: string;
  alt: string;
  label: string;
}) => (
  <div className=" flex-row-gap-2  items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

const EventAgende = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag) => (
      <div className="pill" key={tag}>
        {tag}
      </div>
    ))}
  </div>
);

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  try {
    const event = await getEventBySlug(slug);

    if (!event) {
      return notFound();
    }

    const bookings = 10;

    const similarEvent: Event[] = await getSimilarEventsBySlug(slug);

    console.log({ similarEvent });

    const {
      description,
      image,
      overview,
      date,
      time,
      location,
      mode,
      agenda,
      audience,
      tags,
      organizer,
    } = event;

    if (!description) return notFound();

    return (
      <section id="event">
        <div className="header">
          <h1>Event Description</h1>
          <p>{description}</p>
        </div>

        <div className="details">
          {/*   Left side  -  Event Content */}
          <div className="content">
            <Image
              src={image}
              alt="Event Banner"
              width={800}
              height={800}
              className="banner"
            ></Image>

            <section className="flex-col-gap-2">
              <h2>Overview</h2>
              <p>{overview}</p>
            </section>
            <section className="flex-col-gap-2">
              <h2>Event Details</h2>
              <EventDetailItem
                icon="/icons/calendar.svg"
                alt="calendar"
                label={date}
              ></EventDetailItem>
              <EventDetailItem
                icon="/icons/clock.svg"
                alt="clock"
                label={time}
              ></EventDetailItem>
              <EventDetailItem
                icon="/icons/pin.svg"
                alt="pin"
                label={location}
              ></EventDetailItem>
              <EventDetailItem
                icon="/icons/mode.svg"
                alt="mode"
                label={mode}
              ></EventDetailItem>
              <EventDetailItem
                icon="/icons/audience.svg"
                alt="audience"
                label={audience}
              ></EventDetailItem>
            </section>

            <EventAgende agendaItems={agenda} />
            <section className="flex-col-gap-2">
              <h2>About the Organizer</h2>
              <p>{organizer}</p>
            </section>

            <EventTags tags={tags} />
          </div>
          {/*   Right side  -  Booking Form */}
          <aside className="booking">
            <div className="signup-card">
              <h2>Book Your Spot</h2>
              {bookings > 0 ? (
                <p className="text-sm">
                  Join {bookings} people how already booked their spot!
                </p>
              ) : (
                <p className="text-sm">Be the first to book your spot!</p>
              )}
              <BookEvent />
            </div>
          </aside>
        </div>

        <div className="flex w-full flex-col gap-4 pt-20">
          <h2>Similar Events</h2>
          <div className="events">
            {similarEvent.length > 0 &&
              similarEvent.map((similarEvent: Event) => (
                <EventCard key={similarEvent.title} {...similarEvent} />
              ))}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error("Error fetching event:", error);
    return notFound();
  }
};

export default EventDetailsPage;
