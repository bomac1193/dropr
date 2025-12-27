/**
 * Adaptive Question Selection
 *
 * Implements intelligent question selection that:
 * 1. Randomly selects 3-5 questions per trait from the item bank
 * 2. Always includes anchor questions for returning users
 * 3. Prioritizes traits with high variance from prior answers
 * 4. Uses information gain to maximize measurement precision
 * 5. Returns questions in randomized order
 */

import {
  itemBank,
  ItemBankQuestion,
  TraitId,
  ALL_TRAITS,
  getAnchorQuestions,
  getQuestionsByTrait,
} from './item-bank';

export interface UserPriorData {
  /** Previous trait estimates (0-1) */
  traitEstimates?: Partial<Record<TraitId, number>>;
  /** Previous answer variances per trait */
  traitVariances?: Partial<Record<TraitId, number>>;
  /** Previously answered question IDs */
  answeredQuestionIds?: string[];
  /** Session count for this user */
  sessionCount?: number;
}

export interface SelectionConfig {
  /** Minimum questions per trait */
  minPerTrait: number;
  /** Maximum questions per trait */
  maxPerTrait: number;
  /** Total target question count */
  targetTotal: number;
  /** Weight for variance-based prioritization (0-1) */
  varianceWeight: number;
  /** Weight for information gain prioritization (0-1) */
  informationGainWeight: number;
  /** Include all anchors for returning users */
  includeAnchorsForReturning: boolean;
}

const DEFAULT_CONFIG: SelectionConfig = {
  minPerTrait: 2,
  maxPerTrait: 4,
  targetTotal: 24,
  varianceWeight: 0.4,
  informationGainWeight: 0.3,
  includeAnchorsForReturning: true,
};

export interface SelectedQuestionSet {
  questions: ItemBankQuestion[];
  traitCoverage: Record<TraitId, number>;
  estimatedConfidence: number;
  estimatedDuration: number; // in seconds
}

/**
 * Select adaptive questions for a quiz session
 */
export function selectAdaptiveQuestions(
  userId?: string,
  priorData?: UserPriorData,
  config: Partial<SelectionConfig> = {}
): SelectedQuestionSet {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const isReturningUser = priorData?.sessionCount && priorData.sessionCount > 0;

  // Step 1: Initialize selected questions
  let selectedQuestions: ItemBankQuestion[] = [];
  const traitCoverage: Record<TraitId, number> = {} as Record<TraitId, number>;
  ALL_TRAITS.forEach((t) => (traitCoverage[t] = 0));

  // Step 2: For returning users, always include anchors
  if (isReturningUser && cfg.includeAnchorsForReturning) {
    const anchors = getAnchorQuestions();
    selectedQuestions = [...anchors];
    anchors.forEach((q) => {
      traitCoverage[q.primaryTrait]++;
    });
  }

  // Step 3: Calculate trait priorities based on variance and information need
  const traitPriorities = calculateTraitPriorities(priorData, cfg);

  // Step 4: Select additional questions per trait
  const remainingSlots = cfg.targetTotal - selectedQuestions.length;
  const selectedIds = new Set(selectedQuestions.map((q) => q.id));
  const previouslyAnswered = new Set(priorData?.answeredQuestionIds || []);

  // Sort traits by priority (highest first)
  const sortedTraits = [...ALL_TRAITS].sort(
    (a, b) => traitPriorities[b] - traitPriorities[a]
  );

  // Distribute remaining slots across traits
  let slotsPerTrait = Math.floor(remainingSlots / ALL_TRAITS.length);
  let extraSlots = remainingSlots % ALL_TRAITS.length;

  for (const trait of sortedTraits) {
    const currentCount = traitCoverage[trait];
    const neededMin = Math.max(0, cfg.minPerTrait - currentCount);
    const allowedMax = cfg.maxPerTrait - currentCount;

    // High-priority traits get extra slots
    const bonusSlots = extraSlots > 0 ? 1 : 0;
    if (bonusSlots > 0) extraSlots--;

    const targetForTrait = Math.min(
      allowedMax,
      Math.max(neededMin, slotsPerTrait + bonusSlots)
    );

    if (targetForTrait <= 0) continue;

    // Get available questions for this trait
    const available = getQuestionsByTrait(trait).filter(
      (q) => !selectedIds.has(q.id) && !previouslyAnswered.has(q.id)
    );

    // Score and sort by information gain
    const scored = available.map((q) => ({
      question: q,
      score: calculateQuestionScore(q, priorData, cfg),
    }));
    scored.sort((a, b) => b.score - a.score);

    // Select top questions with some randomization
    const toSelect = selectWithRandomization(scored, targetForTrait);

    for (const q of toSelect) {
      selectedQuestions.push(q);
      selectedIds.add(q.id);
      traitCoverage[trait]++;
    }
  }

  // Step 5: Ensure minimum coverage for all traits
  for (const trait of ALL_TRAITS) {
    while (traitCoverage[trait] < cfg.minPerTrait) {
      const available = getQuestionsByTrait(trait).filter(
        (q) => !selectedIds.has(q.id)
      );
      if (available.length === 0) break;

      const q = available[Math.floor(Math.random() * available.length)];
      selectedQuestions.push(q);
      selectedIds.add(q.id);
      traitCoverage[trait]++;
    }
  }

  // Step 6: Deduplicate questions (safety check)
  const seenIds = new Set<string>();
  const uniqueQuestions = selectedQuestions.filter((q) => {
    if (seenIds.has(q.id)) return false;
    seenIds.add(q.id);
    return true;
  });

  // Step 7: Shuffle final question order
  const shuffled = shuffleArray(uniqueQuestions);

  // Step 8: Calculate estimated confidence and duration
  const estimatedConfidence = calculateEstimatedConfidence(traitCoverage);
  const estimatedDuration = shuffled.length * 8; // ~8 seconds per question

  return {
    questions: shuffled,
    traitCoverage,
    estimatedConfidence,
    estimatedDuration,
  };
}

/**
 * Calculate priority scores for each trait based on variance and information need
 */
function calculateTraitPriorities(
  priorData: UserPriorData | undefined,
  config: SelectionConfig
): Record<TraitId, number> {
  const priorities: Record<TraitId, number> = {} as Record<TraitId, number>;

  for (const trait of ALL_TRAITS) {
    let priority = 1.0; // Base priority

    if (priorData?.traitVariances?.[trait] !== undefined) {
      // High variance = more uncertainty = higher priority
      const variance = priorData.traitVariances[trait]!;
      priority += variance * config.varianceWeight * 2;
    }

    if (priorData?.traitEstimates?.[trait] !== undefined) {
      // Estimates near 0.5 are more uncertain
      const estimate = priorData.traitEstimates[trait]!;
      const uncertainty = 1 - Math.abs(estimate - 0.5) * 2;
      priority += uncertainty * config.informationGainWeight;
    }

    priorities[trait] = priority;
  }

  return priorities;
}

/**
 * Calculate information gain score for a question
 */
function calculateQuestionScore(
  question: ItemBankQuestion,
  priorData: UserPriorData | undefined,
  config: SelectionConfig
): number {
  let score = 0;

  // For new users, use much more randomization to get diverse questions
  const isNewUser = !priorData?.traitEstimates;

  if (isNewUser) {
    // For new users: heavy randomization with light discrimination weighting
    score += question.discrimination * 0.2;
    score += Math.random() * 1.5; // Much larger random factor for diversity
  } else {
    // For returning users: use IRT-based scoring
    // Base score from discrimination (higher = more informative)
    score += question.discrimination * 0.4;

    // Difficulty matching: prefer questions near current estimate
    if (priorData?.traitEstimates?.[question.primaryTrait] !== undefined) {
      const estimate = priorData.traitEstimates[question.primaryTrait]!;
      // Convert estimate (0-1) to difficulty scale (-3 to 3)
      const estimatedAbility = (estimate - 0.5) * 6;
      const difficultyMatch = 1 - Math.abs(question.difficulty - estimatedAbility) / 6;
      score += difficultyMatch * config.informationGainWeight;
    }

    // Moderate randomization for returning users
    score += Math.random() * 0.5;
  }

  // Bonus for questions that measure multiple traits
  if (question.secondaryTraits) {
    score += Object.keys(question.secondaryTraits).length * 0.1;
  }

  return score;
}

/**
 * Select questions with weighted random selection for diversity
 * All selection is now weighted-random to maximize variety
 */
function selectWithRandomization(
  scored: { question: ItemBankQuestion; score: number }[],
  count: number
): ItemBankQuestion[] {
  const selected: ItemBankQuestion[] = [];
  const selectedIds = new Set<string>();
  const remaining = [...scored];

  // Use weighted random selection for ALL questions to maximize diversity
  for (let i = 0; i < count && remaining.length > 0; i++) {
    const totalScore = remaining.reduce((sum, s) => sum + s.score, 0);

    if (totalScore <= 0) {
      // Fallback: pick random if scores are zero
      const idx = Math.floor(Math.random() * remaining.length);
      const picked = remaining[idx];
      if (!selectedIds.has(picked.question.id)) {
        selected.push(picked.question);
        selectedIds.add(picked.question.id);
      }
      remaining.splice(idx, 1);
      continue;
    }

    let rand = Math.random() * totalScore;
    let cumulative = 0;
    let pickedIdx = -1;

    for (let j = 0; j < remaining.length; j++) {
      cumulative += remaining[j].score;
      if (rand <= cumulative) {
        pickedIdx = j;
        break;
      }
    }

    // Fallback if floating point issues prevent selection
    if (pickedIdx === -1) {
      pickedIdx = remaining.length - 1;
    }

    const picked = remaining[pickedIdx];
    if (!selectedIds.has(picked.question.id)) {
      selected.push(picked.question);
      selectedIds.add(picked.question.id);
    }
    remaining.splice(pickedIdx, 1);
  }

  return selected;
}

/**
 * Calculate estimated confidence based on trait coverage
 */
function calculateEstimatedConfidence(
  traitCoverage: Record<TraitId, number>
): number {
  const counts = Object.values(traitCoverage);
  const total = counts.reduce((a, b) => a + b, 0);
  const minCoverage = Math.min(...counts);

  // Base confidence from total questions
  let confidence = Math.min(total / 30, 0.9); // Max 90% from quantity

  // Penalty for uneven coverage
  const avgCoverage = total / ALL_TRAITS.length;
  const coverageVariance =
    counts.reduce((sum, c) => sum + Math.pow(c - avgCoverage, 2), 0) /
    ALL_TRAITS.length;
  const coveragePenalty = Math.min(coverageVariance / 4, 0.2);
  confidence -= coveragePenalty;

  // Bonus for minimum coverage
  if (minCoverage >= 2) confidence += 0.05;
  if (minCoverage >= 3) confidence += 0.05;

  return Math.max(0.3, Math.min(0.95, confidence));
}

/**
 * Fisher-Yates shuffle
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get next best question during adaptive testing
 * (For real-time adaptation during quiz)
 */
export function getNextBestQuestion(
  answeredQuestions: ItemBankQuestion[],
  currentEstimates: Partial<Record<TraitId, number>>,
  currentVariances: Partial<Record<TraitId, number>>
): ItemBankQuestion | null {
  const answeredIds = new Set(answeredQuestions.map((q) => q.id));

  // Find trait with highest uncertainty
  let maxUncertainty = 0;
  let targetTrait: TraitId = 'openness';

  for (const trait of ALL_TRAITS) {
    const variance = currentVariances[trait] ?? 0.25;
    const estimate = currentEstimates[trait] ?? 0.5;
    const uncertainty = variance + (1 - Math.abs(estimate - 0.5) * 2) * 0.5;

    if (uncertainty > maxUncertainty) {
      maxUncertainty = uncertainty;
      targetTrait = trait;
    }
  }

  // Find best question for target trait
  const available = getQuestionsByTrait(targetTrait).filter(
    (q) => !answeredIds.has(q.id)
  );

  if (available.length === 0) {
    // Fall back to any unanswered question
    const anyAvailable = itemBank.filter((q) => !answeredIds.has(q.id));
    return anyAvailable.length > 0 ? anyAvailable[0] : null;
  }

  // Score by information gain
  const estimate = currentEstimates[targetTrait] ?? 0.5;
  const estimatedAbility = (estimate - 0.5) * 6;

  const scored = available.map((q) => ({
    question: q,
    score:
      q.discrimination *
      (1 - Math.abs(q.difficulty - estimatedAbility) / 6) *
      (1 + Math.random() * 0.1),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored[0].question;
}

export default selectAdaptiveQuestions;
