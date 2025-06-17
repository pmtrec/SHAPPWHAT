"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { motion } from "framer-motion"

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  onClose: () => void
}

export function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState("smileys")

  const emojiCategories = {
    smileys: {
      name: "Smileys",
      emojis: [
        "😀",
        "😃",
        "😄",
        "😁",
        "😆",
        "😅",
        "😂",
        "🤣",
        "😊",
        "😇",
        "🙂",
        "🙃",
        "😉",
        "😌",
        "😍",
        "🥰",
        "😘",
        "😗",
        "😙",
        "😚",
        "😋",
        "😛",
        "😝",
        "😜",
        "🤪",
        "🤨",
        "🧐",
        "🤓",
        "😎",
        "🤩",
        "🥳",
      ],
    },
    gestures: {
      name: "Gestes",
      emojis: [
        "👍",
        "👎",
        "👌",
        "✌️",
        "🤞",
        "🤟",
        "🤘",
        "🤙",
        "👈",
        "👉",
        "👆",
        "🖕",
        "👇",
        "☝️",
        "👋",
        "🤚",
        "🖐️",
        "✋",
        "🖖",
        "👏",
        "🙌",
        "🤲",
        "🤝",
        "🙏",
      ],
    },
    hearts: {
      name: "Cœurs",
      emojis: [
        "❤️",
        "🧡",
        "💛",
        "💚",
        "💙",
        "💜",
        "🖤",
        "🤍",
        "🤎",
        "💔",
        "❣️",
        "💕",
        "💞",
        "💓",
        "💗",
        "💖",
        "💘",
        "💝",
      ],
    },
    objects: {
      name: "Objets",
      emojis: [
        "📱",
        "💻",
        "⌨️",
        "🖥️",
        "🖨️",
        "📞",
        "☎️",
        "📟",
        "📠",
        "📺",
        "📻",
        "🎵",
        "🎶",
        "🎤",
        "🎧",
        "📢",
        "📣",
        "📯",
        "🔔",
        "🔕",
      ],
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-[#202c33] rounded-lg shadow-xl border border-gray-700 w-80 h-64"
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h3 className="text-white font-medium">Émojis</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex">
        {/* Categories */}
        <div className="w-16 bg-[#2a3942] border-r border-gray-700">
          {Object.entries(emojiCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`w-full p-2 text-xs hover:bg-[#374151] ${
                activeCategory === key ? "bg-[#374151] text-[#00a884]" : "text-gray-400"
              }`}
            >
              {category.emojis[0]}
            </button>
          ))}
        </div>

        {/* Emojis */}
        <div className="flex-1 p-2 overflow-y-auto">
          <div className="grid grid-cols-8 gap-1">
            {emojiCategories[activeCategory as keyof typeof emojiCategories].emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => onEmojiSelect(emoji)}
                className="w-8 h-8 text-lg hover:bg-[#2a3942] rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
