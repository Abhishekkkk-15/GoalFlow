import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { ChatMessage } from '../types';
import { Send, Bot, User } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedPrompts = [
    "I’m stuck—help me pick one small next step",
    "What should I focus on today?",
    "I missed a task—how do I get back on track?",
    "Give me a quick motivation plan for the next 10 minutes",
  ];

  const aiReplyProvider = async (userText: string): Promise<string> => {
    const lower = userText.toLowerCase();
    await new Promise((resolve) => setTimeout(resolve, 900));

    if (lower.includes('stuck') || lower.includes('overwhelm')) {
      return "Let’s make this easy. Pick one tiny action you can finish in 5 minutes. Then we’ll schedule the next micro-step right after it. What’s the smallest action you can do today?";
    }

    if (lower.includes('today') || lower.includes('focus')) {
      return "Today’s focus: complete the smallest high-impact task first. After that, do a 2-minute “momentum check” (how you feel + what to adjust). Want to tell me which task you’re currently avoiding?";
    }

    if (lower.includes('missed') || lower.includes('back on track') || lower.includes('miss')) {
      return "Missing a task isn’t failure—it’s data. Let’s reset gently: (1) identify what got in the way, (2) shrink the next task by 50%, and (3) add a simple trigger (time/place) so it’s easier to start.";
    }

    return "Thanks for sharing. Here’s a simple plan: (1) choose one goal you care about, (2) define the next action in one sentence, and (3) do it for 10 minutes. What’s your next action right now?";
  };

  const handleSendText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: trimmed,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const aiText = await aiReplyProvider(trimmed);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiText,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        {/* Header */}
        <PageHeader
          title="AI Chat"
          description="Get instant advice and motivation from your personal AI coach."
        />

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                disabled={isThinking}
                aria-label="Chat message"
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!newMessage.trim() || isThinking}
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