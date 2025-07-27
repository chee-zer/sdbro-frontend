import { useState, useRef, useEffect } from "react"
import { Mic, Send, Menu, X, History, Plus, MicOff } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Textarea } from "~/components/ui/textarea"
import { Card, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import type { ChatMessage, ConversationHistory} from "~/types/types"
import { conversationHistory, initialMessages} from "./placeholder"
import { AudioVisualizer } from "./components/audioVisualizerRecorder";
import { MessageBubble } from "./components/messageBubble";
import { NewChatModal } from "./components/newChat";
import { formatTime } from "./utils/time";

export default function SystemDesignInterviewApp() {
  // State management
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages)  // TODO :: will be empty initially and then set
  const [currentBlogTitle, setCurrentBlogTitle] = useState("New conversation") // todo :: fetch and set
  const [isAudioMode, setIsAudioMode] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [messageInput, setMessageInput] = useState("")
  const [transcriptionText, setTranscriptionText] = useState("")

  // Audio recording states
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])

  const [interviewDuration, setInterviewDuration] = useState<number>(0) // in seconds todo :: fetch form server
  const [timeRemaining, setTimeRemaining] = useState<number>(0) // in seconds  todo :: in reality time should be returned continuosly form server never form frontend
  const [isInterviewActive, setIsInterviewActive] = useState(false)
  const [isInterviewEnded, setIsInterviewEnded] = useState(false)

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isInterviewActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsInterviewActive(false)
            setIsInterviewEnded(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isInterviewActive, timeRemaining])

  // Recording duration effect
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      setRecordingDuration(0)
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [isRecording])

  // Keyboard event listener for spacebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && isAudioMode && !isInterviewEnded) {
        event.preventDefault()
        if (!isRecording) {
          startRecording()
        }
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space" && isAudioMode && isRecording) {
        event.preventDefault()
        stopRecording()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [isAudioMode, isRecording, isInterviewEnded])

  // Start recording function
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setAudioStream(stream)
      
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      })
      
      const chunks: Blob[] = []
      setAudioChunks(chunks)
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: recorder.mimeType })
        handleAudioRecorded(audioBlob)
      }
      
      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      setTranscriptionText("")
    } catch (error) {
      console.error('Error starting recording:', error)
      // Fallback to simulated recording if permission denied
      setIsRecording(true)
      setTranscriptionText("")
    }
  }

  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
      
      // Stop all audio tracks
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop())
        setAudioStream(null)
      }
      
      setMediaRecorder(null)
    } else {
      // Fallback for simulated recording
      setTimeout(() => {
        const simulatedTranscription =
          "This is a simulated transcription of your speech. In a real implementation, this would be the actual speech-to-text result."
        setTranscriptionText(simulatedTranscription)
        setMessageInput(simulatedTranscription)
      }, 500)
    }
    
    setIsRecording(false)
  }

  // Handle recorded audio
  const handleAudioRecorded = async (audioBlob: Blob) => {
    try {
      // TODO: Send audioBlob to your speech-to-text API
      // const formData = new FormData()
      // formData.append('audio', audioBlob, 'recording.webm')
      // const response = await fetch('/api/transcribe', {
      //   method: 'POST',
      //   body: formData
      // })
      // const { transcription } = await response.json()
      
      // For now, simulate transcription
      setTimeout(() => {
        const simulatedTranscription = "This is your recorded speech transcribed using MediaRecorder API."
        setTranscriptionText(simulatedTranscription)
        setMessageInput(simulatedTranscription)
      }, 500)
    } catch (error) {
      console.error('Error processing audio:', error)
      setTranscriptionText("Error processing audio recording")
      setMessageInput("")
    }
  }

  // Cleanup effect for audio streams
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop())
      }
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop()
      }
    }
  }, [])

  // Handle sending messages
  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: "user",
        text: messageInput,
        isTranscription: isAudioMode,
        audioAvailable: isAudioMode,
        timestamp: new Date(),
      }
// todo :: since these message get quite large not a good idea to store in memory 
      setChatMessages((prev) => [...prev, newMessage])
      setMessageInput("")
      setTranscriptionText("")

      // todo :: send message to api and then stream response
      // Simulate AI response after a delay
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "That's a great point! Let me ask you a follow-up question to dive deeper into your solution...",
          isTranscription: false,
          audioAvailable: true,
          timestamp: new Date(),
        }
        setChatMessages((prev) => [...prev, aiResponse])
      }, 1500)
    }
  }

  // Handle loading new blog
  // todo :: (1) first thing called after the blog is loaded 
  const handleLoadBlog = (title: string, url: string, duration: number) => {
    setCurrentBlogTitle(title)
    setInterviewDuration(duration)
    setTimeRemaining(duration)
    setIsInterviewActive(true)
    setIsInterviewEnded(false)
    setChatMessages([
      {
        id: Date.now().toString(),
        sender: "ai",
        text: `Hello! I'm your system design interviewer. I've loaded the blog "${title}". You have ${formatTime(duration)} for this interview. Let's begin! Please tell me what you understand about the problem we're trying to solve.`,
        isTranscription: false,
        audioAvailable: true,
        timestamp: new Date(),
      },
    ])
  }

  // Handle conversation history click
  const handleHistoryClick = (conversation: ConversationHistory) => {
    setCurrentBlogTitle(conversation.title)
    setSidebarOpen(false)
    // In a real app, you'd load the actual conversation history here
  }


  // todo :: Handle play audio for AI messages
  const handlePlayAudio = () => {
    // Simulate audio playback
    console.log("Playing AI audio response...")
  }

  // main app is returned
  return (
    <div className="min-h-screen bg-[#2d353b]">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex h-[calc(100vh-2rem)] bg-[#343f44] rounded-lg shadow-2xl overflow-hidden border border-[#414b50]">
          {/* Sidebar */}
          <div
            className={`${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } fixed inset-y-0 left-0 z-50 w-64 bg-[#232a2e] transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-[#414b50]`}
          >
            <div className="flex items-center justify-between h-16 px-4 bg-[#1e2326] border-b border-[#414b50]">
              <h2 className="text-[#d3c6aa] font-semibold">System Design Interview</h2>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-[#d3c6aa] hover:bg-[#414b50]"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4">
              {/* New Chat Button */}
              <Button
                onClick={() => setIsNewChatModalOpen(true)}
                className="w-full mb-6 bg-[#a7c080] hover:bg-[#83c092] text-[#2d353b]"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Interview
              </Button>

              {/* Conversation History */}
              <div>
                <h3 className="text-[#859289] text-sm font-medium mb-3 flex items-center">
                  <History className="h-4 w-4 mr-2" />
                  Recent Interviews
                </h3>
                <div className="space-y-2">
                  {conversationHistory.map((conversation) => (
                    <Card
                      key={conversation.id}
                      className="cursor-pointer hover:bg-[#414b50] transition-colors bg-[#343f44] border-[#414b50]"
                      onClick={() => handleHistoryClick(conversation)}
                    >
                      <CardContent className="p-3">
                        <h4 className="font-medium text-sm text-[#d3c6aa] mb-1 line-clamp-2">{conversation.title}</h4>
                        <p className="text-xs text-[#859289] mb-2 line-clamp-1">{conversation.lastMessage}</p>
                        <p className="text-xs text-[#7fbbb3]">{conversation.timestamp.toLocaleDateString()}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-[#343f44] border-b border-[#414b50] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden mr-2 hover:bg-[#414b50]"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4 text-[#d3c6aa]" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-[#d3c6aa]">{currentBlogTitle}</h1>
                  <p className="text-sm text-[#859289]">System Design Interview Session</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Timer Display */}
                {isInterviewActive && (
                  <div
                    className={`flex items-center space-x-2 px-3 py-1 rounded-lg border ${
                      timeRemaining <= 60
                        ? "bg-[#e67e80] text-[#2d353b] border-[#e67e80]"
                        : timeRemaining <= 180
                          ? "bg-[#dbbc7f] text-[#2d353b] border-[#dbbc7f]"
                          : "bg-[#a7c080] text-[#2d353b] border-[#a7c080]"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        timeRemaining <= 60
                          ? "bg-[#2d353b] animate-pulse"
                          : timeRemaining <= 180
                            ? "bg-[#2d353b]"
                            : "bg-[#2d353b]"
                      }`}
                    />
                    <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
                  </div>
                )}

                {/* Audio Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-[#859289]">Audio Mode</span>
                  <Button
                    variant={isAudioMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsAudioMode(!isAudioMode)}
                    className={
                      isAudioMode
                        ? "bg-[#a7c080] hover:bg-[#83c092] text-[#2d353b]"
                        : "border-[#414b50] text-[#d3c6aa] hover:bg-[#414b50]"
                    }
                  >
                    {isAudioMode ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#2d353b]">
              {chatMessages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isAudioMode={isAudioMode}
                  onPlayAudio={handlePlayAudio}
                />
              ))}

              {/* Interview End Message */}
              {isInterviewEnded && (
                <div className="flex justify-center">
                  <Card className="max-w-md bg-[#e67e80] border-[#e67e80]">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-[#2d353b] rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="h-8 w-8 text-[#e67e80]" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#2d353b] mb-2">Interview Time Ended</h3>
                      <p className="text-[#2d353b] mb-4">
                        The {formatTime(interviewDuration)} interview session has concluded. Thank you for participating
                        in this system design interview!
                      </p>
                      <Button
                        onClick={() => setIsNewChatModalOpen(true)}
                        className="bg-[#2d353b] hover:bg-[#343f44] text-[#d3c6aa]"
                      >
                        Start New Interview
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Area */}
            {!isInterviewEnded && (
              <div className="border-t border-[#414b50] p-4 bg-[#343f44]">
                {/* Recording Instructions */}
                {isAudioMode && isRecording && (
                  <div className="mb-2 text-center">
                    <Badge className="bg-[#e67e80] text-[#2d353b] animate-pulse">
                      Recording... Release SPACEBAR to stop
                    </Badge>
                  </div>
                )}

                <div className="flex space-x-2">
                  <div className="flex-1">
                    {isAudioMode ? (
                      <div className="space-y-2">
                        {/* Non-interactive text area in audio mode */}
                        <Textarea
                          value={
                            transcriptionText ||
                            (isRecording ? "Recording in progress..." : "Press and hold SPACEBAR to record")
                          }
                          readOnly
                          className="min-h-[60px] resize-none bg-[#2d353b] border-[#414b50] text-[#d3c6aa] cursor-not-allowed opacity-75"
                        />
                        {/* Recording visualizer */}
                        {isRecording && <AudioVisualizer isActive={true} recordingDuration={recordingDuration} />}
                      </div>
                    ) : (
                      <Textarea
                        ref={textareaRef}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type your response here..."
                        className="min-h-[60px] resize-none bg-[#2d353b] border-[#414b50] text-[#d3c6aa] placeholder:text-[#859289]"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || isRecording}
                      size="sm"
                      className="bg-[#a7c080] hover:bg-[#83c092] text-[#2d353b] disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onLoadBlog={handleLoadBlog}
      />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
