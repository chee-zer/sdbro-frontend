import type { ChatMessage, ConversationHistory, PreselectedArticle } from "~/types/types"

export const initialMessages: ChatMessage[] = [
  {
    id: "1",
    sender: "SD Mate",
    text: "Hello! I'm your system design interviewer for your practice. Please select a blog to get started",
    isTranscription: false,
    audioAvailable: false,
    timestamp: new Date(Date.now()),
  },
  // {
  //   id: "2",
  //   sender: "user",
  //   text: "A notification system for millions of users needs to be highly scalable, reliable, and support multiple delivery channels like push notifications, SMS, and email. It should handle different types of notifications with varying priorities.",
  //   isTranscription: true,
  //   audioAvailable: false,
  //   timestamp: new Date(Date.now() - 240000),
  // },
  // {
  //   id: "3",
  //   sender: "ai",
  //   text: "Excellent start! Now let's dive deeper into the architecture. How would you design the high-level components of this system? Think about the data flow from when a notification is triggered to when it reaches the user.",
  //   isTranscription: false,
  //   audioAvailable: true,
  //   timestamp: new Date(Date.now() - 180000),
  // },
]
export const preselectedArticles: PreselectedArticle[] = [
  {
    id: "1",
    title: "Design a Chat Application Like WhatsApp",
    url: "https://blog.algomaster.io/p/design-a-chat-application-like-whatsapp",
    description: "Learn how to design a scalable real-time chat application similar to WhatsApp.",
  },
  {
    id: "2",
    title: "Design Spotify: System Design Interview",
    url: "https://blog.algomaster.io/p/design-spotify-system-design-interview",
    description: "Explore the system design principles behind a music streaming service like Spotify.",
  },
  {
    id: "3",
    title: "Design a URL Shortener",
    url: "https://blog.algomaster.io/p/design-a-url-shortener",
    description: "Understand how to build a highly available and scalable URL shortening service.",
  },
  {
    id: "4",
    title: "Design a Scalable Notification Service",
    url: "https://blog.algomaster.io/p/design-a-scalable-notification-service",
    description: "Learn to design a robust and scalable notification system for millions of users.",
  },
  {
    id: "5",
    title: "Design a Distributed Job Scheduler",
    url: "https://blog.algomaster.io/p/design-a-distributed-job-scheduler",
    description: "Discover the architecture and challenges of designing a distributed job scheduler.",
  },
  {
    id: "6",
    title: "Design Instagram: A System Design Interview Question",
    url: "https://www.geeksforgeeks.org/system-design/design-instagram-a-system-design-interview-question/",
    description: "Delve into the system design of a popular photo and video sharing application like Instagram.",
  },
]
