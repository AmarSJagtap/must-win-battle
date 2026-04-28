import { useState, useRef, useEffect } from 'react';
import { api } from './api';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('chat'); // 'chat' | 'docs'
  const [messages, setMessages] = useState([
    { role: 'bot', text: "👋 Hi! I'm your MWB Project Assistant. Ask me anything about your projects — status, risks, what to improve, and more!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      loadDocs();
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadDocs = async () => {
    try { setDocs(await api.getKnowledgeDocs()); } catch {}
  };

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await api.chat(msg);
      setMessages(prev => [...prev, { role: 'bot', text: res.reply }]);
      if (!open) setUnread(n => n + 1);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: '⚠️ Failed to get a response. Please try again.' }]);
    }
    setLoading(false);
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.uploadKnowledgeDoc(file);
      await loadDocs();
      alert(`✅ "${file.name}" added to knowledge base!`);
    } catch {
      alert('❌ Upload failed. Only PDF and Excel are supported.');
    }
    setUploading(false);
    e.target.value = '';
  };

  const deleteDoc = async (id, name) => {
    if (!confirm(`Remove "${name}" from knowledge base?`)) return;
    await api.deleteKnowledgeDoc(id);
    await loadDocs();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const QUICK = [
    '📊 Summarize all projects',
    '⚠️ Which projects are at risk?',
    '🔴 What is off track and why?',
    '✅ List all overdue actions',
  ];

  return (
    <>
      {/* Floating Button */}
      <button className="chatbot-fab" onClick={() => setOpen(o => !o)} title="AI Assistant">
        {open ? '✕' : '✨'}
        {!open && unread > 0 && <span className="chatbot-badge">{unread}</span>}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">✨</div>
              <div>
                <div className="chatbot-title">MWB AI Assistant</div>
                <div className="chatbot-subtitle">Powered by Azure OpenAI · Full project context</div>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Tabs */}
          <div className="chatbot-tabs">
            <button className={`chatbot-tab${tab === 'chat' ? ' active' : ''}`} onClick={() => setTab('chat')}>💬 Chat</button>
            <button className={`chatbot-tab${tab === 'docs' ? ' active' : ''}`} onClick={() => setTab('docs')}>
              📚 Knowledge Base {docs.length > 0 && <span className="chatbot-doc-count">{docs.length}</span>}
            </button>
          </div>

          {tab === 'chat' ? (
            <>
              {/* Messages */}
              <div className="chatbot-messages">
                {messages.map((m, i) => (
                  <div key={i} className={`chatbot-msg ${m.role}`}>
                    {m.role === 'bot' && <div className="chatbot-msg-avatar">✨</div>}
                    <div className="chatbot-msg-bubble">
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{m.text}</pre>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="chatbot-msg bot">
                    <div className="chatbot-msg-avatar">✨</div>
                    <div className="chatbot-msg-bubble chatbot-typing">
                      <span /><span /><span />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick prompts */}
              {messages.length <= 1 && (
                <div className="chatbot-quick-prompts">
                  {QUICK.map((q, i) => (
                    <button key={i} className="chatbot-quick-btn" onClick={() => { setInput(q); }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="chatbot-input-area">
                <textarea
                  className="chatbot-input"
                  rows={1}
                  placeholder="Ask about projects, risks, actions..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                />
                <button className="chatbot-send" onClick={sendMessage} disabled={loading || !input.trim()}>
                  {loading ? '⏳' : '➤'}
                </button>
              </div>
            </>
          ) : (
            /* Knowledge Base Tab */
            <div className="chatbot-docs-tab">
              <div className="chatbot-docs-header">
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 12px' }}>
                  Upload PDFs or Excel files to add extra context to the AI's knowledge base.
                </p>
                <button
                  className="chatbot-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? '⏳ Uploading...' : '📎 Upload PDF / Excel'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.xlsx,.xls,.xlsm"
                  style={{ display: 'none' }}
                  onChange={handleFile}
                />
              </div>

              <div className="chatbot-docs-list">
                {docs.length === 0 ? (
                  <div className="chatbot-docs-empty">
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                    No documents uploaded yet.
                  </div>
                ) : docs.map(d => (
                  <div className="chatbot-doc-item" key={d.id}>
                    <div className="chatbot-doc-icon">{d.filetype === 'pdf' ? '📄' : '📊'}</div>
                    <div className="chatbot-doc-info">
                      <div className="chatbot-doc-name">{d.filename}</div>
                      <div className="chatbot-doc-meta">
                        {d.filetype.toUpperCase()} · {new Date(d.uploaded_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button className="chatbot-doc-del" onClick={() => deleteDoc(d.id, d.filename)} title="Remove">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
