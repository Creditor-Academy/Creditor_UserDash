import React, { useMemo, useState } from 'react';
import { Plus, Trash2, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SectionCard = ({ title, description, children }) => (
  <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 space-y-3">
    <div className="space-y-1">
      <p className="text-xs font-semibold text-slate-800">{title}</p>
      {description && (
        <p className="text-[11px] text-slate-600/90">{description}</p>
      )}
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const PillGroup = ({ options, value, onChange, color }) => (
  <div className="flex flex-wrap gap-1">
    {options.map(option => (
      <button
        key={option.id}
        type="button"
        onClick={() => onChange(option.id)}
        className={`px-2 py-1 rounded-full border text-[11px] transition-all ${
          value === option.id
            ? `${color || 'bg-indigo-700 text-white border-indigo-700'} shadow-sm`
            : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const CheckboxPills = ({ options, values = [], onChange, color }) => {
  const handleToggle = id => {
    const exists = values.includes(id);
    const next = exists ? values.filter(v => v !== id) : [...values, id];
    onChange(next);
  };

  return (
    <div className="flex flex-wrap gap-1">
      {options.map(option => {
        const active = values.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => handleToggle(option.id)}
            className={`px-2 py-1 rounded-full border text-[11px] transition-all ${
              active
                ? `${color || 'bg-emerald-700 text-white border-emerald-700'} shadow-sm`
                : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

const TextAreaField = ({ label, value, onChange, placeholder, rows = 2 }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-700 mb-1">
      {label}
    </label>
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
      placeholder={placeholder}
    />
  </div>
);

const ToggleYesNo = ({ value, onChange }) => (
  <div className="flex gap-2">
    <Button
      type="button"
      size="sm"
      variant={value ? 'default' : 'outline'}
      className={`h-8 px-3 text-[11px] ${
        value ? 'bg-emerald-600 hover:bg-emerald-700' : ''
      }`}
      onClick={() => onChange(true)}
    >
      Yes
    </Button>
    <Button
      type="button"
      size="sm"
      variant={!value ? 'default' : 'outline'}
      className={`h-8 px-3 text-[11px] ${
        !value ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : ''
      }`}
      onClick={() => onChange(false)}
    >
      No
    </Button>
  </div>
);

const AnalysisPhaseCard = ({ courseData, updateDesignPhase }) => {
  const analysis = courseData.designPhases?.analysis || {};
  const [newModule, setNewModule] = useState({
    name: '',
    purpose: '',
    lessons: '',
  });

  const handleModuleAdd = () => {
    if (!newModule.name.trim()) return;
    const moduleList = [...(analysis.moduleList || []), newModule];
    updateDesignPhase('analysis', { moduleList });
    setNewModule({ name: '', purpose: '', lessons: '' });
  };

  const handleModuleRemove = idx => {
    const moduleList = (analysis.moduleList || []).filter((_, i) => i !== idx);
    updateDesignPhase('analysis', { moduleList });
  };

  const flowOptions = [
    { id: 'linear', label: 'Linear (step-by-step)' },
    { id: 'modular', label: 'Modular / choose-your-path' },
  ];

  const experienceOptions = [
    { id: 'video', label: '🎥 Video-based' },
    { id: 'reader', label: '📖 Immersive reader' },
    { id: 'audio', label: '🎧 Podcast / audio' },
    { id: 'combo', label: '🧩 Text + Image + Interactive' },
    { id: 'scorm', label: '💡 SCORM interactive' },
    { id: 'game', label: '🕹️ Game-based' },
  ];

  const goalOptions = [
    { id: 'awareness', label: 'Awareness / understanding' },
    { id: 'skill', label: 'Skill / procedure' },
    { id: 'behavior', label: 'Behavior change' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'certification', label: 'Certification' },
    { id: 'performance', label: 'Performance KPI' },
  ];

  const businessOutcomeOptions = [
    { id: 'completion', label: 'Completion' },
    { id: 'quiz', label: 'Quiz / test scores' },
    { id: 'on_job', label: 'On-the-job performance' },
    { id: 'projects', label: 'Projects / assignments' },
    { id: 'cert', label: 'Certification / exam' },
  ];

  const constraintOptions = [
    { id: 'micro', label: 'Micro time (10–15m)' },
    { id: 'standard', label: 'Standard (20–30m)' },
    { id: 'deep', label: 'Deep dives (40–60m)' },
    { id: 'low_bandwidth', label: 'Low bandwidth' },
    { id: 'mobile_first', label: 'Mobile-first' },
    { id: 'shared_devices', label: 'Shared devices' },
  ];

  const complianceOptions = [
    { id: 'scorm', label: 'SCORM' },
    { id: 'iso', label: 'ISO/industry' },
    { id: 'internal_ld', label: 'Internal L&D model' },
    { id: 'accessibility', label: 'Accessibility' },
  ];

  const prereqOptions = [
    { id: 'none', label: 'No prerequisites' },
    { id: 'basics', label: 'Basic familiarity' },
    { id: 'intermediate', label: 'Intermediate skill' },
    { id: 'advanced', label: 'Advanced/role-based' },
  ];

  const lengthOptions = [
    { id: 'under1', label: '< 1 hour' },
    { id: '1to3', label: '1–3 hours' },
    { id: '3to6', label: '3–6 hours' },
    { id: '6plus', label: '6+ hours' },
  ];

  const successOptions = [
    { id: 'scores', label: 'Scores/assessments' },
    { id: 'behavior', label: 'Behavior change' },
    { id: 'projects', label: 'Project output' },
    { id: 'cert', label: 'Certification' },
    { id: 'kpi', label: 'Business KPI' },
  ];

  return (
    <div className="space-y-4">
      <SectionCard
        title="Purpose & Audience"
        description="Capture the core of the course: goal, learner, gap, business outcome, constraints, compliance."
      >
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            Main goal of the course
          </p>
          <PillGroup
            options={goalOptions}
            value={analysis.mainGoal || 'skill'}
            onChange={v => updateDesignPhase('analysis', { mainGoal: v })}
            color="bg-indigo-700 text-white border-indigo-700"
          />
        </div>
        <TextAreaField
          label="Target learner (role, background, motivation, challenges)"
          value={analysis.targetLearner || ''}
          onChange={v => updateDesignPhase('analysis', { targetLearner: v })}
          placeholder="e.g., Frontline supervisors, 2-4 years experience, remote teams..."
        />
        <TextAreaField
          label="Problem or gap this course solves"
          value={analysis.problemToSolve || ''}
          onChange={v => updateDesignPhase('analysis', { problemToSolve: v })}
          placeholder="What pain, gap, or challenge are we addressing?"
        />
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            Business / performance outcome
          </p>
          <PillGroup
            options={businessOutcomeOptions}
            value={analysis.businessOutcome || 'completion'}
            onChange={v =>
              updateDesignPhase('analysis', { businessOutcome: v })
            }
            color="bg-purple-700 text-white border-purple-700"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            Learning constraints
          </p>
          <CheckboxPills
            options={constraintOptions}
            values={analysis.learningConstraints || []}
            onChange={vals =>
              updateDesignPhase('analysis', { learningConstraints: vals })
            }
            color="bg-sky-700 text-white border-sky-700"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            Compliance / standards
          </p>
          <CheckboxPills
            options={complianceOptions}
            values={analysis.complianceNeeds || []}
            onChange={vals =>
              updateDesignPhase('analysis', { complianceNeeds: vals })
            }
            color="bg-emerald-700 text-white border-emerald-700"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            Prerequisites / prior knowledge
          </p>
          <PillGroup
            options={prereqOptions}
            value={analysis.prerequisites || 'none'}
            onChange={v => updateDesignPhase('analysis', { prerequisites: v })}
            color="bg-amber-700 text-white border-amber-700"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">Course length</p>
          <PillGroup
            options={lengthOptions}
            value={analysis.courseLength || '1to3'}
            onChange={v => updateDesignPhase('analysis', { courseLength: v })}
            color="bg-slate-800 text-white border-slate-800"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            How success will be measured
          </p>
          <CheckboxPills
            options={successOptions}
            values={analysis.successMeasures || []}
            onChange={vals =>
              updateDesignPhase('analysis', { successMeasures: vals })
            }
            color="bg-rose-700 text-white border-rose-700"
          />
        </div>
        <TextAreaField
          label="Must-use content sources (docs, videos, SOPs, manuals)"
          value={analysis.requiredResources || ''}
          onChange={v =>
            updateDesignPhase('analysis', { requiredResources: v })
          }
          placeholder="List the assets AI must reference."
        />
      </SectionCard>

      <SectionCard
        title="Structure & Flow"
        description="Shape the macro-structure and flow style."
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Course title
            </label>
            <input
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
              value={analysis.courseTitle || ''}
              onChange={e =>
                updateDesignPhase('analysis', { courseTitle: e.target.value })
              }
              placeholder="Title and main goal in one line"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Final performance outcome
            </label>
            <input
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
              value={analysis.finalPerformance || ''}
              onChange={e =>
                updateDesignPhase('analysis', {
                  finalPerformance: e.target.value,
                })
              }
              placeholder="What should learners do or demonstrate?"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Modules
            </label>
            <input
              type="number"
              min="1"
              max="20"
              className="w-full px-2 py-2 border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
              value={courseData.moduleCount || ''}
              onChange={e =>
                courseData.moduleCount !== undefined &&
                updateDesignPhase('analysis', {
                  moduleCount: parseInt(e.target.value || '1', 10),
                })
              }
              placeholder="e.g., 4"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Lessons per module
            </label>
            <input
              type="number"
              min="1"
              max="20"
              className="w-full px-2 py-2 border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
              value={courseData.lessonsPerModule || ''}
              onChange={e =>
                courseData.lessonsPerModule !== undefined &&
                updateDesignPhase('analysis', {
                  lessonsPerModule: parseInt(e.target.value || '1', 10),
                })
              }
              placeholder="e.g., 3"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Flow
            </label>
            <PillGroup
              options={flowOptions}
              value={analysis.flowPreference || 'linear'}
              onChange={v =>
                updateDesignPhase('analysis', { flowPreference: v })
              }
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Module structure and experiences"
        description="List modules, lessons per module, and preferred learning experience."
      >
        <div className="space-y-2">
          {(analysis.moduleList || []).map((mod, idx) => (
            <div
              key={`${mod.name}-${idx}`}
              className="p-3 rounded-lg border border-gray-200 bg-white flex flex-col gap-2"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="text-sm font-semibold text-gray-800">
                  {mod.name || `Module ${idx + 1}`}
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-gray-500"
                  onClick={() => handleModuleRemove(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-600">{mod.purpose}</p>
              <div className="text-[11px] text-gray-500">
                Lessons: {mod.lessons || '—'} · Experience:{' '}
                {mod.experienceType || '—'}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Module name
            </label>
            <input
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
              value={newModule.name}
              onChange={e =>
                setNewModule(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Foundations"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Lessons or topics
            </label>
            <input
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
              value={newModule.lessons}
              onChange={e =>
                setNewModule(prev => ({ ...prev, lessons: e.target.value }))
              }
              placeholder="e.g., 3 lessons"
            />
          </div>
        </div>
        <TextAreaField
          label="Purpose / key takeaway"
          value={newModule.purpose}
          onChange={v => setNewModule(prev => ({ ...prev, purpose: v }))}
          placeholder="What should this module achieve?"
        />
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            Primary learning experience
          </p>
          <PillGroup
            options={experienceOptions}
            value={newModule.experienceType || 'video'}
            onChange={v =>
              setNewModule(prev => ({ ...prev, experienceType: v }))
            }
            color="bg-purple-700 text-white border-purple-700"
          />
        </div>
        <Button
          type="button"
          onClick={handleModuleAdd}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add module
        </Button>
      </SectionCard>
    </div>
  );
};

const ObjectivesPhaseCard = ({ courseData, updateDesignPhase }) => {
  const objectives = courseData.designPhases?.objectives || {};

  const setList = (key, text) => {
    const list = text
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    updateDesignPhase('objectives', { [key]: list });
  };

  const joinList = list => (list || []).join('\n');

  const bloomOptions = [
    'remember',
    'understand',
    'apply',
    'analyze',
    'evaluate',
    'create',
  ].map(id => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) }));

  return (
    <div className="space-y-4">
      <SectionCard
        title="Learning objectives"
        description="Core vs optional objectives and evidence of success."
      >
        <TextAreaField
          label="Core objectives (one per line)"
          value={joinList(objectives.overallObjectives)}
          onChange={v => setList('overallObjectives', v)}
          placeholder="Apply concept X...\nDesign Y..."
          rows={3}
        />
        <TextAreaField
          label="Optional / advanced objectives (one per line)"
          value={joinList(objectives.optionalObjectives)}
          onChange={v => setList('optionalObjectives', v)}
          placeholder="Advanced objectives..."
          rows={3}
        />
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            Evidence of success
          </p>
          <CheckboxPills
            options={[
              { id: 'quiz', label: 'Quiz' },
              { id: 'simulation', label: 'Simulation' },
              { id: 'project', label: 'Project' },
              { id: 'discussion', label: 'Discussion' },
              { id: 'reflection', label: 'Reflection' },
            ]}
            values={objectives.evidencePlan || []}
            onChange={vals =>
              updateDesignPhase('objectives', { evidencePlan: vals })
            }
            color="bg-indigo-700 text-white border-indigo-700"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            Highest Bloom level
          </p>
          <PillGroup
            options={bloomOptions}
            value={objectives.bloomTargets?.course || 'apply'}
            onChange={v =>
              updateDesignPhase('objectives', {
                bloomTargets: { ...(objectives.bloomTargets || {}), course: v },
              })
            }
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            Auto-generate measurable objectives per lesson?
          </p>
          <ToggleYesNo
            value={objectives.autoGenerateLessonObjectives !== false}
            onChange={v =>
              updateDesignPhase('objectives', {
                autoGenerateLessonObjectives: v,
              })
            }
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Bloom by module"
        description="Capture what each module should target (Remember → Create)."
      >
        <TextAreaField
          label="Per-module targets (Remember/Understand/Apply/Analyze/Create)"
          value={objectives.bloomByModuleNotes || ''}
          onChange={v =>
            updateDesignPhase('objectives', { bloomByModuleNotes: v })
          }
          placeholder="Module 1: Remember + Understand (facts)\nModule 2: Apply (scenarios)\nModule 3: Analyze/Create (project)"
          rows={4}
        />
      </SectionCard>
    </div>
  );
};

const InstructionDesignPhaseCard = ({ courseData, updateDesignPhase }) => {
  const design = courseData.designPhases?.design || {};
  const fields = [
    ['attentionStrategy', 'Gain attention (hook/story/problem)'],
    ['objectivesAnnouncement', 'Inform objectives and expectations'],
    ['priorKnowledgeActivation', 'Stimulate recall'],
    [
      'contentPresentation',
      'Present content (video, infographic, demo, reading)',
    ],
    ['guidancePlan', 'Provide guidance (tips, visuals, examples, aids)'],
    ['practicePlan', 'Elicit performance (exercises, sims, role-plays)'],
    ['feedbackPlan', 'Provide feedback (auto, coaching, peer, reflection)'],
    ['assessmentPlan', 'Assess performance (quiz, project, certification)'],
    ['retentionPlan', 'Enhance retention/transfer (job aids, follow-ups)'],
  ];

  return (
    <SectionCard
      title="Gagné’s Nine Events"
      description="Map the instructional flow for the course or module archetype."
    >
      {fields.map(([key, label]) => (
        <TextAreaField
          key={key}
          label={label}
          value={design[key] || ''}
          onChange={v => updateDesignPhase('design', { [key]: v })}
          rows={2}
        />
      ))}
    </SectionCard>
  );
};

const LearnerExperiencePhaseCard = ({ courseData, updateDesignPhase }) => {
  const experience = courseData.designPhases?.experience || {};

  const deliveryOptions = [
    { id: 'self_paced', label: 'Self-paced' },
    { id: 'blended', label: 'Blended' },
    { id: 'instructor_led', label: 'Instructor-led' },
    { id: 'microlearning', label: 'Microlearning' },
  ];

  const practiceOptions = [
    { id: 'per_lesson', label: 'After each lesson' },
    { id: 'per_module', label: 'End of module' },
    { id: 'weekly', label: 'Weekly challenge' },
    { id: 'ai_decides', label: 'Let AI decide' },
  ];

  const formatOptions = [
    { id: 'video_script', label: 'Video script' },
    { id: 'text_lesson', label: 'Text lesson' },
    { id: 'interactive_scenario', label: 'Interactive scenario' },
    { id: 'reflection_worksheet', label: 'Reflection worksheet' },
  ];

  const feedbackOptions = [
    { id: 'ai', label: 'AI feedback' },
    { id: 'mentor', label: 'Mentor feedback' },
    { id: 'peer', label: 'Peer review' },
  ];

  const setDelivery = v => updateDesignPhase('experience', { deliveryMode: v });

  return (
    <div className="space-y-4">
      <SectionCard
        title="Delivery and modalities (VAK)"
        description="Balance visual, auditory, and kinesthetic experiences."
      >
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            Primary delivery mode
          </p>
          <PillGroup
            options={deliveryOptions}
            value={experience.deliveryMode || 'self_paced'}
            onChange={setDelivery}
          />
        </div>
        <TextAreaField
          label="Visual approach (infographics, diagrams, animations)"
          value={experience.visualApproach || ''}
          onChange={v => updateDesignPhase('experience', { visualApproach: v })}
        />
        <TextAreaField
          label="Auditory approach (narration, podcasts, interviews)"
          value={experience.auditoryApproach || ''}
          onChange={v =>
            updateDesignPhase('experience', { auditoryApproach: v })
          }
        />
        <TextAreaField
          label="Kinesthetic approach (hands-on, simulations, drag/drop)"
          value={experience.kinestheticApproach || ''}
          onChange={v =>
            updateDesignPhase('experience', { kinestheticApproach: v })
          }
        />
        <TextAreaField
          label="Storytelling / narrative theme"
          value={experience.storytellingPlan || ''}
          onChange={v =>
            updateDesignPhase('experience', { storytellingPlan: v })
          }
          placeholder="Scenario tone or theme"
        />
      </SectionCard>

      <SectionCard
        title="Practice, feedback, and adaptive paths"
        description="Cadence, feedback channels, and adaptivity."
      >
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">Practice cadence</p>
          <PillGroup
            options={practiceOptions}
            value={experience.practiceCadence || 'per_lesson'}
            onChange={v =>
              updateDesignPhase('experience', { practiceCadence: v })
            }
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">Feedback channels</p>
          <CheckboxPills
            options={feedbackOptions}
            values={experience.feedbackChannels || []}
            onChange={vals =>
              updateDesignPhase('experience', { feedbackChannels: vals })
            }
            color="bg-amber-700 text-white border-amber-700"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            Adaptive learning paths?
          </p>
          <ToggleYesNo
            value={!!experience.adaptivePaths}
            onChange={v =>
              updateDesignPhase('experience', { adaptivePaths: v })
            }
          />
        </div>
        <TextAreaField
          label="Brand / visual style"
          value={experience.brandStyle || ''}
          onChange={v => updateDesignPhase('experience', { brandStyle: v })}
          placeholder="Color palette, tone, imagery, character style"
        />
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            Preferred learning formats per module
          </p>
          <CheckboxPills
            options={formatOptions}
            values={experience.learningFormats || []}
            onChange={vals =>
              updateDesignPhase('experience', { learningFormats: vals })
            }
            color="bg-purple-700 text-white border-purple-700"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            Let AI balance modalities automatically for inclusivity?
          </p>
          <ToggleYesNo
            value={experience.autoBalanceModalities !== false}
            onChange={v =>
              updateDesignPhase('experience', { autoBalanceModalities: v })
            }
          />
        </div>
      </SectionCard>
    </div>
  );
};

const DevelopmentPhaseCard = ({ courseData, updateDesignPhase }) => {
  const development = courseData.designPhases?.development || {};

  const storyboardOptions = [
    { id: 'slide-by-slide', label: 'Slide-by-slide' },
    { id: 'narration-visuals', label: 'Narration + visuals' },
    { id: 'text-only', label: 'Text-only blueprint' },
  ];

  const handleStoryFormat = v =>
    updateDesignPhase('development', { storyboardFormat: v });

  return (
    <div className="space-y-4">
      <SectionCard
        title="Inputs & workflow"
        description="Define what AI gets and how it should draft and iterate."
      >
        <TextAreaField
          label="Content inputs you will provide"
          value={development.inputsProvided || ''}
          onChange={v =>
            updateDesignPhase('development', { inputsProvided: v })
          }
          placeholder="Outlines, scripts, research notes, PPTs..."
        />
        <TextAreaField
          label="Module/lesson structure notes"
          value={development.moduleStructureNotes || ''}
          onChange={v =>
            updateDesignPhase('development', { moduleStructureNotes: v })
          }
          placeholder="Number of lessons, estimated time, interactions..."
        />
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">Storyboard format</p>
          <PillGroup
            options={storyboardOptions}
            value={development.storyboardFormat || 'slide-by-slide'}
            onChange={handleStoryFormat}
            color="bg-indigo-700 text-white border-indigo-700"
          />
        </div>
        <TextAreaField
          label="Review cycle"
          value={development.reviewCycle || ''}
          onChange={v => updateDesignPhase('development', { reviewCycle: v })}
          placeholder="Draft → Review → Revise → Approve"
        />
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            Auto-generate assessments?
          </p>
          <ToggleYesNo
            value={development.autoAssessments !== false}
            onChange={v =>
              updateDesignPhase('development', { autoAssessments: v })
            }
          />
        </div>
        <TextAreaField
          label="Localization / multilingual needs"
          value={development.localizationNeeds || ''}
          onChange={v =>
            updateDesignPhase('development', { localizationNeeds: v })
          }
        />
        <TextAreaField
          label="Interactive elements"
          value={development.interactiveElements || ''}
          onChange={v =>
            updateDesignPhase('development', { interactiveElements: v })
          }
          placeholder="Drag-drop, branching, simulations..."
        />
        <TextAreaField
          label="Media handling (stock vs brand library)"
          value={development.mediaHandling || ''}
          onChange={v => updateDesignPhase('development', { mediaHandling: v })}
        />
      </SectionCard>
    </div>
  );
};

const ImplementationPhaseCard = ({ courseData, updateDesignPhase }) => {
  const implementation = courseData.designPhases?.implementation || {};

  const deliveryOptions = [
    { id: 'lms', label: 'LMS' },
    { id: 'website', label: 'Website' },
    { id: 'app', label: 'Mobile app' },
    { id: 'classroom', label: 'Classroom / ILT' },
  ];

  const optimizationOptions = [
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'quarterly', label: 'Quarterly' },
    { id: 'annually', label: 'Annually' },
  ];

  const evaluationOptions = [
    { id: 'reaction', label: 'Kirkpatrick L1 Reaction' },
    { id: 'learning', label: 'L2 Learning' },
    { id: 'behavior', label: 'L3 Behavior' },
    { id: 'results', label: 'L4 Results' },
  ];

  return (
    <div className="space-y-4">
      <SectionCard
        title="Implementation & rollout"
        description="Where it runs, tracking, and feedback loops."
      >
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">Delivery channels</p>
          <CheckboxPills
            options={deliveryOptions}
            values={implementation.deliveryChannels || []}
            onChange={vals =>
              updateDesignPhase('implementation', { deliveryChannels: vals })
            }
            color="bg-indigo-700 text-white border-indigo-700"
          />
        </div>
        <TextAreaField
          label="Analytics / dashboards needed"
          value={implementation.analyticsNeeds || ''}
          onChange={v =>
            updateDesignPhase('implementation', { analyticsNeeds: v })
          }
          placeholder="Progress tracking, engagement, completions..."
        />
        <TextAreaField
          label="Assessment data to capture & visualize"
          value={implementation.assessmentDataNeeds || ''}
          onChange={v =>
            updateDesignPhase('implementation', { assessmentDataNeeds: v })
          }
          placeholder="Completion, accuracy, engagement..."
        />
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            Evaluation criteria (Kirkpatrick)
          </p>
          <CheckboxPills
            options={evaluationOptions}
            values={implementation.evaluationCriteria || []}
            onChange={vals =>
              updateDesignPhase('implementation', { evaluationCriteria: vals })
            }
            color="bg-amber-700 text-white border-amber-700"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            Optimization cadence
          </p>
          <PillGroup
            options={optimizationOptions}
            value={implementation.optimizationCadence || 'quarterly'}
            onChange={v =>
              updateDesignPhase('implementation', { optimizationCadence: v })
            }
            color="bg-emerald-700 text-white border-emerald-700"
          />
        </div>
        <TextAreaField
          label="Learner insights & summaries desired"
          value={implementation.learnerInsights || ''}
          onChange={v =>
            updateDesignPhase('implementation', { learnerInsights: v })
          }
        />
        <TextAreaField
          label="Feedback loops (learners, instructors, AI)"
          value={implementation.feedbackLoops || ''}
          onChange={v =>
            updateDesignPhase('implementation', { feedbackLoops: v })
          }
        />
      </SectionCard>
    </div>
  );
};

const BrandingPhaseCard = ({ courseData, updateDesignPhase }) => {
  const branding = courseData.designPhases?.branding || {};

  const toneOptions = [
    { id: 'friendly', label: 'Friendly' },
    { id: 'professional', label: 'Professional' },
    { id: 'coach', label: 'Coach-like' },
    { id: 'inspirational', label: 'Inspirational' },
  ];

  const visualOptions = [
    { id: 'corporate', label: 'Corporate' },
    { id: 'creative', label: 'Creative' },
    { id: 'minimalist', label: 'Minimalist' },
    { id: 'modern', label: 'Modern' },
  ];

  return (
    <SectionCard
      title="Branding & creative"
      description="Tone, visual system, characters, and audio style."
    >
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-700">Tone</p>
        <PillGroup
          options={toneOptions}
          value={branding.tone || 'professional'}
          onChange={v => updateDesignPhase('branding', { tone: v })}
          color="bg-purple-700 text-white border-purple-700"
        />
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-700">Visual style</p>
        <PillGroup
          options={visualOptions}
          value={branding.visualStyle || 'modern'}
          onChange={v => updateDesignPhase('branding', { visualStyle: v })}
          color="bg-indigo-700 text-white border-indigo-700"
        />
      </div>
      <TextAreaField
        label="Characters / avatars / narrators"
        value={branding.characters || ''}
        onChange={v => updateDesignPhase('branding', { characters: v })}
        placeholder="Describe persona, role, or personality."
      />
      <TextAreaField
        label="Music / sound style"
        value={branding.musicStyle || ''}
        onChange={v => updateDesignPhase('branding', { musicStyle: v })}
      />
      <TextAreaField
        label="Interactive storytelling preferences"
        value={branding.storytellingStyle || ''}
        onChange={v => updateDesignPhase('branding', { storytellingStyle: v })}
        placeholder="Decision-based sims, branching, narrative tone."
      />
    </SectionCard>
  );
};

const QualityPhaseCard = ({ courseData, updateDesignPhase }) => {
  const quality = courseData.designPhases?.quality || {};

  const accuracyOptions = [
    { id: '95%', label: '95%' },
    { id: '99%', label: '99%' },
    { id: '99.9%', label: '99.9%' },
  ];

  const ambiguityOptions = [
    { id: 'ask', label: 'Ask before assuming' },
    { id: 'default', label: 'Use sensible defaults' },
  ];

  return (
    <div className="space-y-4">
      <SectionCard
        title="Quality & accuracy"
        description="Validation rules, references, and tagging."
      >
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            Accuracy benchmark
          </p>
          <PillGroup
            options={accuracyOptions}
            value={quality.accuracyBenchmark || '99%'}
            onChange={v =>
              updateDesignPhase('quality', { accuracyBenchmark: v })
            }
            color="bg-emerald-700 text-white border-emerald-700"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            Cross-check with references?
          </p>
          <ToggleYesNo
            value={quality.referenceCheck !== false}
            onChange={v => updateDesignPhase('quality', { referenceCheck: v })}
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            Human-in-the-loop validation?
          </p>
          <ToggleYesNo
            value={quality.humanValidation !== false}
            onChange={v => updateDesignPhase('quality', { humanValidation: v })}
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            How should AI handle ambiguity?
          </p>
          <PillGroup
            options={ambiguityOptions}
            value={quality.ambiguityHandling || 'ask'}
            onChange={v =>
              updateDesignPhase('quality', { ambiguityHandling: v })
            }
            color="bg-rose-700 text-white border-rose-700"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">
            Auto-tag lessons (Bloom, duration, skill)?
          </p>
          <ToggleYesNo
            value={quality.autoTagging !== false}
            onChange={v => updateDesignPhase('quality', { autoTagging: v })}
          />
        </div>
        <TextAreaField
          label="Compliance / notes"
          value={quality.complianceNotes || ''}
          onChange={v => updateDesignPhase('quality', { complianceNotes: v })}
        />
      </SectionCard>
    </div>
  );
};

export {
  AnalysisPhaseCard,
  ObjectivesPhaseCard,
  InstructionDesignPhaseCard,
  LearnerExperiencePhaseCard,
  DevelopmentPhaseCard,
  ImplementationPhaseCard,
  BrandingPhaseCard,
  QualityPhaseCard,
};
