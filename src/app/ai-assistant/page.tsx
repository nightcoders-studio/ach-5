'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, Send, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

// Helper to render simple bold markdown (**text**) as bold JSX elements
function parseMarkdownBold(text: string) {
  if (!text) return '';
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} style={{ fontWeight: 800 }}>{part}</strong>;
    }
    return part;
  });
}

const moodItems = [
  { id: 'happy',     emoji: '😊', label: 'Happy',     query: 'Aku lagi bahagia sekali hari ini! Ada rekomendasi menu manis atau segar buat merayakan hari ini?' },
  { id: 'ngantuk',   emoji: '😴', label: 'Ngantuk',   query: 'Aku mengantuk sekali... Tolong pilihkan kopi paling kuat, pahit, dan bisa membuat melek instan!' },
  { id: 'belajar',   emoji: '📚', label: 'Belajar',   query: 'Aku ingin belajar serius. Butuh menu minuman agar fokus tapi tidak terlalu manis atau berat.' },
  { id: 'kerja',     emoji: '💻', label: 'Kerja',     query: 'Aku sedang produktif kerja. Mau rekomendasi kopi mantap plus camilan gurih buat menemani kerja!' },
  { id: 'nongkrong', emoji: '👥', label: 'Nongkrong', query: 'Aku sedang nongkrong santai bersama teman-teman. Rekomendasikan camilan gurih atau manis plus minuman segar!' },
];

const suggestionChips = [
  { label: 'Saya suka manis',   query: 'Aku suka menu yang manis-manis, tolong berikan rekomendasi dong!' },
  { label: 'Budget 25 Ribu',    query: 'Aku ada budget 25 ribu rupiah. Menu KUPITA apa saja yang pas di dompetku?' },
  { label: 'Tidak suka kopi',   query: 'Aku tidak suka kopi atau kafein. Beritahu aku menu non-kopi yang paling best seller!' },
  { label: 'Rekomendasi baru',  query: 'Ada menu baru apa saja di KUPITA yang wajib aku coba hari ini?' },
];

const INITIAL_MESSAGE: Message = {
  sender: 'ai',
  text: `Halo Rakan! Aku AI assistant KUPITA.\n\nAku bisa membantu kamu:\n• Memilih menu sesuai selera & mood hari ini\n• Mencari menu yang sesuai dengan budget kamu\n• Merekomendasikan kombinasi minuman & camilan terbaik\n\nMau mulai dari mana? Ceritakan saja preferensimu di bawah, atau langsung klik emoji mood atau saran pertanyaan di atas ya!`,
};

export default function AIAssistantPage() {
  const [messages, setMessages]         = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText]       = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef    = useRef<HTMLDivElement>(null);
  const chatContainerRef  = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: textToSend };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Terjadi kesalahan sistem.');
      setMessages(prev => [...prev, { sender: 'ai', text: data.text }]);
    } catch (error: any) {
      setErrorMessage(error.message || 'Koneksi ke AI terputus. Pastikan server aktif.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodSelect = (moodId: string, query: string) => {
    setSelectedMood(moodId);
    handleSendMessage(query);
  };

  // ─── Shared renderers ─────────────────────────────────────────────────────

  // Mood button (used in both sidebar and mobile section)
  const renderMoodButton = (mood: typeof moodItems[0], variant: 'sidebar' | 'mobile') => {
    const isSelected = selectedMood === mood.id;
    if (variant === 'sidebar') {
      return (
        <button
          key={mood.id}
          onClick={() => handleMoodSelect(mood.id, mood.query)}
          disabled={isLoading}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 10,
            background: isSelected ? 'var(--color-primary-light)' : 'var(--color-bg-elevated)',
            border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease', textAlign: 'left', width: '100%',
          }}
        >
          <span style={{ fontSize: 20, lineHeight: 1 }}>{mood.emoji}</span>
          <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
            {mood.label}
          </span>
        </button>
      );
    }
    // mobile grid button
    return (
      <button
        key={mood.id}
        onClick={() => handleMoodSelect(mood.id, mood.query)}
        disabled={isLoading}
        className="pressable"
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '8px 2px', borderRadius: 'var(--radius-md)',
          background: isSelected ? 'var(--color-primary-light)' : 'var(--color-bg-card)',
          border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'all var(--transition-fast)', outline: 'none',
          boxShadow: isSelected ? 'var(--shadow-card)' : 'none',
        }}
      >
        <span style={{ fontSize: 24, marginBottom: 2 }}>{mood.emoji}</span>
        <span style={{ fontSize: 9.5, fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
          {mood.label}
        </span>
      </button>
    );
  };

  // Chat messages list
  const renderMessages = () => (
    <>
      {messages.map((msg, index) => {
        const isAI = msg.sender === 'ai';
        return (
          <div key={index} className="animate-fade-up stagger-1" style={{ display: 'flex', justifyContent: isAI ? 'flex-start' : 'flex-end' }}>
            <div style={{ display: 'flex', gap: 8, maxWidth: '85%', flexDirection: isAI ? 'row' : 'row-reverse' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: isAI ? 'var(--color-primary-light)' : 'var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                color: isAI ? 'var(--color-primary)' : 'white',
                flexShrink: 0, boxShadow: 'var(--shadow-card)',
              }}>
                {isAI ? '🤖' : '👤'}
              </div>
              <div className="text-body" style={{
                background: isAI ? 'var(--color-bg-card)' : 'var(--color-primary)',
                color: isAI ? 'var(--color-text-primary)' : 'white',
                padding: '10px 14px',
                borderRadius: isAI ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                border: isAI ? '1.5px solid var(--color-border)' : 'none',
                boxShadow: 'var(--shadow-card)',
                fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap',
              }}>
                {parseMarkdownBold(msg.text)}
              </div>
            </div>
          </div>
        );
      })}

      {/* Loading dots */}
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 8, maxWidth: '85%' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>
              🤖
            </div>
            <div style={{ background: 'var(--color-bg-card)', padding: '10px 14px', borderRadius: '4px 16px 16px 16px', border: '1.5px solid var(--color-border)', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span className="dot-1" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)' }} />
                <span className="dot-2" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)' }} />
                <span className="dot-3" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)' }} />
              </div>
              <span className="text-small" style={{ fontSize: 9.5, color: 'var(--color-text-muted)' }}>AI sedang berpikir...</span>
            </div>
          </div>
        </div>
      )}

      {/* Error box */}
      {errorMessage && (
        <div className="animate-fade-up" style={{ background: 'var(--color-error-bg)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'flex-start', margin: '8px 0' }}>
          <AlertCircle size={20} color="var(--color-error)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <h3 className="text-subheading" style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-error)', marginBottom: 3 }}>Koneksi Gagal</h3>
            <p className="text-body" style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>{errorMessage}</p>
            {errorMessage.includes('GEMINI_API_KEY') && (
              <p className="text-small" style={{ fontSize: 11, marginTop: 6, lineHeight: 1.4 }}>
                💡 <strong>Tips:</strong> Tambahkan <code>.env.local</code> dengan <code>GEMINI_API_KEY=nilai_key</code>.
              </p>
            )}
            <button
              onClick={() => handleSendMessage(messages[messages.length - 1]?.text || 'Halo')}
              className="btn pressable"
              style={{ background: 'var(--color-bg-card)', border: '1.5px solid var(--color-border-strong)', borderRadius: 'var(--radius-sm)', padding: '4px 10px', height: 28, minHeight: 28, fontSize: 10.5, fontWeight: 600, color: 'var(--color-text-secondary)', marginTop: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <RefreshCw size={11} /> Coba Lagi
            </button>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </>
  );

  // ─── Input form (shared) ──────────────────────────────────────────────────
  const renderInputForm = () => (
    <form
      onSubmit={e => { e.preventDefault(); handleSendMessage(inputText); }}
      style={{ display: 'flex', gap: 8, alignItems: 'center' }}
    >
      <input
        type="text"
        value={inputText}
        onChange={e => setInputText(e.target.value)}
        placeholder={isLoading ? 'AI sedang mengetik...' : 'Tanya apa saja tentang menu...'}
        disabled={isLoading}
        className="input"
        style={{ flex: 1, fontSize: 13.5, height: 44 }}
      />
      <button
        type="submit"
        disabled={isLoading || !inputText.trim()}
        className="btn pressable"
        style={{
          width: 44, height: 44, borderRadius: 'var(--radius-md)',
          background: isLoading || !inputText.trim() ? 'var(--color-bg-sunken)' : 'var(--color-primary)',
          color: isLoading || !inputText.trim() ? 'var(--color-text-muted)' : 'white',
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: isLoading || !inputText.trim() ? 'not-allowed' : 'pointer',
          boxShadow: isLoading || !inputText.trim() ? 'none' : 'var(--shadow-card)',
        }}
      >
        <Send size={16} strokeWidth={2.5} />
      </button>
    </form>
  );

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <>
      <div className="ai-page-wrapper safe-top">

        {/* ════════════════════════════════════════
            DESKTOP SIDEBAR (hidden on mobile)
            ════════════════════════════════════════ */}
        <aside className="ai-sidebar">

          {/* App identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src="/smart-coffee.svg" alt="KUPITA" style={{ height: 26, width: 'auto' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                Tanya KUPITA AI
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 6px var(--color-success)', flexShrink: 0 }} />
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

          {/* Mood picker */}
          <div>
            <h2 style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 10px' }}>
              Lagi gimana mood kamu?
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {moodItems.map(mood => renderMoodButton(mood, 'sidebar'))}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

          {/* Quick suggestion chips */}
          <div>
            <h2 style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 10px' }}>
              Tanya Langsung
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {suggestionChips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(chip.query)}
                  disabled={isLoading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '8px 11px', borderRadius: 9,
                    background: 'var(--color-bg-elevated)',
                    border: '1.5px solid var(--color-border)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontSize: 12.5, fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    textAlign: 'left', transition: 'all 0.15s ease',
                    width: '100%',
                  }}
                >
                  <Sparkles size={11} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 'auto', paddingTop: 8 }}>
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', marginBottom: 12 }} />
            <Link href="/menu" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--color-text-muted)', textDecoration: 'none', padding: '8px 11px', borderRadius: 9, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', fontWeight: 500 }}>
              <span style={{ fontSize: 14 }}>📋</span> Lihat Menu Lengkap
            </Link>
          </div>
        </aside>

        {/* ════════════════════════════════════════
            CHAT COLUMN (main area)
            ════════════════════════════════════════ */}
        <div className="ai-chat-column">

          {/* ── Mobile header (hidden on desktop) ── */}
          <header
            className="ai-mobile-header"
            style={{
              position: 'sticky', top: 0,
              background: 'var(--color-bg-card)',
              borderBottom: '1px solid var(--color-border)',
              padding: '12px var(--space-page)',
              alignItems: 'center', gap: 12, zIndex: 30,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <Link href="/" className="pressable" style={{ color: '#57534E', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', borderRadius: '50%', width: 44, height: 44, background: 'white', border: '1px solid #E7E5E4', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.15s ease', flexShrink: 0 }}>
              <ChevronLeft size={20} strokeWidth={2.5} color="#57534E" />
            </Link>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h1 className="text-heading" style={{ fontSize: 15, fontWeight: 750, margin: 0 }}>Tanya KUPITA AI</h1>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block', boxShadow: '0 0 6px var(--color-success)' }} />
              </div>
            </div>
            <img src="/smart-coffee.svg" alt="KUPITA Logo" style={{ height: 28, width: 'auto' }} />
          </header>

          {/* ── Mobile mood picker (hidden on desktop) ── */}
          <section
            className="ai-mobile-mood"
            style={{ background: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border)', padding: '12px var(--space-page) 14px' }}
          >
            <h2 className="section-label" style={{ marginBottom: 8 }}>Lagi gimana mood kamu nih?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
              {moodItems.map(mood => renderMoodButton(mood, 'mobile'))}
            </div>
          </section>

          {/* ── Scrollable messages ── */}
          <div
            ref={chatContainerRef}
            className="ai-messages-scroll hide-scrollbar"
            style={{ padding: '16px var(--space-page) 32px', display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {renderMessages()}
          </div>

          {/* ── Input area (sticky bottom) ── */}
          <section
            className="safe-bottom"
            style={{
              background: 'var(--color-bg-card)',
              borderTop: '1.5px solid var(--color-border)',
              padding: '10px var(--space-page)',
              boxShadow: 'var(--shadow-bottom-nav)',
              zIndex: 10,
            }}
          >
            {/* Suggestion chips — mobile only, first message */}
            {messages.length === 1 && !isLoading && (
              <div className="ai-mobile-chips scroll-x hide-scrollbar" style={{ paddingBottom: 10, marginBottom: 6 }}>
                {suggestionChips.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(chip.query)}
                    className="tag pressable"
                    style={{ fontSize: 11.5, fontWeight: 500, cursor: 'pointer', outline: 'none', whiteSpace: 'nowrap', flexShrink: 0, background: 'var(--color-bg-elevated)', border: '1.5px solid var(--color-border)', padding: '6px 12px', borderRadius: 'var(--radius-pill)' }}
                  >
                    <Sparkles size={10} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle', color: 'var(--color-primary)' }} />
                    {chip.label}
                  </button>
                ))}
              </div>
            )}
            {renderInputForm()}
          </section>
        </div>

      </div>

      <Navbar />
    </>
  );
}
