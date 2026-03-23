import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const guardrails = ["who is", "poem", "joke", "weather", "translate"];
const suggestions = [
  "Top billed products",
  "Trace billing doc 91150187",
  "Explain transaction 91150187",
  "Find fraud",
  "Incomplete flows",
  "Customer revenue",
  "Journal entries"
];

const ChatPanel = ({ cyInstance, sendRef, width }) => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (document.startViewTransition) {
        document.startViewTransition(() => {
            endRef.current?.scrollIntoView({ behavior: 'smooth' });
        });
    } else {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  const getBadgeColor = (intent) => {
    if (intent.includes('Trace')) return '#3b82f6';
    if (intent.includes('Error') || intent.includes('Anomaly')) return '#f87171';
    if (intent.includes('Aggregat')) return '#22c55e';
    if (intent.includes('Lookup')) return '#f59e0b';
    if (intent.includes('Scope')) return '#f87171';
    if (intent.includes('Fraud')) return '#ef4444';
    if (intent.includes('Explain')) return '#8b5cf6';
    return '#1a1a1a';
  };

  // Backend API URL (Dynamic for Vercel/Render)
  const API_BASE = '/api';

  const handleSend = async (overrideQ) => {
    const text = overrideQ || query;
    if (!text.trim() || isThinking) return;

    setQuery("");
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsThinking(true);

    const qlow = text.toLowerCase();
    
    // Guardrails
    if (guardrails.some(g => qlow.includes(g))) {
      setTimeout(() => {
        setIsThinking(false);
        setMessages(prev => [...prev, {
          role: 'system',
          intent: '🚫 Out of Scope',
          intentColor: '#f87171',
          content: "This system only answers questions about the Order to Cash dataset. Please ask about orders, deliveries, billing, or payments."
        }]);
      }, 800);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/query`, { query: text });
      const data = res.data;
      
      // Update Graph
      if (cyInstance) {
        if (data.highlights && data.highlights.length > 0) {
          cyInstance.elements().addClass('dimmed').removeClass('highlighted');
          let collection = cyInstance.collection();
          data.highlights.forEach(h => {
            cyInstance.nodes().forEach(n => {
               if (n.data('id') === h || n.data('label').toLowerCase().includes(h.toLowerCase().replace('s',''))) {
                  n.removeClass('dimmed').addClass('highlighted');
                  collection = collection.union(n);
                  n.connectedEdges().removeClass('dimmed');
               }
            });
          });
          if (collection.length > 0) {
             cyInstance.animate({ fit: { eles: collection, padding: 50 } }, { duration: 800 });
          }
        } else {
          // STEP 5: Clear highlights if not a graph intent
          cyInstance.elements().removeClass('dimmed').removeClass('highlighted');
        }
      }

      const botMsg = {
        role: 'system',
        intent: data.intent || "🔍 Lookup",
        intentColor: getBadgeColor(data.intent || ""),
        content: data.answer || "Found matching records from your ERP system.",
        result: data.result,
        type: data.type
      };
      
      setIsThinking(false);
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
       // Offline mock data
       setTimeout(() => {
         setIsThinking(false);
         if(qlow.includes("trace") || qlow.includes("91150187")) {
             if (cyInstance) {
                cyInstance.elements().addClass('dimmed').removeClass('highlighted');
                let c = cyInstance.collection();
                ['91150187', '80737721', '740506', '9400635958', '310000108'].forEach(id => {
                  const n = cyInstance.getElementById(id);
                  if(n.length) { n.removeClass('dimmed').addClass('highlighted'); n.connectedEdges().removeClass('dimmed'); c = c.union(n); }
                });
                cyInstance.animate({ fit: { eles: c, padding: 50 } }, { duration: 800 });
             }
             setMessages(prev => [...prev, {
                role: 'system', intent: '🔗 Flow Trace', intentColor: '#3b82f6',
                content: "Tracing billing document **91150187**. It originates from Sales Order 740506 via Delivery 80737721 and posts to Journal Entry 9400635958.",
                planSteps: ["Lookup BillingDoc 91150187", "Traverse to predecessor (Delivery)", "Traverse to root (Order)"],
                sql: "SELECT * FROM billing_document_headers WHERE billingDocument='91150187'"
             }]);
         } else {
             setMessages(prev => [...prev, {
                role: 'system', intent: '⚠️ API Error', intentColor: '#f87171',
                content: "Backend API is unreachable. Showing mocked offline response."
             }]);
         }
       }, 1000);
    }
  };

  // Expose handleSend to parent via sendRef (for GraphPanel Explain button)
  useEffect(() => {
    if (sendRef) sendRef.current = handleSend;
  }, [sendRef]);

  // Reasoning and Table components removed per user request for a cleaner natural language UI.

  const renderFraudList = (data) => {
    if (!data || data.length === 0) return null;
    return (
      <div className="mt-2 space-y-1.5">
        {data.slice(0, 10).map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-[12px] bg-[#fef2f2] border border-[#fecaca] rounded-md px-2.5 py-1.5">
            <span className="shrink-0 mt-0.5">🔴</span>
            <div>
              <span className="font-semibold">{item.id || item.salesOrder || item.billingDocument || item.journalEntry}</span>
              <span className="text-[#991b1b] ml-1">{item.issue}</span>
            </div>
          </div>
        ))}
        {data.length > 10 && <div className="text-[11px] text-[#8a8a84]">...and {data.length - 10} more</div>}
      </div>
    );
  };

  const renderFlowTrace = (data) => {
    if (!data || data.length === 0) return null;
    const r = data[0]; // Take the first row for the main flow
    
    const steps = [
      { id: r.salesOrder, label: 'Order', icon: '📦', color: '#3b82f6' },
      { id: r.deliveryDocument, label: 'Delivery', icon: '🚚', color: '#22c55e' },
      { id: r.billingDocument, label: 'Billing', icon: '📄', color: '#f59e0b' },
      { id: r.journalEntry, label: 'Journal', icon: '📒', color: '#8b5cf6' },
      { id: r.paymentDoc, label: 'Payment', icon: '💰', color: '#f87171' }
    ].filter(s => s.id && s.id !== 'nan' && String(s.id).toLowerCase() !== 'null');

    return (
      <div className="mt-4 flex flex-col gap-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5 shadow-sm">
        <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1 px-1">Transaction Stream</div>
        <div className="flex items-center flex-wrap gap-y-4">
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <div 
                className="flex items-center gap-2 px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer hover:border-[#3b82f6] transition-all group"
                onClick={() => {
                  if (cyInstance) {
                    const n = cyInstance.getElementById(String(step.id));
                    if (n.length) {
                      cyInstance.elements().addClass('dimmed').removeClass('highlighted');
                      n.removeClass('dimmed').addClass('highlighted');
                      n.connectedEdges().removeClass('dimmed').addClass('highlighted');
                      cyInstance.animate({ fit: { eles: n.union(n.connectedEdges()), padding: 50 } }, { duration: 600 });
                    }
                  }
                }}
              >
                <span className="text-lg">{step.icon}</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#94a3b8] uppercase flex items-center gap-1">
                    {step.label}
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: step.color }}></div>
                  </span>
                  <span className="text-[12px] font-mono font-semibold text-[#1e293b] group-hover:text-[#3b82f6]">{step.id}</span>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-1.5 text-[#cbd5e1] font-bold text-xl animate-pulse">→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#f87171', '#8b5cf6'];

  const renderDynamicChart = (type, data) => {
    if (!data || data.length === 0 || type === 'table' || type === 'flow') return null;
    const keys = Object.keys(data[0]);
    if (keys.length < 2) return null;
    
    const xAxisKey = keys[0];
    const yAxisKey = keys[1];

    if (type === 'bar') {
      return (
        <div className="w-full h-[180px] mt-3 bg-white p-2 rounded border border-[#e2e2dc]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey={xAxisKey} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f5f5f0' }} contentStyle={{ fontSize: '11px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey={yAxisKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    if (type === 'distribution') {
      return (
        <div className="w-full h-[180px] mt-3 bg-white p-2 rounded border border-[#e2e2dc]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey={yAxisKey} nameKey={xAxisKey} cx="50%" cy="50%" outerRadius={60} fill="#3b82f6" label={{ fontSize: 10 }}>
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }
    return null;
  };
  const formatText = (txt) => {
     const parts = txt.split(/(\*\*.*?\*\*)/g);
     return parts.map((p, i) => {
       if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} className="font-semibold text-black">{p.slice(2,-2)}</strong>;
       return p;
     });
  };

  return (
    <div 
      className="border-l border-[#e2e2dc] flex flex-col bg-white shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10"
      style={{ width: `${width}px` }}
    >
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#e2e2dc] shrink-0">
        <div className="font-semibold text-[15px] text-[#1a1a1a]">Chat with Graph</div>
        <div className="text-[#8a8a84] text-[13px] mt-0.5">Order to Cash</div>
      </div>

      {/* Intro */}
      <div className="px-5 py-4.5 border-b border-[#e2e2dc] flex gap-3 items-start shrink-0">
         <div className="w-9 h-9 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center font-bold text-base shrink-0 shadow-sm">D</div>
         <div>
            <div className="font-bold text-[14px]">Dodge AI</div>
            <div className="text-[#8a8a84] text-[12px] mb-1.5">Graph Agent</div>
            <div className="text-[13.5px] text-[#1a1a1a] leading-snug">Hi! I can help you analyze the <strong>Order to Cash</strong> process.</div>
         </div>
      </div>

      {/* Suggestion Chips */}
      <div className="px-5 py-3 border-b border-[#e2e2dc] flex flex-wrap gap-1.5 shrink-0 bg-[#fafafa]">
         {suggestions.map(s => (
            <button key={s} onClick={() => handleSend(s)} className="px-3 py-1.5 rounded-full border border-[#e2e2dc] bg-[#f5f5f0] text-[12px] font-medium text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] transition-all">
               {s}
            </button>
         ))}
      </div>

      {/* Messages */}
      <div id="chat-messages" className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
         {messages.map((m, i) => (
            m.role === 'user' ? (
               <div key={i} className="bubble-user shadow-sm">{m.content}</div>
            ) : (
               <div key={i} className="flex gap-3">
                 <div className="w-7 h-7 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-sm">D</div>
                 <div className="bubble-ai shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex-1 min-w-0">
                    <div className="intent-badge" style={{ backgroundColor: m.intentColor }}>{m.intent}</div>
                     <div className="text-[13.5px] mt-1 whitespace-pre-wrap">{formatText(m.content)}</div>
                     {(m.type === 'flow' || m.type === 'explanation') && m.result && renderFlowTrace(m.result)}
                     {m.result && m.result.length > 0 && m.type && renderDynamicChart(m.type, m.result)}
                     {m.type === 'fraud' && m.result && renderFraudList(m.result)}
                  </div>
               </div>
            )
         ))}
         {isThinking && (
           <div className="flex gap-3">
             <div className="w-7 h-7 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-sm">D</div>
             <div className="bubble-ai shadow-[0_2px_8px_rgba(0,0,0,0.03)] border-[#e2e2dc] self-start py-3.5 px-4 min-w-[60px] flex items-center justify-center">
                <div className="dot dot1"></div><div className="dot dot2"></div><div className="dot dot3"></div>
             </div>
           </div>
         )}
         <div ref={endRef} />
      </div>

      {/* Footer Input */}
      <div className="px-5 py-3.5 border-t border-[#e2e2dc] shrink-0 bg-white">
         <div className="flex items-center gap-1.5 mb-2.5 text-[12px] text-[#8a8a84]">
            <div className={`w-2 h-2 rounded-full shadow-sm ${isThinking ? 'bg-[#f59e0b] shadow-[0_0_4px_#f59e0b] animate-[pulse-amber_1s_infinite]' : 'bg-[#22c55e] shadow-[0_0_4px_#22c55e]'}`}></div>
            <div className="font-medium">{isThinking ? 'Dodge AI is thinking...' : 'Dodge AI is awaiting instructions'}</div>
         </div>
         <div className="flex gap-2">
            <textarea 
              rows={1}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Analyze anything"
              className="flex-1 px-3.5 py-2.5 border border-[#e2e2dc] rounded-xl text-[14px] outline-none focus:border-[#1a1a1a] transition-colors resize-none overflow-hidden bg-[#fafafa]"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
            <button 
              onClick={() => handleSend()}
              disabled={isThinking || !query.trim()}
              className="bg-[#1a1a1a] text-white rounded-xl h-[42px] px-4 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center shrink-0"
            >
              <Send size={18} strokeWidth={2.5} className="mr-0.5 ml-[-1px] mb-[-1px]" />
            </button>
         </div>
      </div>
    </div>
  );
};

export default ChatPanel;
