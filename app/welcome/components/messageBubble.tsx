import { Speaker } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import type { ChatMessage } from "~/types/types"
import { AudioVisualizer } from "./audioVisualizerRecorder"

export const MessageBubble: React.FC<{
  message: ChatMessage
  isAudioMode: boolean
  onPlayAudio?: () => void
}> = ({ message, isAudioMode, onPlayAudio }) => {
  const isUser = message.sender === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <Card
        className={`max-w-[80%] ${
          isUser ? "bg-[#a7c080] text-[#2d353b] border-[#a7c080]" : "bg-[#343f44] border-[#414b50] text-[#d3c6aa]"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-2 mb-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                isUser ? "bg-[#83c092] text-[#2d353b]" : "bg-[#414b50] text-[#d3c6aa]"
              }`}
            >
              {isUser ? "U" : "AI"}
            </div>
            <div className="flex-1">
              <div className="text-xs opacity-70 mb-1">{message.timestamp.toLocaleTimeString()}</div>
              {message.isTranscription && (
                <Badge variant="secondary" className="mb-2 text-xs bg-[#e67e80] text-[#2d353b]">
                  Transcription
                </Badge>
              )}
            </div>
            {/* Speaker icon for AI messages when not in audio mode */}
            {!isUser && message.audioAvailable && !isAudioMode && (
              <Button variant="ghost" size="sm" onClick={onPlayAudio} className="h-6 w-6 p-0 hover:bg-[#414b50]">
                <Speaker className="h-3 w-3 text-[#7fbbb3]" />
              </Button>
            )}
          </div>

          <div
            className={`rounded-lg p-3 ${
              isUser ? "bg-[#83c092] text-[#2d353b]" : "bg-[#2d353b] text-[#d3c6aa]"
            } max-h-40 overflow-y-auto`}
          >
            <p className="text-sm leading-relaxed">{message.text}</p>
          </div>

          {message.audioAvailable && <AudioVisualizer isActive={false} />}
        </CardContent>
      </Card>
    </div>
  )
}
