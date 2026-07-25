import { useState } from 'react';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  SparklesIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { aiApi } from '../../api/aiApi';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const SUGGESTIONS = [
  'How many artifacts need conservation?',
  'What are today\'s visitor counts?',
  'Summarize recent artifact additions',
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const handleAsk = async (e, customPrompt) => {
    if (e) e.preventDefault();
    const query = customPrompt || question;
    if (!query.trim()) return;

    const userMessage = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setQuestion('');
    setLoading(true);

    try {
      const res = await aiApi.ask(query);
      const { answer, data_sources } = res.data.data;
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: answer, sources: data_sources },
      ]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'AI assistant unavailable');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I am temporarily unavailable. Please try again in a moment.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-smrmp-green via-[#2D3F06] to-[#1C120B] text-white shadow-xl shadow-black/30 transition-all duration-300 hover:scale-105 active:scale-95 group border border-smrmp-gold/40"
        aria-label="Open AI assistant"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-smrmp-gold text-[10px] font-bold text-black ring-2 ring-white">
          ✨
        </span>
        <ChatBubbleLeftRightIcon className="h-6 w-6 text-smrmp-gold group-hover:rotate-12 transition-transform" />
      </button>

      {/* Floating Chat Modal */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[480px] w-96 max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-3xl border border-smrmp-gold/30 bg-[#FAF6F0] shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200 text-[#2B1B12]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#1C120B] via-[#241710] to-[#120D08] px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-smrmp-gold/20 text-smrmp-gold ring-1 ring-smrmp-gold/40">
                <SparklesIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-white">Museum AI Assistant</p>
                <p className="text-[11px] text-smrmp-gold/80">Live Archive & Operations Intelligence</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl p-1 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-xs">
            {messages.length === 0 && (
              <div className="py-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FAF0D8] text-[#7C4A2D] border border-smrmp-gold/40">
                  <LightBulbIcon className="h-5 w-5" />
                </div>
                <p className="font-bold text-[#2B1B12]">Ask the Museum Assistant</p>
                <p className="mt-1 text-[#6E5445] max-w-xs mx-auto">
                  Query real-time database metrics, artifact conservation status, or visitor reports.
                </p>

                <div className="mt-4 space-y-2 text-left">
                  {SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={(e) => handleAsk(e, sug)}
                      className="w-full text-left rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] p-2.5 text-xs text-[#2B1B12] hover:bg-[#FAF0E4] hover:border-smrmp-gold/40 transition-colors"
                    >
                      💡 {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-smrmp-green to-smrmp-deep-green text-white shadow-xs'
                      : 'border border-[#E2D6C5] bg-[#FFFDF9] text-[#2B1B12] shadow-xs'
                  }`}
                >
                  {msg.content}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 border-t border-[#E2D6C5] pt-1.5 text-[10px] text-[#6E5445]">
                      Sources: <span className="font-semibold text-[#2B1B12]">{msg.sources.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] px-3.5 py-2.5 text-[#6E5445] w-32">
                <span className="h-2 w-2 animate-ping rounded-full bg-smrmp-gold" />
                <span>Thinking...</span>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={(e) => handleAsk(e)} className="border-t border-[#E2D6C5] bg-[#EFE5D8]/50 p-3">
            <div className="flex gap-2">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about artifacts, visitors, or alerts..."
                className="flex-1 rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] px-3.5 py-2 text-xs text-[#2B1B12] outline-none focus:border-smrmp-green focus:ring-2 focus:ring-smrmp-green/20"
              />
              <Button type="submit" size="sm" variant="gold" disabled={loading}>
                <PaperAirplaneIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Alert variant="ai" className="mt-2 text-[10px] py-1.5 px-2.5">
              AI insights derived directly from live database metrics.
            </Alert>
          </form>
        </div>
      )}
    </>
  );
}
