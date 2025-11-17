'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Send, Loader2 } from 'lucide-react';
import type { ChatMessage, ChatRequest, ChatResponse } from '@/types';
import Link from 'next/link';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<ChatResponse['sources']>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setSources([]);

    try {
      const request: ChatRequest = {
        message: input,
        history: messages,
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to get response');
      }

      const data: ChatResponse = await response.json();
      const assistantMessage: ChatMessage = { role: 'assistant', content: data.answer };
      setMessages((prev) => [...prev, assistantMessage]);
      setSources(data.sources || []);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI Chat</h1>
        <p className="text-gray-600 mt-1">Ask questions about customer reviews</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <p className="mb-4">Start a conversation by asking a question about the reviews.</p>
                  <div className="text-sm space-y-2">
                    <p className="font-medium">Example questions:</p>
                    <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                      <li>What are the main complaints in recent reviews?</li>
                      <li>Which states have the highest churn risk?</li>
                      <li>What's the average sentiment for billing issues?</li>
                      <li>Show me trends in network performance complaints</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </CardContent>
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question about the reviews..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  Send
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sources Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Sources</CardTitle>
            </CardHeader>
            <CardContent>
              {sources.length === 0 ? (
                <p className="text-sm text-gray-500">No sources yet. Ask a question to see relevant reviews.</p>
              ) : (
                <div className="space-y-3">
                  {sources.map((source) => (
                    <div key={source.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <Link
                          href={`/reviews/${source.id}`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          Review #{source.id}
                        </Link>
                        <Badge variant="default">{source.rating}/5</Badge>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Date: {source.review_date}</p>
                        {source.overall_sentiment && (
                          <p>Sentiment: {source.overall_sentiment}</p>
                        )}
                        {source.churn_risk && (
                          <p>Churn Risk: {source.churn_risk}</p>
                        )}
                        {source.primary_category && (
                          <p>Category: {source.primary_category}</p>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                        {source.snippet}...
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

