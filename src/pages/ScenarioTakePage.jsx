import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { startScenarioAttempt, submitScenarioResponse, getScenarioLatestScore } from "@/services/scenarioService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Award } from "lucide-react";

export default function ScenarioTakePage() {
  const { scenarioId } = useParams();
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get("module") || undefined;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [activeDecisionIndex, setActiveDecisionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // {text, points}
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [pendingNextDecisionId, setPendingNextDecisionId] = useState(null);
  const [pendingIsEnd, setPendingIsEnd] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [latestScore, setLatestScore] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await startScenarioAttempt(scenarioId);
        if (cancelled) return;
        setAttempt(data.attempt);
        setScenario(data.scenario);
        const sorted = Array.isArray(data.decisions)
          ? [...data.decisions].sort((a, b) => (a.decisionOrder || 0) - (b.decisionOrder || 0))
          : [];
        setDecisions(sorted);
      } catch (e) {
        if (cancelled) return;
        setError(e.message || "Failed to start scenario");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [scenarioId]);

  const idToDecision = useMemo(() => {
    const map = new Map();
    for (const d of decisions) map.set(d.id, d);
    return map;
  }, [decisions]);
  const activeDecision = useMemo(() => decisions[activeDecisionIndex], [decisions, activeDecisionIndex]);

  const handleChoice = async (choice) => {
    setSelectedChoiceId(choice.id);
    try {
      // Persist choice for this attempt
      if (attempt?.id) {
        const result = await submitScenarioResponse(attempt.id, choice.id);
        // Update score from server (authoritative)
        if (typeof result.score === 'number') {
          setScore(result.score);
        } else {
          setScore((s) => s + (choice.points || 0));
        }
        setFeedback({ text: choice.feedback, points: choice.points || 0 });
        const nextId = choice.next_decision_id || result?.nextDecisionId || null;
        setPendingNextDecisionId(nextId);
        const isEnd = (choice.next_action === 'END') || !!result?.isScenarioComplete;
        setPendingIsEnd(isEnd);
      } else {
        // Fallback if attempt id missing, still show feedback locally
        setScore((s) => s + (choice.points || 0));
        setFeedback({ text: choice.feedback, points: choice.points || 0 });
        setPendingNextDecisionId(choice.next_decision_id || null);
        setPendingIsEnd(choice.next_action === 'END');
      }
    } catch (e) {
      // On error, still show feedback, but do not change server score
      setFeedback({ text: choice.feedback, points: choice.points || 0 });
      setPendingNextDecisionId(choice.next_decision_id || null);
      setPendingIsEnd(choice.next_action === 'END');
    }
  };

  const proceedNext = () => {
    setFeedback(null);
    // If end flagged, finish scenario
    if (pendingIsEnd) {
      navigate(-1);
      return;
    }
    // Jump via next decision id when available
    if (pendingNextDecisionId && idToDecision.has(pendingNextDecisionId)) {
      const targetIndex = decisions.findIndex(d => d.id === pendingNextDecisionId);
      if (targetIndex !== -1) {
        setActiveDecisionIndex(targetIndex);
        setPendingNextDecisionId(null);
        setPendingIsEnd(false);
        return;
      }
    }
    // Fallback sequential
    const nextIndex = activeDecisionIndex + 1;
    if (nextIndex < decisions.length) {
      setActiveDecisionIndex(nextIndex);
      setPendingNextDecisionId(null);
      setPendingIsEnd(false);
      return;
    }
    navigate(-1);
  };

  const handleViewScore = async () => {
    // Close feedback modal when opening score modal
    setFeedback(null);
    try {
      const val = await getScenarioLatestScore(scenarioId);
      setLatestScore(typeof val === 'number' ? val : 0);
      setShowScoreModal(true);
    } catch (e) {
      setLatestScore(0);
      setShowScoreModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center space-y-6 max-w-md mx-auto px-6">
          {/* Animated loading spinner */}
          <div className="relative">
            <div className="w-16 h-16 mx-auto border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-transparent border-r-gray-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          
          {/* Loading text with subtle animation */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Preparing Your Scenario</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Setting up your interactive learning experience...
            </p>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/80">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="text-red-600 font-semibold mb-2">{error}</div>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        backgroundImage: `url(${scenario?.background_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50" />

      {/* Top bar */}
      <div className="relative z-10 px-6 md:px-10 pt-6 flex items-start justify-between">
        <div>
          <Button variant="outline" onClick={() => navigate(-1)} className="bg-white/80 backdrop-blur text-gray-800 border-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
        <div className="text-center mx-auto max-w-3xl">
          <h1 className="text-white text-2xl md:text-4xl font-extrabold drop-shadow-sm">{scenario?.title}</h1>
          <p className="text-white/90 text-sm md:text-base mt-2">{scenario?.description}</p>
        </div>
        <div className="">
          <div className="bg-white/90 backdrop-blur rounded-xl px-4 py-2 shadow-lg flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold">Score: {score}</span>
          </div>
        </div>
      </div>

  {/* Avatar + Decision Row */}
  <div className="absolute left-4 md:left-10 bottom-2 md:bottom-4 z-10 select-none flex items-center gap-4 md:gap-6">
    {/* Avatar */}
    <div>
      {scenario?.avatar_url && (
        <img
          src={scenario.avatar_url}
          alt="avatar"
          className="w-40 md:w-56 lg:w-64 h-auto object-contain drop-shadow-xl pointer-events-none"
        />
      )}
    </div>

    {/* Decision Card aligned to avatar center */}
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="bg-white/90 backdrop-blur rounded-2xl shadow-2xl p-4 md:p-6 max-w-xl"
    >
      <div className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-1">Make Your Choice</div>
      <div className="text-gray-900 font-semibold text-lg md:text-xl mb-3">
        {activeDecision?.description || "Make a decision"}
      </div>
      <div className="flex flex-col gap-2">
        {activeDecision?.choices?.map((choice) => (
          <Button
            key={choice.id}
            onClick={() => handleChoice(choice)}
            className={`justify-start h-auto py-3 px-4 rounded-xl text-left transition-transform duration-150 hover:scale-[1.02]
              ${selectedChoiceId === choice.id ? 'ring-2 ring-emerald-400 bg-emerald-50' : 'bg-gray-100 hover:bg-gray-200'}
            `}
            variant="ghost"
          >
            {choice.text}
          </Button>
        ))}
      </div>
    </motion.div>
  </div>

      {/* Feedback modal */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            className="fixed inset-0 z-20 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, x: -120 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
              className="relative z-30 bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-md text-center"
            >
              <div className="text-lg font-semibold text-gray-900 mb-2">Feedback</div>
              <div className="text-gray-700 mb-4">{feedback.text}</div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-full px-4 py-1 font-semibold shadow">
                <Award className="w-4 h-4" /> +{feedback.points} points
              </div>
              <div className="mt-6 flex items-center justify-center gap-3">
                {pendingIsEnd ? (
                  <>
                    <Button onClick={handleViewScore} className="bg-violet-600 hover:bg-violet-700">View score</Button>
                    <Button onClick={proceedNext} variant="outline">Close</Button>
                  </>
                ) : (
                  <Button onClick={proceedNext} className="bg-emerald-600 hover:bg-emerald-700">Continue</Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Latest Score Modal - bottom-right white card with animation */}
      <AnimatePresence>
        {showScoreModal && (
          <motion.div
            className="fixed inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowScoreModal(false)} />
            <motion.div
              className="absolute bottom-4 right-4 md:bottom-8 md:right-8"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 16, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            >
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
                    <div className="text-gray-600 text-sm mb-1">Here is your score</div>
                    <div className="text-4xl font-extrabold text-violet-700">{latestScore ?? '—'}</div>
                  </div>
                  <div className="mt-5 flex justify-center">
                    <Button onClick={() => { setShowScoreModal(false); navigate(-1); }} className="bg-violet-600 hover:bg-violet-700">Close</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



