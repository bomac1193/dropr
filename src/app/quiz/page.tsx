'use client';

import { useRouter } from 'next/navigation';
import { SubtasteQuiz } from '@/components/quiz';
import { QuizResponses } from '@/lib/quiz';

export default function QuizPage() {
  const router = useRouter();

  const handleComplete = async (responses: QuizResponses) => {
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
      });

      const data = await response.json();

      if (data.success) {
        // Store user ID in localStorage for subsequent requests
        localStorage.setItem('subtaste_user_id', data.userId);

        // Navigate to swipe interface
        router.push(`/swipe?teaser=${data.preliminaryConstellation}`);
      } else {
        console.error('Quiz submission failed:', data.error);
      }
    } catch (error) {
      console.error('Quiz submission error:', error);
    }
  };

  return <SubtasteQuiz onComplete={handleComplete} />;
}
