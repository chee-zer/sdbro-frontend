import { BookOpen, ExternalLink, X } from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import type { PreselectedArticle } from "~/types/types"
import { preselectedArticles } from "../placeholder"

const timerOptions = [
  { value: 300, label: "5 minutes" },
  { value: 600, label: "10 minutes" },
  { value: 900, label: "15 minutes" },
]


export const NewChatModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onLoadBlog: (title: string, url: string, duration: number) => void
}> = ({ isOpen, onClose, onLoadBlog }) => {
  const [customUrl, setCustomUrl] = useState("")
  const [selectedDuration, setSelectedDuration] = useState<number>(600) // Default 10 minutes

  if (!isOpen) return null

  const handleLoadCustom = () => {
    if (customUrl.trim()) {
      onLoadBlog("Custom Blog", customUrl, selectedDuration)
      setCustomUrl("")
      onClose()
    }
  }

  const handleLoadPreselected = (article: PreselectedArticle) => {
    onLoadBlog(article.title, article.url, selectedDuration)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#343f44] border-[#414b50]">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#d3c6aa]">Start New Interview</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-[#414b50]">
              <X className="h-4 w-4 text-[#d3c6aa]" />
            </Button>
          </div>

          {/* Timer Selection */}
          <div className="mb-6 p-4 bg-[#2d353b] rounded-lg border border-[#414b50]">
            <h3 className="text-lg font-semibold mb-3 text-[#a7c080] flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Interview Duration
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {timerOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedDuration === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDuration(option.value)}
                  className={
                    selectedDuration === option.value
                      ? "bg-[#a7c080] hover:bg-[#83c092] text-[#2d353b] border-[#a7c080]"
                      : "border-[#414b50] text-[#d3c6aa] hover:bg-[#414b50]"
                  }
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <p className="text-sm text-[#7fbbb3] mt-2">
              Selected:{" "}
              <span className="font-semibold text-[#a7c080]">
                {timerOptions.find((opt) => opt.value === selectedDuration)?.label}
              </span>
            </p>
          </div>

          {/* Custom URL Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 text-[#d3c6aa]">Load Custom Blog</h3>
            <div className="flex space-x-2">
              <Input
                placeholder="Paste your system design blog URL here..."
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="flex-1 bg-[#2d353b] border-[#414b50] text-[#d3c6aa] placeholder:text-[#859289]"
              />
              <Button
                onClick={handleLoadCustom}
                disabled={!customUrl.trim()}
                className="bg-[#a7c080] hover:bg-[#83c092] text-[#2d353b]"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Load Blog
              </Button>
            </div>
          </div>

          {/* Preselected Articles */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#d3c6aa]">Choose from Curated Articles</h3>
            <div className="grid gap-3">
              {preselectedArticles.map((article) => (
                <Card
                  key={article.id}
                  className="cursor-pointer hover:bg-[#414b50] transition-colors border-l-4 border-l-[#a7c080] bg-[#2d353b] border-[#414b50]"
                  onClick={() => handleLoadPreselected(article)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#d3c6aa] mb-1">{article.title}</h4>
                        <p className="text-sm text-[#859289] mb-2">{article.description}</p>
                        <p className="text-xs text-[#7fbbb3]">{article.url}</p>
                      </div>
                      <BookOpen className="h-5 w-5 text-[#859289] ml-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
