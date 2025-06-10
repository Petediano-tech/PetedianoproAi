"use client";
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, Send, Sparkles, Loader2 } from "lucide-react";
import { peteAiAssistant, type PeteAiAssistantInput, type PeteAiAssistantOutput } from '@/ai/flows/peteai-assistant';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: "user" | "peteai";
  timestamp: Date;
}

export default function AssistantPage() {
  const [query, setQuery] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!query.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      text: query,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      const input: PeteAiAssistantInput = { query: userMessage.text };
      const result: PeteAiAssistantOutput = await peteAiAssistant(input);
      
      const aiMessage: Message = {
        id: Date.now().toString() + "-peteai",
        text: result.response,
        sender: "peteai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error with PeteAI Assistant:", error);
      toast({ title: "Error", description: "PeteAI Assistant is currently unavailable. " + (error as Error).message, variant: "destructive" });
      const errorMessage: Message = {
        id: Date.now().toString() + "-error",
        text: "Sorry, I encountered an error. Please try again.",
        sender: "peteai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 h-[calc(100vh-10rem)] flex flex-col">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Bot className="mr-3 h-8 w-8" /> PeteAI Assistant
          </CardTitle>
          <CardDescription>Your personal AI brainstormer and helper. Ask me anything!</CardDescription>
        </CardHeader>
      </Card>

      <Card className="flex-grow flex flex-col">
        <CardContent className="flex-grow p-0">
          <ScrollArea className="h-[calc(100%-4rem)] p-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-end gap-2",
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.sender === "peteai" && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://placehold.co/100x100/9C27B0/FFFFFF.png?text=PA" alt="PeteAI" data-ai-hint="robot avatar" />
                      <AvatarFallback>PA</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg px-4 py-3 shadow-md",
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                     <p className="text-xs mt-1 opacity-70 text-right">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {msg.sender === "user" && (
                     <Avatar className="h-8 w-8">
                        <AvatarImage src="https://placehold.co/100x100/E91E63/FFFFFF.png?text=U" alt="User" data-ai-hint="person avatar"/>
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-2 justify-start">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://placehold.co/100x100/9C27B0/FFFFFF.png?text=PA" alt="PeteAI" data-ai-hint="robot avatar"/>
                      <AvatarFallback>PA</AvatarFallback>
                    </Avatar>
                    <div className="max-w-[70%] rounded-lg px-4 py-3 shadow-md bg-secondary text-secondary-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Type your message to PeteAI..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              className="flex-grow"
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !query.trim()}>
              <Send className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
