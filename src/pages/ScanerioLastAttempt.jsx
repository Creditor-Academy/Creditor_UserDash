import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getScenarioLatestScore } from '@/services/scenarioService';

const ScanerioLastAttempt = ({ isOpen, onClose, scenario }) => {
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!isOpen || !scenario?.id) return;
      setLoading(true);
      try {
        const s = await getScenarioLatestScore(scenario.id);
        if (!cancelled) setScore(typeof s === 'number' ? s : 0);
      } catch (e) {
        if (!cancelled) setScore(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isOpen, scenario?.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={() => onClose(false)} />
      <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[92vw] max-w-md overflow-hidden">
          <div
            className="h-28 w-full relative"
            style={{
              backgroundImage: `url(${scenario?.background_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
            <div className="absolute bottom-2 left-3 right-3">
              <div className="text-[10px] uppercase tracking-wide text-white/80">Scenario</div>
              <div className="text-white font-semibold text-sm line-clamp-1">{scenario?.title || 'Scenario'}</div>
            </div>
          </div>
          <div className="p-5">
            <div className="text-center">
              <div className="text-gray-600 text-sm mb-1">Latest Attempt Score</div>
              <div className="text-4xl font-extrabold text-violet-700">{loading ? '…' : (score ?? '—')}</div>
            </div>
            <div className="mt-5 flex justify-center">
              <Button onClick={() => onClose(false)} className="bg-violet-600 hover:bg-violet-700">Close</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanerioLastAttempt;


