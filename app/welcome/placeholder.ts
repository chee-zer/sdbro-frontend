import type { ChatMessage, ConversationHistory, PreselectedArticle } from "~/types/types"

export const initialMessages: ChatMessage[] = [
  {
    id: "1",
    sender: "ai",
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

export const conversationHistory: ConversationHistory[] = [
  {
    id: "1",
    title: "Designing a Scalable Notification System",
    url: "https://example.com/notification-system",
    lastMessage: "How would you design the high-level components...",
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: "2",
    title: "System Design Interview: Designing Twitter",
    url: "https://example.com/twitter-design",
    lastMessage: "Let's discuss the database schema for tweets...",
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    id: "3",
    title: "Designing Netflix Video Streaming",
    url: "https://example.com/netflix-design",
    lastMessage: "How would you handle video encoding and CDN...",
    timestamp: new Date(Date.now() - 86400000),
  },
]

export const preselectedArticles: PreselectedArticle[] = [
  {
    id: "1",
    title: "Designing a Chat System",
    url: "https://example.com/chat-system",
    description: "Learn how to design a scalable real-time chat application",
  },
  {
    id: "2",
    title: "Designing a URL Shortener",
    url: "https://example.com/url-shortener",
    description: "Build a system like bit.ly with high availability",
  },
  {
    id: "3",
    title: "Designing a Social Media Feed",
    url: "https://example.com/social-feed",
    description: "Create a timeline system for millions of users",
  },
  {
    id: "4",
    title: "Designing a Video Streaming Service",
    url: "https://example.com/video-streaming",
    description: "Build a Netflix-like video streaming platform",
  },
]