import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BrainCircuit, X, Send, Minimize2, Maximize2,
  Sparkles, RotateCcw, Copy, CheckCheck, ChevronDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const SUGGESTIONS = [
  "How do I prepare for a Google coding round?",
  "What's a good CGPA for top MNCs?",
  "Tips to improve my resume for placements",
  "How does the placement pipeline work?",
  "Which skills should a CSE student focus on?",
];

function MessageBubble({ msg, onCopy }: { msg: Message; onCopy: (t: string) => void }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
        <AvatarFallback className={`text-[10px] font-bold ${isUser ? "bg-primary text-primary-foreground" : "bg-gradient-to-br from-violet-500 to-blue-500 text-white"}`}>
          {isUser ? "You" : "AI"}
        </AvatarFallback>
      </Avatar>
      <div className={`group max-w-[82%] space-y-1 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`relative rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted/60 border text-foreground rounded-tl-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:my-1.5 prose-code:text-xs prose-code:bg-background/60 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
              <ReactMarkdown>{msg.content || (msg.streaming ? "" : "…")}</ReactMarkdown>
              {msg.streaming && (
                <span className="inline-flex gap-0.5 ml-1 translate-y-0.5">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
              )}
            </div>
          )}
        </div>
        {!msg.streaming && !isUser && (
          <button
            onClick={() => onCopy(msg.content)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-1"
          >
            <Copy className="w-2.5 h-2.5" /> Copy
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function AIAssistant() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => scrollToBottom(false), 50);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, minimized, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  }, [toast]);

  const sendMessage = useCallback(async (text: string) => {
    const userText = text.trim();
    if (!userText || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: userText };
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "", streaming: true };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) throw new Error("Network error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullContent += data.content;
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, content: fullContent } : m)
              );
            }
            if (data.done || data.error) {
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, streaming: false, content: data.error ? "Sorry, something went wrong. Please try again." : fullContent } : m)
              );
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev =>
        prev.map(m => m.id === assistantId
          ? { ...m, streaming: false, content: "Sorry, I couldn't connect. Please try again." }
          : m
        )
      );
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [loading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const reset = () => {
    setMessages([]);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const isOpen = open && !minimized;

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/30 flex items-center justify-center hover:shadow-xl hover:shadow-violet-500/40 transition-shadow"
          >
            <BrainCircuit className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl border bg-card shadow-2xl shadow-black/20 overflow-hidden"
            style={{ width: "min(400px, calc(100vw - 2rem))", height: minimized ? "auto" : "min(600px, calc(100vh - 3rem))" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">TalentBot</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <span className="text-[10px] text-white/80">AI Placement Assistant</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button onClick={reset} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Clear chat">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => setMinimized(m => !m)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                  {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => { setOpen(false); setMinimized(false); }} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <AnimatePresence>
              {!minimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="flex flex-col flex-1 min-h-0 overflow-hidden"
                >
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0" ref={scrollRef}>
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-200 dark:border-violet-800 flex items-center justify-center">
                          <Sparkles className="w-7 h-7 text-violet-500" />
                        </div>
                        <div>
                          <p className="font-bold text-base">Hi{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋</p>
                          <p className="text-sm text-muted-foreground mt-1 max-w-[260px]">
                            I'm TalentBot — your AI placement assistant. Ask me anything about campus recruitment!
                          </p>
                        </div>
                        <div className="w-full space-y-2 mt-2">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Try asking</p>
                          {SUGGESTIONS.map(s => (
                            <button
                              key={s}
                              onClick={() => sendMessage(s)}
                              className="w-full text-left text-xs px-3 py-2 rounded-xl bg-muted/50 border hover:bg-muted hover:border-primary/30 transition-colors text-foreground/80"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map(msg => (
                          <MessageBubble key={msg.id} msg={msg} onCopy={handleCopy} />
                        ))}
                        <div ref={bottomRef} />
                      </>
                    )}
                  </div>

                  {/* Input */}
                  <div className="px-3 py-3 border-t bg-card/80 backdrop-blur-sm shrink-0">
                    <div className="flex items-center gap-2 bg-muted/50 border rounded-xl px-3 py-1.5 focus-within:border-primary/50 focus-within:bg-background transition-colors">
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about placements, interviews…"
                        disabled={loading}
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 py-1"
                      />
                      <button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || loading}
                        className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-center text-[10px] text-muted-foreground/50 mt-1.5">Powered by GPT-4o-mini · TalentHub Campus</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
