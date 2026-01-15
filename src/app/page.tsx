'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 py-20">
        <div className="max-w-4xl">

          <p className="font-mono text-[#888] text-sm tracking-wider uppercase mb-6">
            Roblox
          </p>

          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-black tracking-tight leading-[0.9] mb-8">
            DROPR
          </h1>

          <p className="text-2xl md:text-3xl text-[#888] max-w-2xl mb-12 leading-snug">
            The arena where taste is proven.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="flex-1 px-4 py-4 bg-[#111] border border-[#333] text-white placeholder-[#555] focus:outline-none focus:border-[#FF4D00] transition-colors"
              disabled={status === 'loading' || status === 'success'}
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="px-8 py-4 bg-[#FF4D00] text-black font-semibold hover:bg-[#FF6A2A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === 'success' ? 'Done' : 'Enter'}
              {status === 'idle' && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {status === 'success' && (
            <p className="text-[#22C55E] text-sm">You're on the list.</p>
          )}
          {status === 'error' && (
            <p className="text-[#EF4444] text-sm">Try again.</p>
          )}

        </div>
      </section>

      {/* Problem */}
      <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-[#222]">
        <div className="max-w-6xl">

          <p className="font-mono text-[#FF4D00] text-sm tracking-wider uppercase mb-4">
            Problem
          </p>

          <h2 className="font-display text-4xl md:text-5xl font-bold mb-16 max-w-3xl">
            Algorithms decide what you hear. You just consume.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            <div>
              <h3 className="text-xl font-semibold mb-3">No agency</h3>
              <p className="text-[#888] leading-relaxed">
                What goes viral is decided by curators, labels, and code. Your opinion is data they extract and sell.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">No stakes</h3>
              <p className="text-[#888] leading-relaxed">
                Your taste costs you nothing. It means nothing. Anyone can claim good taste. Nobody can prove it.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">No identity</h3>
              <p className="text-[#888] leading-relaxed">
                Music used to say something about you. Now it's background noise selected by an algorithm.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">No competition</h3>
              <p className="text-[#888] leading-relaxed">
                Rhythm games test skill. Trivia tests knowledge. Nothing tests taste.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Solution */}
      <section className="px-6 md:px-12 lg:px-24 py-24 bg-[#111] border-t border-[#222]">
        <div className="max-w-6xl">

          <p className="font-mono text-[#FFB800] text-sm tracking-wider uppercase mb-4">
            Solution
          </p>

          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 max-w-3xl">
            An arena where taste is tested.
          </h2>

          <p className="text-[#888] text-xl mb-16 max-w-2xl">
            Enter. Choose. Win or lose. Your taste is judged by the crowd, and your record speaks for itself.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="border-l-2 border-[#333] pl-6">
              <p className="font-mono text-[#555] text-sm mb-2">01</p>
              <h3 className="text-lg font-semibold mb-2">Battles</h3>
              <p className="text-[#888] text-sm">1v1. Same sound. Different remixes. You pick.</p>
            </div>
            <div className="border-l-2 border-[#333] pl-6">
              <p className="font-mono text-[#555] text-sm mb-2">02</p>
              <h3 className="text-lg font-semibold mb-2">AI Remixes</h3>
              <p className="text-[#888] text-sm">Every battle is unique. EDM. Lo-Fi. Trap. Infinite versions.</p>
            </div>
            <div className="border-l-2 border-[#333] pl-6">
              <p className="font-mono text-[#555] text-sm mb-2">03</p>
              <h3 className="text-lg font-semibold mb-2">Crowd Votes</h3>
              <p className="text-[#888] text-sm">No algorithm. No curator. The audience decides.</p>
            </div>
            <div className="border-l-2 border-[#333] pl-6">
              <p className="font-mono text-[#555] text-sm mb-2">04</p>
              <h3 className="text-lg font-semibold mb-2">Rankings</h3>
              <p className="text-[#888] text-sm">Win and rise. Lose and fall. Your record is public.</p>
            </div>
          </div>

        </div>
      </section>

      {/* How it works */}
      <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-[#222]">
        <div className="max-w-6xl">

          <p className="font-mono text-[#FF4D00] text-sm tracking-wider uppercase mb-4">
            Gameplay
          </p>

          <h2 className="font-display text-4xl md:text-5xl font-bold mb-16">
            Enter. Choose. Win.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <Step number="1" title="Enter" desc="Get matched against another player" />
            <Step number="2" title="Choose" desc="Pick from AI-generated remixes" />
            <Step number="3" title="Battle" desc="The crowd votes on the winner" />
            <Step number="4" title="Rise" desc="Win to climb. Your rank is your reputation." />
          </div>

        </div>
      </section>

      {/* Archetypes */}
      <section className="px-6 md:px-12 lg:px-24 py-24 bg-[#111] border-t border-[#222]">
        <div className="max-w-6xl">

          <p className="font-mono text-[#FFB800] text-sm tracking-wider uppercase mb-4">
            Identity
          </p>

          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Your battles reveal your taste.
          </h2>

          <p className="text-[#888] text-xl mb-16 max-w-2xl">
            Six archetypes. Your history determines which one you are.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <Archetype name="Trendsetter" desc="Spots winners before they peak" />
            <Archetype name="Purist" desc="Deep genre loyalty" />
            <Archetype name="Chaos Agent" desc="Bets against the crowd" />
            <Archetype name="Crowd Surfer" desc="Reads the room" />
            <Archetype name="Architect" desc="Values production" />
            <Archetype name="Mood Shifter" desc="Context is everything" />
          </div>

        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 md:px-12 lg:px-24 py-32 border-t border-[#222]">
        <div className="max-w-4xl">

          <h2 className="font-display text-5xl md:text-7xl font-bold mb-8">
            Prove your taste.
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="flex-1 px-4 py-4 bg-[#111] border border-[#333] text-white placeholder-[#555] focus:outline-none focus:border-[#FF4D00] transition-colors"
              disabled={status === 'loading' || status === 'success'}
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="px-8 py-4 bg-[#FF4D00] text-black font-semibold hover:bg-[#FF6A2A] transition-colors disabled:opacity-50"
            >
              {status === 'success' ? 'Done' : 'Enter'}
            </button>
          </form>

        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 lg:px-24 py-12 border-t border-[#222]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="font-display font-bold text-xl">DROPR</p>
          <p className="text-[#555] text-sm">Built by VIOLET SPHINX</p>
        </div>
      </footer>

    </div>
  );
}

function Step({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div>
      <div className="w-12 h-12 border border-[#333] flex items-center justify-center font-mono text-[#888] mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-[#888] text-sm">{desc}</p>
    </div>
  );
}

function Archetype({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="border border-[#333] p-6 hover:border-[#555] transition-colors">
      <p className="font-mono text-[#FFB800] text-xs uppercase tracking-wider mb-2">{name}</p>
      <p className="text-[#888] text-sm">{desc}</p>
    </div>
  );
}
