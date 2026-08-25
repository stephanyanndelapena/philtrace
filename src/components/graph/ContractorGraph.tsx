'use client';

import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { AlertOctagon, Building2, Phone, MapPin, DollarSign, ShieldAlert } from 'lucide-react';

interface SelectedContractor {
  id: string;
  name: string;
  address: string;
  phone: string;
  totalEarnings: number;
  isShellFlag: boolean;
  projectsCount: number;
}

export const ContractorGraph: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<SelectedContractor | null>(null);
  const [loading, setLoading] = useState(true);

  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/contractors/graph')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        setLoading(false);
        if (!containerRef.current || !data.elements) return;

        // Safely destroy existing instance before creating a new one
        if (cyRef.current) {
          cyRef.current.destroy();
          cyRef.current = null;
        }

        const cy = cytoscape({
          container: containerRef.current,
          elements: data.elements,
          style: [
            {
              selector: 'node',
              style: {
                label: 'data(label)',
                color: '#ffffff',
                'font-size': '10px',
                'font-weight': 'bold',
                'text-valign': 'bottom',
                'text-margin-y': 6,
                'text-wrap': 'wrap',
                'text-max-width': '95px',
                'line-height': 1.2,
                'background-color': '#10b981',
                width: 32,
                height: 32,
                'border-width': 3,
                'border-color': '#059669',
                'text-background-color': '#020617',
                'text-background-opacity': 0.75,
                'text-background-padding': '3px',
                'text-background-shape': 'roundrectangle',
              },
            },
            {
              selector: 'node[?isShellFlag]',
              style: {
                'background-color': '#f43f5e',
                'border-color': '#be123c',
                'border-width': 4,
                width: 40,
                height: 40,
              },
            },
            {
              selector: 'edge',
              style: {
                width: 2.5,
                'line-color': '#ef4444',
                'curve-style': 'bezier',
                label: 'data(label)',
                color: '#fca5a5',
                'font-size': '9px',
                'font-weight': 'bold',
                'text-rotation': 'autorotate',
                'text-background-color': '#0f172a',
                'text-background-opacity': 0.95,
                'text-background-padding': '3px',
                'text-background-shape': 'roundrectangle',
              },
            },
          ],
          layout: {
            name: 'cose',
            animate: false,
            padding: 60,
            nodeRepulsion: () => 800000,
            idealEdgeLength: () => 140,
            edgeElasticity: () => 100,
            gravity: 40,
            componentSpacing: 130,
            nodeOverlap: 30,
          },
        });

        cyRef.current = cy;
        cy.fit(undefined, 50);

        cy.on('tap', 'node', (evt) => {
          if (!isMounted) return;
          const node = evt.target;
          const nodeData = node.data();
          setSelectedNode({
            id: nodeData.id,
            name: nodeData.label,
            address: nodeData.address,
            phone: nodeData.phone,
            totalEarnings: nodeData.totalEarnings,
            isShellFlag: nodeData.isShellFlag,
            projectsCount: nodeData.projectsCount,
          });
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load contractor graph data:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
            Contractor Collusion X-Ray Analysis
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Shell Company & Address Clustering Graph
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Red highlighted nodes share identical registered business addresses or telephone numbers with other contractors.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-300"></div>
            <span className="text-slate-300">Independent Contractor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-rose-500 border-2 border-rose-300 shadow-lg shadow-rose-500/50"></div>
            <span className="text-rose-400 font-bold">Collusion / Shell Flag</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cytoscape Canvas */}
        <div className="lg:col-span-8 relative bg-slate-950/80 rounded-xl border border-slate-800/80 min-h-[420px] overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-semibold">
              Loading Cytoscape Collusion Network...
            </div>
          )}
          <div ref={containerRef} className="w-full h-[420px]" />
        </div>

        {/* Selected Contractor Detail Inspector */}
        <div className="lg:col-span-4 bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          {selectedNode ? (
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="text-xs font-bold text-slate-400 uppercase">Selected Entity</div>
                {selectedNode.isShellFlag && (
                  <span className="bg-rose-500/10 text-rose-400 border border-rose-500/40 text-[10px] font-bold px-2 py-0.5 rounded">
                    SHELL FLAG
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-white mb-4">
                {selectedNode.name}
              </h3>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 mb-1 font-semibold">
                    Registered Business Address
                  </div>
                  <div className="text-slate-200 font-mono text-[11px] leading-relaxed">
                    {selectedNode.address}
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 mb-1 font-semibold">
                    Contact Telephone Number
                  </div>
                  <div className="text-slate-200 font-mono text-[11px]">
                    {selectedNode.phone}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <div className="text-slate-400 mb-1 font-semibold">
                      Total Earnings
                    </div>
                    <div className="text-emerald-400 font-bold text-sm">
                      ₱{(selectedNode.totalEarnings / 1000000).toFixed(0)}M
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <div className="text-slate-400 mb-1 font-semibold">Awarded Projects</div>
                    <div className="text-white font-bold text-sm">{selectedNode.projectsCount} Projects</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center text-slate-500">
              <Building2 className="w-10 h-10 mb-3 text-slate-700" />
              <p className="text-xs">Click any contractor node on the graph to inspect registered entity details and collusion risk.</p>
            </div>
          )}

          <div className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-800/60 font-mono">
            * Collusion indicators computed automatically via database registry cross-referencing.
          </div>
        </div>
      </div>
    </div>
  );
};
