import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Play, Pause, ChevronDown, ExternalLink, X } from 'lucide-react';
import { AgentType, Message, AgentConfig, UserProfile } from '../types';
import { AGENTS } from '../constants';
import { generateAgentResponse } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatInterfaceProps {
  onClose: () => void;
  userProfile?: UserProfile;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose, userProfile }) => {
  const [activeAgentId, setActiveAgentId] = useState<AgentType>(AgentType.GENERAL);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'こんにちは。GENESIS AIコンシェルジュへようこそ。ご用件をお伺いします。',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null); // ID of message currently playing audio
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const activeAgent = AGENTS.find((a) => a.id === activeAgentId) || AGENTS[0];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await generateAgentResponse(activeAgentId, input, userProfile);

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: response.text,
      timestamp: Date.now(),
      groundingUrls: response.groundingUrls,
      audioData: response.audioBuffer ? response.audioBuffer.getChannelData(0) : undefined
    };

    (botMsg as any)._audioBuffer = response.audioBuffer; 

    setMessages((prev) => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Check if IME composition is active to prevent submitting while converting Japanese text
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSendMessage();
    }
  };

  const playAudio = (message: Message) => {
    const buffer = (message as any)._audioBuffer as AudioBuffer;
    if (!buffer) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.start();
    
    setIsPlaying(message.id);
    source.onended = () => setIsPlaying(null);
  };

  const handleAgentSelect = (agentId: AgentType) => {
    setActiveAgentId(agentId);
    setIsDropdownOpen(false);
    
    // Reset Chat History when switching agents
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'model',
        text: 'こんにちは。GENESIS AIコンシェルジュへようこそ。ご用件をお伺いします。',
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
      {/* Header with Agent Switcher - Red Theme */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-4 shadow-md z-20 shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold tracking-widest text-red-100 uppercase">AI Concierge</h2>
          <button onClick={onClose} className="text-red-100 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full text-left flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white/10 transition-colors border border-transparent focus:outline-none focus:border-white/30"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm bg-white text-red-600`}>
              {activeAgent.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-lg flex items-center gap-2">
                <span className="truncate">{activeAgent.name}</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              <div className="text-xs text-red-100 truncate">{activeAgent.description}</div>
            </div>
          </button>

          {/* Click-based Dropdown */}
          {isDropdownOpen && (
            <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                <div className="absolute top-full left-0 w-full bg-white text-gray-800 rounded-lg shadow-xl mt-2 overflow-hidden z-20 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    {AGENTS.map((agent) => (
                    <button
                        key={agent.id}
                        onClick={() => handleAgentSelect(agent.id)}
                        className={`w-full text-left p-3 flex items-center gap-3 hover:bg-red-50 transition-colors border-b last:border-0 border-gray-50 ${activeAgentId === agent.id ? 'bg-red-50' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm text-white ${agent.color}`}>
                            {agent.icon}
                        </div>
                        <div className="text-sm font-medium">{agent.name}</div>
                    </button>
                    ))}
                </div>
            </>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${
              msg.role === 'user' ? 'bg-gray-800 text-white' : 'bg-white text-red-600 border border-red-100'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-sm ${
              msg.role === 'user' 
                ? 'bg-gray-800 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
            }`}>
              <MarkdownRenderer content={msg.text} />

              {/* Grounding Sources */}
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-2">参照ソース:</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingUrls.map((url, idx) => (
                      <a 
                        key={idx}
                        href={url.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs bg-gray-50 text-blue-600 px-2 py-1 rounded hover:bg-gray-100 transition border border-gray-200"
                      >
                        <ExternalLink size={10} />
                        <span className="truncate max-w-[150px]">{url.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Audio Player (for News Agent) */}
              {(msg as any)._audioBuffer && (
                <button
                  onClick={() => playAudio(msg)}
                  className="mt-3 flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-full hover:bg-red-100 transition-colors text-xs font-bold w-fit border border-red-100"
                >
                  {isPlaying === msg.id ? <Pause size={14} /> : <Play size={14} />}
                  {isPlaying === msg.id ? '再生中...' : '要約を聴く'}
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-white text-red-600 border border-red-100 shadow-sm">
              <Bot size={16} />
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 shrink-0">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeAgentId === AgentType.ANALYST ? "今月の食費はいくら？" : "メッセージを入力..."}
            className="w-full bg-gray-100 text-gray-900 rounded-full py-3 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm placeholder:text-gray-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 transition-colors shadow-sm"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-2">
          AIエージェントは間違いを犯す可能性があります。重要な情報は確認してください。
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
