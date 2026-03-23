import React, { useState, useEffect, useRef } from 'react';
import GraphPanel from './components/GraphPanel';
import ChatPanel from './components/ChatPanel';
import { Menu } from 'lucide-react';

function App() {
  const [cyInstance, setCyInstance] = useState(null);
  const [stats, setStats] = useState({ orders: 0, entities: 8 });
  const [showLoading, setShowLoading] = useState(true);
  const [chatWidth, setChatWidth] = useState(380); // Default width
  const [isResizing, setIsResizing] = useState(false);
  const chatSendRef = useRef(null);

  // Backend API URL (Local)
  const API_BASE = '/api';

  useEffect(() => {
     fetch(API_BASE + '/stats')
       .then(r => r.json())
       .then(data => {
          setStats({
            orders: data.orders || 0,
            entities: 8
          })
       }).catch(() => {});
       
     const timer = setTimeout(() => setShowLoading(false), 2700);
     return () => clearTimeout(timer);
  }, []);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 300 && newWidth < 800) {
        setChatWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white text-[#1a1a1a] font-sans">
      
      {/* Loading Overlay */}
      {showLoading && (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center animate-[fadeOut_0.3s_ease_2.5s_forwards]">
          <h1 className="m-0 text-2xl font-semibold">Dodge AI</h1>
          <p className="mt-2 text-[#8a8a84] text-sm mb-6">Loading Order to Cash Graph Simulator...</p>
          <div className="w-[240px] h-1 bg-[#e2e2dc] rounded-full overflow-hidden">
             <div className="h-full bg-[#1a1a1a] animate-[fillBar_2.5s_ease-out_forwards]"></div>
          </div>
        </div>
      )}

      {/* TOP NAV */}
      <nav className="h-12 border-b border-[#e2e2dc] flex justify-between items-center px-5 shrink-0 bg-white z-20">
        <div className="flex items-center gap-4">
          <Menu size={20} className="text-[#555] cursor-pointer hover:text-black transition-colors" />
          <div className="text-[14px] text-[#8a8a84] tracking-tight">
            Mapping / <span className="font-semibold text-[#1a1a1a]">Order to Cash</span>
          </div>
        </div>
        <div className="flex gap-5 text-[13px] text-[#8a8a84]">
           <div>Rows: <span className="font-semibold text-[#1a1a1a]">{stats.orders.toLocaleString()}</span></div>
           <div>Entities: <span className="font-semibold text-[#1a1a1a]">{stats.entities}</span></div>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <div className={`flex flex-1 overflow-hidden ${isResizing ? 'cursor-col-resize select-none' : ''}`}>
        <GraphPanel setCyInstance={setCyInstance} onExplainNode={(q) => { if(chatSendRef.current) chatSendRef.current(q); }} />
        
        {/* Resize Handle */}
        <div 
          onMouseDown={handleMouseDown}
          className={`w-[4px] h-full cursor-col-resize transition-colors z-30 flex items-center justify-center
            ${isResizing ? 'bg-[#3b82f6]' : 'bg-[#e2e2dc] hover:bg-[#3b82f6]'}`}
        >
          <div className="w-[1px] h-8 bg-white/30 rounded-full"></div>
        </div>

        <ChatPanel cyInstance={cyInstance} sendRef={chatSendRef} width={chatWidth} />
      </div>

    </div>
  );
}

export default App;
