export interface ChatMessage {
  id: string
  sender: "user" | "SD Mate"
  text: string
  isTranscription: boolean
  audioAvailable: boolean
  timestamp: Date
}

export interface ConversationHistory {
  id: string
  title: string
  url: string
  lastMessage: string
  timestamp: Date
}

export interface PreselectedArticle {
  id: string
  title: string
  url: string
  description: string
}
