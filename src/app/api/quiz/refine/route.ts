import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { ArchetypeId, ARCHETYPE_IDS } from '@/lib/archetypes/types';
import { EnneagramType, ENNEAGRAM_TYPES } from '@/lib/enneagram/types';

/**
 * Refinement adjustments from the RefinementQuiz component
 */
interface RefinementResult {
  archetypeAdjustments: Partial<Record<ArchetypeId, number>>;
  enneagramAdjustments: Partial<Record<EnneagramType, number>>;
  traitAdjustments: Partial<Record<string, number>>;
  confidence: number;
}

/**
 * POST /api/quiz/refine
 *
 * Apply refinement adjustments to user's profile based on
 * targeted disambiguation questions.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, refinementResult } = body as {
      userId: string;
      refinementResult: RefinementResult;
    };

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    if (!refinementResult) {
      return NextResponse.json(
        { error: 'Refinement result required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch current profiles
    const [
      { data: psychProfile, error: psychError },
      { data: constProfile, error: constError },
    ] = await Promise.all([
      supabase
        .from('psychometric_profiles')
        .select('*')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('constellation_profiles')
        .select('*')
        .eq('user_id', userId)
        .single(),
    ]);

    if (psychError || !psychProfile) {
      return NextResponse.json(
        { error: 'Psychometric profile not found' },
        { status: 404 }
      );
    }

    if (constError || !constProfile) {
      return NextResponse.json(
        { error: 'Constellation profile not found' },
        { status: 404 }
      );
    }

    // Apply trait adjustments to psychometric profile
    const traitUpdates: Record<string, number> = {};
    const traitMapping: Record<string, string> = {
      openness: 'openness',
      conscientiousness: 'conscientiousness',
      extraversion: 'extraversion',
      agreeableness: 'agreeableness',
      neuroticism: 'neuroticism',
      noveltySeeking: 'novelty_seeking',
      aestheticSensitivity: 'aesthetic_sensitivity',
      riskTolerance: 'risk_tolerance',
    };

    for (const [trait, adjustment] of Object.entries(refinementResult.traitAdjustments)) {
      const dbField = traitMapping[trait];
      if (dbField && psychProfile[dbField] !== undefined) {
        // Apply adjustment with clamping to 0-1
        const currentValue = psychProfile[dbField] as number;
        traitUpdates[dbField] = Math.max(0, Math.min(1, currentValue + (adjustment || 0)));
      }
    }

    // Update psychometric profile if there are trait adjustments
    if (Object.keys(traitUpdates).length > 0) {
      const { error: updatePsychError } = await supabase
        .from('psychometric_profiles')
        .update({
          ...traitUpdates,
          overall_confidence: refinementResult.confidence,
        })
        .eq('user_id', userId);

      if (updatePsychError) throw updatePsychError;
    }

    // Apply archetype adjustments to constellation profile
    const currentBlendWeights = (constProfile.archetype_blend_weights || {}) as Record<string, number>;
    const updatedBlendWeights = { ...currentBlendWeights };

    for (const [archetype, adjustment] of Object.entries(refinementResult.archetypeAdjustments)) {
      if (ARCHETYPE_IDS.includes(archetype as ArchetypeId)) {
        const current = updatedBlendWeights[archetype] || 0;
        updatedBlendWeights[archetype] = Math.max(0, Math.min(1, current + (adjustment || 0)));
      }
    }

    // Normalize blend weights to sum to 1
    const totalWeight = Object.values(updatedBlendWeights).reduce((sum, w) => sum + w, 0);
    if (totalWeight > 0) {
      for (const key of Object.keys(updatedBlendWeights)) {
        updatedBlendWeights[key] /= totalWeight;
      }
    }

    // Determine new primary archetype if weights changed significantly
    let newPrimaryArchetype = constProfile.primary_archetype_id;
    if (Object.keys(refinementResult.archetypeAdjustments).length > 0) {
      const maxEntry = Object.entries(updatedBlendWeights).reduce(
        (max, [k, v]) => (v > max[1] ? [k, v] : max),
        ['', 0] as [string, number]
      );
      if (maxEntry[0] && ARCHETYPE_IDS.includes(maxEntry[0] as ArchetypeId)) {
        newPrimaryArchetype = maxEntry[0];
      }
    }

    // Apply Enneagram adjustments
    const currentEnneagramScores = (constProfile.enneagram_type_scores || {}) as Record<string, number>;
    const updatedEnneagramScores = { ...currentEnneagramScores };

    for (const [type, adjustment] of Object.entries(refinementResult.enneagramAdjustments)) {
      const typeNum = parseInt(type);
      if (ENNEAGRAM_TYPES.includes(typeNum as EnneagramType)) {
        const typeKey = type.toString();
        const current = updatedEnneagramScores[typeKey] || 0.5;
        updatedEnneagramScores[typeKey] = Math.max(0, Math.min(1, current + (adjustment || 0)));
      }
    }

    // Determine new primary Enneagram
    let newPrimaryEnneagram = constProfile.enneagram_primary;
    if (Object.keys(refinementResult.enneagramAdjustments).length > 0) {
      const maxEntry = Object.entries(updatedEnneagramScores).reduce(
        (max, [k, v]) => (v > max[1] ? [k, v] : max),
        ['', 0] as [string, number]
      );
      if (maxEntry[0]) {
        newPrimaryEnneagram = parseInt(maxEntry[0]);
      }
    }

    // Update constellation profile
    const { error: updateConstError } = await supabase
      .from('constellation_profiles')
      .update({
        primary_archetype_id: newPrimaryArchetype,
        archetype_blend_weights: updatedBlendWeights,
        enneagram_primary: newPrimaryEnneagram,
        enneagram_type_scores: updatedEnneagramScores,
        refinement_applied: true,
        refinement_confidence: refinementResult.confidence,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateConstError) throw updateConstError;

    // Save to profile history
    await supabase.from('profile_history').insert({
      user_id: userId,
      profile_type: 'refinement',
      profile_data: {
        refinementResult,
        appliedAt: new Date().toISOString(),
        previousArchetype: constProfile.primary_archetype_id,
        newArchetype: newPrimaryArchetype,
        previousEnneagram: constProfile.enneagram_primary,
        newEnneagram: newPrimaryEnneagram,
      },
      trigger: 'refinement_quiz',
    });

    return NextResponse.json({
      success: true,
      userId,
      archetype: newPrimaryArchetype,
      archetypeBlend: updatedBlendWeights,
      enneagram: newPrimaryEnneagram,
      enneagramScores: updatedEnneagramScores,
      confidence: refinementResult.confidence,
    });
  } catch (error) {
    console.error('Refinement submission error:', error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    return NextResponse.json(
      { error: 'Failed to apply refinement', details: errorMessage },
      { status: 500 }
    );
  }
}
