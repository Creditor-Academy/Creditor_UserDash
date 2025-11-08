import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getSpecificScenario, getScenarioLatestScore } from '@/services/scenarioService';

const ChoiceBadge = ({ branch }) => {
  const color = branch === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800'
    : branch === 'FAILURE' ? 'bg-rose-100 text-rose-800'
    : 'bg-amber-100 text-amber-800';
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{branch || 'NEUTRAL'}</span>;
};

const FinalScanrioscore = ({ isOpen, onClose, scenarioId }) => {
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState(null);
  const [latestScore, setLatestScore] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!isOpen || !scenarioId) return;
      setLoading(true);
      try {
        const [spec, score] = await Promise.all([
          getSpecificScenario(scenarioId),
          getScenarioLatestScore(scenarioId)
        ]);
        if (!cancelled) {
          setScenario(spec);
          setLatestScore(typeof score === 'number' ? score : 0);
        }
      } catch (e) {
        if (!cancelled) {
          setScenario(null);
          setLatestScore(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [isOpen, scenarioId]);

  if (!isOpen) return null;

  const decisions = Array.isArray(scenario?.decisions)
    ? [...scenario.decisions].sort((a,b) => (a.decisionOrder||0) - (b.decisionOrder||0))
    : [];

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={() => onClose(false)} />
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[98vw] sm:w-[96vw] max-w-4xl max-h-[80vh] sm:max-h-[78vh] overflow-hidden flex flex-col">
          <div
            className="h-24 sm:h-28 w-full relative"
            style={{
              backgroundImage: `url(${scenario?.background_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
            <div className="absolute bottom-3 left-4 right-4">
              <div className="text-[11px] uppercase tracking-wide text-white/80">Scenario</div>
              <div className="text-white font-semibold text-base line-clamp-1">{scenario?.title || 'Scenario'}</div>
            </div>
          </div>
          <div className="p-4 sm:p-6 flex-1 min-h-0 flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-gray-700">Latest Score</div>
              <div className="text-3xl font-extrabold text-violet-700">{loading ? '…' : (latestScore ?? '—')}</div>
            </div>
            <div className="border-t pt-3 sm:pt-4 flex-1 min-h-0 flex flex-col">
              <div className="text-sm font-semibold text-gray-800 mb-3">Answer Key (Flow)</div>
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2">
                {/* Flowchart-style grid with SVG connectors */}
                {(() => {
                  const idToOrder = new Map();
                  decisions.forEach((d, i) => idToOrder.set(d.id, i + 1));
                  return decisions.map((d, idx) => {
                    const choices = d.choices || [];
                    return (
                      <div key={d.id} className="relative mb-6">
                        {/* Grid: left node, right choices column */}
                        <div className="grid grid-cols-[220px,1fr] gap-4 items-start">
                          {/* Decision node */}
                          <div className="relative">
                            <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
                              <div className="text-xs font-semibold text-violet-700 mb-1">Decision {idx + 1}</div>
                              <div className="text-sm text-gray-800">{d.description}</div>
                            </div>
                            {/* Vertical spine to next decision */}
                            {idx < decisions.length - 1 && (
                              <div className="absolute left-1/2 -translate-x-1/2 top-full h-6 w-px bg-violet-200" />
                            )}
                          </div>

                          {/* Choices list with connectors */}
                          <div className="relative">
                            <div className="space-y-3">
                              {choices.map((c, cidx) => {
                                const nextLabel = c.next_action === 'END'
                                  ? 'End'
                                  : (idToOrder.has(c.next_decision_id) ? `Decision ${idToOrder.get(c.next_decision_id)}` : 'Continue');
                                const arrowId = `arrow-${c.id}`;
                                const beginDelay = `${(idx * 0.15 + cidx * 0.1).toFixed(2)}s`;
                                return (
                                  <div key={c.id} className="relative pl-8">
                                    {/* elbow connector */}
                                    <svg className="absolute left-0 top-1/2 -translate-y-1/2" width="32" height="28" viewBox="0 0 32 28">
                                      <defs>
                                        <marker id={arrowId} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                                          <path d="M0,0 L0,6 L6,3 z" fill="#6b7280" />
                                        </marker>
                                      </defs>
                                      <path d="M0 14 H18 C24 14, 24 14, 30 14" stroke="#c7cad1" strokeWidth="2" fill="none" markerEnd={`url(#${arrowId})`} pathLength="1" strokeDasharray="1" strokeDashoffset="1">
                                        <animate attributeName="stroke-dashoffset" from="1" to="0" dur="0.9s" begin={beginDelay} fill="freeze" />
                                      </path>
                                    </svg>
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-start gap-2 bg-white rounded-md p-2 border border-gray-200 shadow-sm min-w-[220px]">
                                        <ChoiceBadge branch={c.branch_type} />
                                        <div className="flex-1">
                                          <div className="text-gray-800 text-sm">{c.text}</div>
                                          <div className="text-[11px] text-gray-500">Points: {c.points ?? 0}</div>
                                        </div>
                                      </div>
                                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${nextLabel==='End' ? 'bg-slate-900 text-white' : 'bg-violet-100 text-violet-800'}`}>{nextLabel}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
                {decisions.length === 0 && (
                  <div className="text-sm text-gray-600">No decisions available.</div>
                )}
              </div>
            </div>
            <div className="mt-4 sm:mt-5 flex justify-center">
              <Button onClick={() => onClose(false)} className="bg-violet-600 hover:bg-violet-700">Close</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalScanrioscore;


