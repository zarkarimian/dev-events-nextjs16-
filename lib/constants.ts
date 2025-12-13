export type EventItem = {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string
};


export const events: EventItem[ ] = [
  {
    title: "React Conf 2024",
    image: "/images/event1.png",
    slug: "react-conf-2024",
    location: "San Francisco, CA",
    date: "December 10-11, 2024",
    time: "9:00 AM - 6:00 PM",
  },
  {
    title: "Next.js Conf 2024",
    image: "/images/event2.png",
    slug: "nextjs-conf-2024",
    location: "San Francisco, CA",
    date: "November 12-13, 2024",
    time: "10:00 AM - 5:00 PM",
  },
  {
    title: "JSConf EU 2024",
    image: "/images/event3.png",
    slug: "jsconf-eu-2024",
    location: "Berlin, Germany",
    date: "September 15-17, 2024",
    time: "9:30 AM - 7:00 PM",
  },
  {
    title: "Global Hackathon 2024",
    image: "/images/event4.png",
    slug: "global-hackathon-2024",
    location: "New York, NY",
    date: "October 20-22, 2024",
    time: "24/7",
  },
  {
    title: "TypeScript Meetup",
    image: "/images/event5.png",
    slug: "typescript-meetup-2024",
    location: "Seattle, WA",
    date: "November 5, 2024",
    time: "6:00 PM - 9:00 PM",
  },
  {
    title: "Web3 Developer Summit",
    image: "/images/event6.png",
    slug: "web3-developer-summit-2024",
    location: "Austin, TX",
    date: "December 5-7, 2024",
    time: "10:00 AM - 6:00 PM",
  },
];
