import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { ChatMessage } from "../types";
import { Send, Bot, User, Crown } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { createApiClient } from "../api/client";
import { ProgressBar } from "../components/ui/ProgressBar";

type ChatApiMessage = {
  sender: "user" | "ai";
  message: string;
  timestamp: string;
};

type ChatApiResponse = {
  chat: {
    messages: ChatApiMessage[];
  };
  usage: {
    monthKey: string;
    tokensUsed: number;
    limit: number | null;
    planTier: "free" | "pro";
    limitReached?: boolean;
  };
};

type ChatApiErrorResponse = {
  error?: string;
  usage?: ChatApiResponse["usage"];
};

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<ChatApiResponse["usage"] | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { getToken } = useAuth();

  const suggestedPrompts = [
    "I’m stuck—help me pick one small next step",
    "What should I focus on today?",
    "I missed a task—how do I get back on track?",
    "Give me a quick motivation plan for the next 10 minutes",
  ];

  const syncFromApi = (payload: ChatApiResponse) => {
    const mapped: ChatMessage[] = (payload.chat?.messages ?? []).map((m) => ({
      id: `${m.timestamp}_${m.sender}`,
      content: m.message,
      sender: m.sender === "ai" ? "ai" : "user",
      timestamp: m.timestamp,
    }));
    setMessages(mapped);
    setUsage(payload.usage);
  };

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ChatApiErrorResponse | undefined;
      if (data?.usage) setUsage(data.usage);
      if (typeof data?.error === "string" && data.error.trim()) return data.error;
      if (typeof err.response?.statusText === "string" && err.response.statusText) {
        return err.response.statusText;
      }
    }
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  };

  const loadChat = async () => {
    const token = await getToken();
    if (!token) throw new Error("Missing Clerk token");
    const api = createApiClient(token);
    const res = await api.get("/api/chat");
    syncFromApi(res.data);
  };

  const handleSendText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setApiError(null);
    const userMessageId = Date.now().toString();
    const userMessage: ChatMessage = {
      id: userMessageId,
      content: trimmed,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("Missing Clerk token");
      const api = createApiClient(token);

      const res = await api.post("/api/chat", { message: trimmed });
      const data = res.data as ChatApiResponse & { reply?: string };

      if (data?.chat) {
        syncFromApi(data);
        return;
      }

      const aiText = data.reply ?? "Sorry, I couldn't generate a response.";
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiText,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err: unknown) {
      setMessages((prev) => prev.filter((m) => m.id !== userMessageId));
      setApiError(getErrorMessage(err, "Failed to send message"));
    } finally {
      setIsThinking(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setNewMessage('');
    await handleSendText(newMessage);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        await loadChat();
      } catch (err: unknown) {
        if (alive) setApiError(getErrorMessage(err, "Failed to load chat"));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const limitProgress = useMemo(() => {
    if (!usage?.limit) return 0;
    return (usage.tokensUsed / usage.limit) * 100;
  }, [usage]);

  const handleUpgrade = async () => {
    setApiError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Missing Clerk token");
      const api = createApiClient(token);
      const res = await api.post("/api/billing/checkout");
      const url = res.data?.url as string | undefined;
      if (!url) throw new Error("Missing checkout URL");
      window.location.href = url;
    } catch (err: unknown) {
      setApiError(getErrorMessage(err, "Failed to start checkout"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        {/* Header */}
        <PageHeader
          title="AI Chat"
          description="Get instant advice and motivation from your personal AI coach."
        />

        {/* Usage / Upgrade */}
        <Card className="p-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              <div className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">Plan:</span>{" "}
                {usage?.planTier ?? "free"}
                {usage?.limit ? (
                  <>
                    {" "}
                    · {usage.tokensUsed}/{usage.limit} tokens this month (
                    {usage.monthKey})
                  </>
                ) : (
                  <> · Unlimited</>
                )}
              </div>
            </div>
            {usage?.planTier === "free" && (
              <Button
                variant="outline"
                onClick={handleUpgrade}
                aria-label="Upgrade to Pro"
              >
                Upgrade to Pro
              </Button>
            )}
          </div>
          {usage?.limit ? (
            <div className="mt-3">
              <ProgressBar progress={limitProgress} />
              {usage.tokensUsed >= usage.limit ? (
                <div className="text-xs text-red-600 mt-2">
                  You’ve reached your free monthly token limit. Upgrade for
                  unlimited access.
                </div>
              ) : null}
            </div>
          ) : null}
        </Card>

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {apiError && (
              <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
                {apiError}
              </div>
            )}
            {loading && (
              <div className="text-sm text-gray-600">Loading chat...</div>
            )}
            {messages.length === 0 && !isThinking && (
              <EmptyState
                title="Start your coaching"
                description="Ask your AI coach for guidance, motivation, and a simple next-step plan."
                icon={<Bot className="w-6 h-6" />}
                action={
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        disabled={isThinking}
                        onClick={() => handleSendText(prompt)}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                        aria-label={`Send suggested prompt: ${prompt}`}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                }
              />
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 ${message.sender === 'user' ? 'ml-3' : 'mr-3'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' 
                        ? 'bg-black text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div className="flex justify-start">
                <div className="flex mr-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isThinking || (usage?.planTier === "free" && Boolean(usage?.limit) && usage.tokensUsed >= (usage.limit ?? 0))}
                aria-label="Chat message"
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={
                  !newMessage.trim() ||
                  isThinking ||
                  (usage?.planTier === "free" &&
                    Boolean(usage?.limit) &&
                    usage.tokensUsed >= (usage.limit ?? 0))
                }
                aria-label="Send chat message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};