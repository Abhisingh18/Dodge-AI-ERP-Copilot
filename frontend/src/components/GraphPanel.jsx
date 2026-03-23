import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { X, Maximize2, Layers } from 'lucide-react';

const demoData = {
  nodes: [
    { data: { id: '740506', label: '740506', type: 'SalesOrder', amount: '17108.25', currency: 'INR', status: 'C' }},
    { data: { id: '740507', label: '740507', type: 'SalesOrder', amount: '19021.27', currency: 'INR', status: 'C' }},
    { data: { id: '80737721', label: '80737721', type: 'Delivery', status: 'Completed' }},
    { data: { id: '80737722', label: '80737722', type: 'Delivery', status: 'Completed' }},
    { data: { id: '91150187', label: '91150187', type: 'BillingDoc', netValue: '17108.25' }},
    { data: { id: '91150188', label: '91150188', type: 'BillingDoc', netValue: '19021.27' }},
    { data: { id: '9400635958', label: '9400635958', type: 'JournalEntry', gl_account: '15500020' }},
    { data: { id: '310000108', label: 'Cardenas Parker', type: 'Customer', region: 'Millerborough' }},
    { data: { id: 'P1', label: 'TXN-9A82B', type: 'Payment', amount: '17108.25', status: 'Cleared' }}
  ],
  edges: [
    { data: { source: '740506', target: '80737721' } },
    { data: { source: '740507', target: '80737722' } },
    { data: { source: '80737721', target: '91150187' } },
    { data: { source: '80737722', target: '91150188' } },
    { data: { source: '91150187', target: '9400635958' } },
    { data: { source: '9400635958', target: 'P1' } },
    { data: { source: '310000108', target: '740506' } },
    { data: { source: '310000108', target: '740507' } }
  ]
};

// Backend API URL (Dynamic for Vercel/Render)
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const GraphPanel = ({ setCyInstance, onExplainNode }) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [counts, setCounts] = useState({ nodes: 0, edges: 0 });
  const [popup, setPopup] = useState(null);
  const [filter, setFilter] = useState('All');
  const [labelsVisible, setLabelsVisible] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    fetch(API_BASE + '/graph')
      .then(res => res.json())
      .then(data => {
        let nodeIds = new Set(data.nodes.map(n => String(n.data.id)));
        let validEdges = data.edges.filter(e => nodeIds.has(String(e.data.source)) && nodeIds.has(String(e.data.target)));
        let elements = [...data.nodes, ...validEdges];
        elements.forEach(el => {
          if (el.data.source) return;
          const t = el.data.type;
          if (t === 'SalesOrder') el.classes = 'hub';
          else if (t === 'Customer') el.classes = 'customer';
          else if (t === 'Delivery') el.classes = 'connected';
          else if (t === 'BillingDoc') el.classes = 'leaf billing';
          else if (t === 'JournalEntry') el.classes = 'leaf journal';
          else if (t === 'Payment') el.classes = 'leaf payment';
          else if (t === 'SOItem') el.classes = 'soitem';
          else if (t === 'Product') el.classes = 'product';
        });

        const cy = cytoscape({
          container: containerRef.current,
          elements: elements,
          style: [
            { selector: 'node', style: { 'label': 'data(label)', 'font-size': 11, 'text-valign': 'bottom', 'text-margin-y': 6, 'color': '#555', 'font-family': 'sans-serif' } },
            { selector: '.hub', style: { width: 22, height: 22, 'background-color': '#3b82f6' } },
            { selector: '.customer', style: { width: 18, height: 18, 'background-color': '#22c55e' } },
            { selector: '.connected', style: { width: 14, height: 14, 'background-color': '#93c5e8' } },
            { selector: '.leaf.billing', style: { width: 9, height: 9, 'background-color': '#f87171' } },
            { selector: '.leaf.journal', style: { width: 9, height: 9, 'background-color': '#8b5cf6' } },
            { selector: '.leaf.payment', style: { width: 8, height: 8, 'background-color': '#f59e0b' } },
            { selector: '.soitem', style: { width: 10, height: 10, 'background-color': '#64748b' } },
            { selector: '.product', style: { width: 12, height: 12, 'background-color': '#ec4899', 'shape': 'square' } },
            { selector: 'edge', style: { width: 1.5, 'line-color': 'rgba(147,197,232,0.4)', 'curve-style': 'bezier', 'target-arrow-color': 'rgba(147,197,232,0.4)', 'target-arrow-shape': 'triangle', 'arrow-scale': 0.8 } },
            { selector: '.highlighted', style: { 'border-width': 3, 'border-color': '#1a1a1a', 'background-color': '#f59e0b', width: 30, height: 30, 'z-index': 100 } },
            { selector: '.dimmed', style: { 'opacity': 0.15 } },
            { selector: '.hide-label', style: { 'text-opacity': 0 } }
          ],
          layout: { name: 'cose', nodeRepulsion: 14000, idealEdgeLength: 120, animate: true, animationDuration: 1500 }
        });

        cyRef.current = cy;
        setCyInstance(cy);
        setCounts({ nodes: cy.nodes().length, edges: cy.edges().length });

        cy.on('tap', 'node', async (evt) => {
          const node = evt.target;
          const pos = evt.renderedPosition;
          
          cy.elements().addClass('dimmed').removeClass('highlighted');
          node.removeClass('dimmed').addClass('highlighted');
          node.connectedEdges().removeClass('dimmed').addClass('highlighted');
          node.connectedEdges().connectedNodes().removeClass('dimmed').addClass('highlighted');
          
          let x = pos.x + 20;
          let y = pos.y - 40;
          if (x + 270 > cy.width()) x = pos.x - 290;
          
          // Fetch real data from /node-details API
          let liveData = node.data();
          try {
            const resp = await fetch(`${API_BASE}/node-details/${node.data('id')}`);
            const json = await resp.json();
            if (json.data) liveData = { ...node.data(), ...json.data, _detailType: json.type };
          } catch(e) { console.warn('Node details fetch failed:', e); }
          
          setPopup({ node, data: liveData, conns: node.connectedEdges().length, x, y });
        });

        cy.on('tap', (evt) => {
          if (evt.target === cy) {
            cy.elements().removeClass('dimmed').removeClass('highlighted');
            setPopup(null);
          }
        });

        cy.on('zoom pan', () => setPopup(null));
      })
      .catch(err => console.error("Could not fetch graph:", err));

    return () => {
       if (cyRef.current) cyRef.current.destroy();
    }
  }, [setCyInstance]);


  const handleFilter = (type) => {
    setFilter(type);
    cyRef.current.elements().removeClass('dimmed').removeClass('highlighted');
    if (type !== 'All') {
      cyRef.current.nodes().forEach(n => {
        if (n.data('type') !== type) n.addClass('dimmed');
      });
    }
  };

  const toggleLabels = () => {
    const next = !labelsVisible;
    setLabelsVisible(next);
    if (next) cyRef.current.nodes().removeClass('hide-label');
    else cyRef.current.nodes().addClass('hide-label');
  };

  const getBadgeColor = (type) => {
    switch(type) {
      case 'SalesOrder': return '#3b82f6';
      case 'Delivery': return '#22c55e';
      case 'BillingDoc': return '#f59e0b';
      case 'JournalEntry': return '#8b5cf6';
      case 'Payment': return '#f87171';
      case 'Customer': return '#22c55e';
      default: return '#1a1a1a';
    }
  };

  const exploreNeighbors = () => {
    if (!popup || !cyRef.current) return;
    const n = cyRef.current.getElementById(popup.data.id);
    const neighbors = n.connectedEdges().connectedNodes();
    neighbors.addClass('highlighted');
    n.removeClass('dimmed').addClass('highlighted');
    cyRef.current.animate({ fit: { eles: neighbors.union(n), padding: 50 } }, { duration: 800 });
  };

  return (
    <div className="flex-1 relative bg-[#f5f5f0] overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />

      {/* Controls */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        <button className="bg-white border border-[#e2e2dc] px-3 py-1.5 rounded-lg text-xs font-medium text-[#1a1a1a] shadow-sm hover:bg-gray-50 flex items-center gap-1" onClick={() => cyRef.current?.fit()}>
           <Maximize2 size={14} /> Minimize
        </button>
        <button className="bg-[#1a1a1a] border border-[#1a1a1a] px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-sm hover:opacity-90 flex items-center gap-1" onClick={toggleLabels}>
           <Layers size={14} /> {labelsVisible ? 'Hide Granular Overlay' : 'Show Granular Overlay'}
        </button>
      </div>

      {/* Filters */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 bg-white p-1 border border-[#e2e2dc] rounded-full shadow-sm z-10">
        {['All', 'SalesOrder', 'Delivery', 'BillingDoc', 'JournalEntry', 'Payment'].map(t => (
          <button 
            key={t}
            onClick={() => handleFilter(t)}
            className={`px-3.5 py-1.5 text-[13px] font-medium rounded-full transition-colors ${filter === t ? 'bg-[#1a1a1a] text-white' : 'text-[#8a8a84] hover:text-[#1a1a1a]'}`}
          >
            {t === 'SalesOrder' ? 'Orders' : t.replace('Doc', '').replace('Entry', '')}
          </button>
        ))}
      </div>

      {/* Popup */}
      {popup && (
        <div className="absolute bg-white rounded-[14px] p-4 min-w-[270px] border border-[#e2e2dc] shadow-[0_12px_40px_rgba(0,0,0,0.1)] z-20 animate-[popIn_0.15s_ease-out]" style={{ left: popup.x, top: popup.y }}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="inline-block px-2 py-0.5 rounded-xl text-[10px] font-semibold text-white mb-1.5" style={{ backgroundColor: getBadgeColor(popup.data.type) }}>
                {popup.data.type}
              </div>
              <div className="text-[15px] font-bold text-[#1a1a1a] mb-1">{popup.data.id}</div>
            </div>
            <X size={16} className="text-[#8a8a84] cursor-pointer hover:text-black" onClick={() => setPopup(null)} />
          </div>
          
          <div className="flex flex-col gap-1.5 mb-3 pb-3 border-b border-[#e2e2dc] text-[12px]">
            {Object.entries(popup.data).filter(([k]) => !['id','type','label'].includes(k)).slice(0, 8).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-[#8a8a84] font-medium">{k}</span>
                <span className="font-medium text-right max-w-[140px] truncate">{v}</span>
              </div>
            ))}
          </div>
          
          <div className="text-[10px] color-[#8a8a84] mb-3 italic">Additional fields hidden for readability</div>
                      <div className="flex justify-between items-center gap-2">
               <div className="font-medium text-[#8a8a84] text-xs">Connections: {popup.conns}</div>
               <div className="flex gap-1.5">
                 <button className="bg-[#8b5cf6] text-white px-2.5 py-1.5 rounded-lg text-xs font-medium hover:opacity-90" onClick={() => { if(onExplainNode) onExplainNode(`explain ${popup.data.id}`); setPopup(null); }}>Explain</button>
                 <button className="bg-[#1a1a1a] text-white px-2.5 py-1.5 rounded-lg text-xs font-medium hover:opacity-90" onClick={exploreNeighbors}>Explore</button>
               </div>
             </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-5 left-5 bg-white rounded-xl p-3 border border-[#e2e2dc] shadow-sm z-10 text-xs grid gap-2">
         <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></div>Sales Order</div>
         <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#93c5e8]"></div>Delivery</div>
         <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#f87171]"></div>Billing Doc</div>
         <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></div>Journal Entry</div>
         <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></div>Payment</div>
         <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></div>Customer</div>
         <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#64748b]"></div>SO Item</div>
         <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-[#ec4899]"></div>Product/Material</div>
      </div>

      {/* Counts */}
      <div className="absolute bottom-16 left-5 bg-white rounded-lg px-2.5 py-1.5 border border-[#e2e2dc] shadow-sm z-10 font-medium text-[#8a8a84] text-xs">
         {counts.nodes} nodes &middot; {counts.edges} edges
      </div>
    </div>
  );
};

export default GraphPanel;
