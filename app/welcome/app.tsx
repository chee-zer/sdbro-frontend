import { useState, useRef, useEffect } from "react"
import { Mic, Send, Menu, X, History, Plus, MicOff } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Textarea } from "~/components/ui/textarea"
import { Card, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import type { ChatMessage, ConversationHistory} from "~/types/types"
import { AudioVisualizer } from "./components/audioVisualizerRecorder";
import { MessageBubble } from "./components/messageBubble";
import { NewChatModal } from "./components/newChat";
import { formatTime } from "./utils/time";

export default function SystemDesignInterviewApp() {
  // State management
  // --- MODIFICATION: Chat messages start as an empty array ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentBlogTitle, setCurrentBlogTitle] = useState("New conversation")
  const [isAudioMode, setIsAudioMode] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [messageInput, setMessageInput] = useState("")
  const [transcriptionText, setTranscriptionText] = useState("")
  const [currentSessionId, setCurrentSessionId] = useState<string>("")

  // Audio recording states
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null)


  const [interviewDuration, setInterviewDuration] = useState<number>(0)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
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
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { sampleRate: 48000 }
        });
        setAudioStream(stream);

        const mimeType = 'audio/webm;codecs=opus';
        const supportedMimeType = MediaRecorder.isTypeSupported(mimeType) ? mimeType : 'audio/webm';
        
        const recorder = new MediaRecorder(stream, { mimeType: supportedMimeType });
        
        const chunks: Blob[] = []; 
        setAudioChunks(chunks);

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        recorder.onstop = () => {
            const audioBlob = new Blob(chunks, { type: supportedMimeType });
            handleAudioRecorded(audioBlob);
        };

        recorder.start(1000); 

        setMediaRecorder(recorder);
        setIsRecording(true);
        setTranscriptionText("");
    } catch (error) {
        console.error('Error starting recording:', error);
        alert('Could not start recording. Please ensure microphone permissions are granted.');
    }
};

  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
      
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop())
        setAudioStream(null)
      }
      
      setMediaRecorder(null)
    }
    
    setIsRecording(false)
  }

  // Handle recorded audio
  const handleAudioRecorded = async (audioBlob: Blob) => {
    setTranscriptionText("Transcribing...");
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('https://sd-bro-890380430815.asia-south1.run.app/stt', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to transcribe audio');
      }

      const transcript = result.text || "";
      
      setTranscriptionText(transcript); 
      
      if (transcript) {
        handleSendMessage(transcript);
      } else {
        setTranscriptionText("Could not detect any speech. Please try again.");
      }

    } catch (error) {
      console.error('Error processing audio:', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setTranscriptionText(`Error: ${errorMessage}`);
    }
  };


  // Cleanup effect for audio streams
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop())
      }
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop()
      }
      if (activeAudio) {
        activeAudio.pause();
        setActiveAudio(null);
      }
    }
  }, [audioStream, mediaRecorder, activeAudio])

  const handleSendMessage = async (messageToSend?: string) => {
    const messageText = messageToSend ?? messageInput;

    if (messageText.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: "user",
        text: messageText,
        isTranscription: !!messageToSend,
        audioAvailable: !!messageToSend,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, newMessage]);
      setMessageInput("");
      
      try {
        const response = await fetch(`https://sd-bro-890380430815.asia-south1.run.app/chat/${currentSessionId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
          },
          body: JSON.stringify({
            userMessage: messageText,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const { message } = data;

        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "SD Mate",
          text: message,
          isTranscription: false,
          audioAvailable: true,
          timestamp: new Date(),
        };

        setChatMessages((prev) => [...prev, aiResponse]);

        if (isAudioMode && message) {
          handlePlayAudio(message);
        }

      } catch (error) {
        console.error("Error sending message:", error);
        const errorResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "SD Mate",
          text: "Failed to get a response from the server. Please try again later.",
          isTranscription: false,
          audioAvailable: false,
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, errorResponse]);
      }
    }
  };

  // Handle loading new blog
  const handleLoadBlog = async (title: string, url: string, duration: number) => {
    setCurrentBlogTitle(title)
    setInterviewDuration(duration)
    setTimeRemaining(duration)
    setIsInterviewActive(true)
    setIsInterviewEnded(false)

    try {
      const response = await fetch('https://sd-bro-890380430815.asia-south1.run.app/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
        body: JSON.stringify({
          articleLink: url,
          timeLimit: duration,
        }),
      })

      const data = await response.json()
      const { sessionId, message } = data
      setCurrentSessionId(sessionId)

      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: "SD Mate",
        text: message,
        isTranscription: false,
        audioAvailable: true,
        timestamp: new Date(),
      };

      setChatMessages([aiMessage]);

      if (isAudioMode && message) {
        handlePlayAudio(message);
      }

    } catch (error) {
      console.error("Error loading blog:", error)
      setChatMessages([
        {
          id: Date.now().toString(),
          sender: "SD Mate",
          text: `Failed to load the blog. Please try again later.`,
          isTranscription: false,
          audioAvailable: false,
          timestamp: new Date(),
        },
      ])
    }
  }

  const handlePlayAudio = async (text: string) => {
      if (activeAudio) {
          activeAudio.pause();
      }

      if (!text) return;

      try {
          const response = await fetch('https://sd-bro-890380430815.asia-south1.run.app/tts', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ text }),
          });

          if (!response.ok) {
              const errorResult = await response.json();
              throw new Error(errorResult.error || 'Failed to fetch audio');
          }

          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          setActiveAudio(audio);
          audio.play();

          audio.onended = () => {
              URL.revokeObjectURL(audioUrl);
              setActiveAudio(null);
          };
      } catch (error) {
          console.error('Error fetching TTS audio:', error);
          alert('Failed to play audio.');
      }
  };


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
              <h2 className="text-[#d3c6aa] font-semibold">SD Mate</h2>
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
                New Discussion
              </Button>
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
                  {isInterviewActive && <p className="text-sm text-[#859289]">System Design Discussion Session</p>}
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
              {/* --- MODIFICATION: Welcome prompt --- */}
              {!isInterviewActive && chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Card className="max-w-md bg-[#343f44] border-[#414b50]">
                      <CardContent className="p-6">
                          <div className="w-16 h-16 bg-[#2d353b] rounded-full flex items-center justify-center mx-auto mb-4">
                              <Plus className="h-8 w-8 text-[#a7c080]" />
                          </div>
                          <h3 className="text-lg font-semibold text-[#d3c6aa] mb-2">Welcome to SD Mate!</h3>
                          <p className="text-[#859289] mb-4">
                              Click the "New Discussion" button to begin your system design interview session.
                          </p>
                          <Button
                              onClick={() => setIsNewChatModalOpen(true)}
                              className="bg-[#a7c080] hover:bg-[#83c092] text-[#2d353b]"
                          >
                              <Plus className="h-4 w-4 mr-2" />
                              Start New Discussion
                          </Button>
                      </CardContent>
                  </Card>
                </div>
              )}

              {chatMessages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isAudioMode={isAudioMode}
                  onPlayAudio={() => handlePlayAudio(message.text)}
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
                      <h3 className="text-lg font-semibold text-[#2d353b] mb-2">Discussion Time Ended</h3>
                      <p className="text-[#2d353b] mb-4">
                        The {formatTime(interviewDuration)} discussion session has concluded. Thank you for participating!
                      </p>
                      <Button
                        onClick={() => setIsNewChatModalOpen(true)}
                        className="bg-[#2d353b] hover:bg-[#343f44] text-[#d3c6aa]"
                      >
                        Start New Discussion
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* --- MODIFICATION: Chat Input Area is now conditional on the interview being active --- */}
            {isInterviewActive && !isInterviewEnded && (
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
                        <Textarea
                          value={
                            transcriptionText ||
                            (isRecording ? "Recording in progress..." : "Press and hold SPACEBAR to record")
                          }
                          readOnly
                          className="min-h-[60px] resize-none bg-[#2d353b] border-[#414b50] text-[#d3c6aa] cursor-not-allowed opacity-75"
                        />
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
                      onClick={() => handleSendMessage()}
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