'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Brain, Palette, Users, Wand2, Copy, Check } from 'lucide-react';
import { ResultDetails, TraitValues } from '@/lib/types/results';
import { cn } from '@/lib/utils';

interface ResultDetailsAccordionProps {
  details: ResultDetails;
}

type SectionId = 'personality' | 'aesthetic' | 'subculture' | 'prompts';

export function ResultDetailsAccordion({ details }: ResultDetailsAccordionProps) {
  const [openSections, setOpenSections] = useState<Set<SectionId>>(new Set());

  const toggleSection = (id: SectionId) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {/* Personality Section */}
      <AccordionSection
        id="personality"
        icon={<Brain className="w-5 h-5" />}
        title="Personality & Traits"
        isOpen={openSections.has('personality')}
        onToggle={() => toggleSection('personality')}
      >
        <PersonalityContent personality={details.personality} />
      </AccordionSection>

      {/* Aesthetic Section */}
      <AccordionSection
        id="aesthetic"
        icon={<Palette className="w-5 h-5" />}
        title="Visual & Music DNA"
        isOpen={openSections.has('aesthetic')}
        onToggle={() => toggleSection('aesthetic')}
      >
        <AestheticContent aesthetic={details.aesthetic} />
      </AccordionSection>

      {/* Subculture Section */}
      <AccordionSection
        id="subculture"
        icon={<Users className="w-5 h-5" />}
        title="Subculture Fit"
        isOpen={openSections.has('subculture')}
        onToggle={() => toggleSection('subculture')}
      >
        <SubcultureContent subculture={details.subculture} />
      </AccordionSection>

      {/* Prompts Section */}
      <AccordionSection
        id="prompts"
        icon={<Wand2 className="w-5 h-5" />}
        title="Creative Hooks & Prompts"
        isOpen={openSections.has('prompts')}
        onToggle={() => toggleSection('prompts')}
      >
        <PromptsContent prompts={details.prompts} />
      </AccordionSection>
    </div>
  );
}

interface AccordionSectionProps {
  id: SectionId;
  icon: React.ReactNode;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionSection({
  icon,
  title,
  isOpen,
  onToggle,
  children,
}: AccordionSectionProps) {
  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-neutral-400">{icon}</span>
          <span className="font-medium">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-neutral-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-neutral-800/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// Section Content Components
// =============================================================================

function PersonalityContent({
  personality,
}: {
  personality: ResultDetails['personality'];
}) {
  const traitLabels: { key: keyof TraitValues; label: string }[] = [
    { key: 'openness', label: 'Openness' },
    { key: 'conscientiousness', label: 'Conscientiousness' },
    { key: 'extraversion', label: 'Extraversion' },
    { key: 'agreeableness', label: 'Agreeableness' },
    { key: 'neuroticism', label: 'Neuroticism' },
    { key: 'noveltySeeking', label: 'Novelty Seeking' },
    { key: 'aestheticSensitivity', label: 'Aesthetic Sensitivity' },
    { key: 'riskTolerance', label: 'Risk Tolerance' },
  ];

  return (
    <div className="space-y-4">
      {/* Narrative */}
      <p className="text-neutral-400 text-sm leading-relaxed">
        {personality.narrative}
      </p>

      {/* Trait bars */}
      <div className="space-y-3">
        {traitLabels.map(({ key, label }) => (
          <TraitBar key={key} label={label} value={personality.traits[key]} />
        ))}
      </div>
    </div>
  );
}

function TraitBar({ label, value }: { label: string; value: number }) {
  const percentage = Math.round(value * 100);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-neutral-500">{label}</span>
        <span className="text-neutral-400">{percentage}%</span>
      </div>
      <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
        />
      </div>
    </div>
  );
}

function AestheticContent({ aesthetic }: { aesthetic: ResultDetails['aesthetic'] }) {
  return (
    <div className="space-y-6">
      {/* Narrative */}
      <p className="text-neutral-400 text-sm leading-relaxed">{aesthetic.narrative}</p>

      {/* Visual sliders */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-neutral-300">Visual</h4>
        <AestheticSlider
          leftLabel="Dark"
          rightLabel="Bright"
          value={aesthetic.visualSliders.darkToBright}
        />
        <AestheticSlider
          leftLabel="Minimal"
          rightLabel="Maximal"
          value={aesthetic.visualSliders.minimalToMaximal}
        />
        <AestheticSlider
          leftLabel="Organic"
          rightLabel="Synthetic"
          value={aesthetic.visualSliders.organicToSynthetic}
        />
      </div>

      {/* Music sliders */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-neutral-300">Music</h4>
        <AestheticSlider
          leftLabel="Slow"
          rightLabel="Fast"
          value={aesthetic.musicSliders.slowToFast}
        />
        <AestheticSlider
          leftLabel="Soft"
          rightLabel="Intense"
          value={aesthetic.musicSliders.softToIntense}
        />
        <AestheticSlider
          leftLabel="Acoustic"
          rightLabel="Digital"
          value={aesthetic.musicSliders.acousticToDigital}
        />
      </div>
    </div>
  );
}

function AestheticSlider({
  leftLabel,
  rightLabel,
  value,
}: {
  leftLabel: string;
  rightLabel: string;
  value: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-neutral-500">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="relative h-3 bg-neutral-800 rounded-full">
        <motion.div
          initial={{ left: '50%' }}
          animate={{ left: `${value * 100}%` }}
          transition={{ duration: 0.5 }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg"
        />
        {/* Center marker */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-neutral-600" />
      </div>
    </div>
  );
}

function SubcultureContent({
  subculture,
}: {
  subculture: ResultDetails['subculture'];
}) {
  return (
    <div className="space-y-4">
      {/* Narrative */}
      <p className="text-neutral-400 text-sm leading-relaxed">{subculture.narrative}</p>

      {/* Top constellations */}
      <div className="space-y-3">
        {subculture.topConstellations.map((constellation, index) => (
          <div
            key={constellation.id}
            className={cn(
              'p-3 rounded-lg',
              index === 0
                ? 'bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20'
                : 'bg-neutral-800/50'
            )}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={cn('font-medium', index === 0 && 'text-violet-300')}>
                {constellation.name}
              </span>
              <span className="text-sm text-neutral-500">
                {constellation.affinityScore}% affinity
              </span>
            </div>
            <p className="text-xs text-neutral-500">{constellation.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PromptsContent({ prompts }: { prompts: ResultDetails['prompts'] }) {
  return (
    <div className="space-y-4">
      {/* Creative hooks */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-neutral-300">Creative Hooks</h4>
        <div className="grid gap-2">
          {prompts.creativeHooks.map((hook, index) => (
            <CopyablePrompt key={index} text={hook} />
          ))}
        </div>
      </div>

      {/* Content prompts */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-neutral-300">Content Discovery</h4>
        <div className="grid gap-2">
          {prompts.contentPrompts.map((prompt, index) => (
            <CopyablePrompt key={index} text={prompt} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CopyablePrompt({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="group flex items-center gap-3 p-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors text-left w-full"
    >
      <span className="flex-1 text-sm text-neutral-300">{text}</span>
      <span className="text-neutral-500 group-hover:text-neutral-400">
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </span>
    </button>
  );
}

export default ResultDetailsAccordion;
