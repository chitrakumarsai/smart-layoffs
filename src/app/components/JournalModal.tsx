"use client";

import { useState } from 'react';

interface JournalEntry {
  date: string;
  mood: number;
  content: string;
}

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: JournalEntry) => void;
}

export default function JournalModal({ isOpen, onClose, onSubmit }: JournalModalProps) {
  const [mood, setMood] = useState(5);
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    onSubmit({
      date: today,
      mood,
      content
    });
    setMood(5);
    setContent('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="glass-effect rounded-2xl w-full max-w-lg animate-slideIn">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            New Journal Entry
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How are you feeling today? ({mood}/10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={mood}
              onChange={(e) => setMood(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Not Great</span>
              <span>Amazing</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's on your mind?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts here..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}