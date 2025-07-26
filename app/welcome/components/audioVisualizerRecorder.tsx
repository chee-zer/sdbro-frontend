import { Volume2 } from "lucide-react"

export const AudioVisualizer: React.FC<{
  isActive: boolean
  recordingDuration?: number
}> = ({ isActive, recordingDuration }) => {
  return (
    <div className="flex items-center justify-center h-16 bg-[#2d353b] rounded-lg mt-2 border border-[#414b50]">
      <div className="flex items-center space-x-4">
        <div className="flex space-x-1">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`w-1 bg-[#a7c080] rounded-full transition-all duration-300 ${isActive ? "animate-pulse" : ""}`}
              style={{
                animationDelay: `${i * 0.1}s`,
                height: isActive ? `${Math.random() * 30 + 15}px` : "8px",
              }}
            />
          ))}
        </div>
        {isActive && (
          <div className="flex items-center space-x-2 text-[#a7c080]">
            <Volume2 className="h-4 w-4 animate-pulse" />
            {recordingDuration !== undefined && (
              <span className="font-mono text-sm">
                {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, "0")}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
