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

          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-black tracking-tight leading-[0.9] mb-8">
            DROPR
          </h1>

          <p className="text-2xl md:text-3xl text-[#888] max-w-2xl mb-4 leading-snug italic">
            Drop heat.{' '}
            <span className="text-[#FF4D00]">Prove your taste.</span>
          </p>

          <p className="text-lg text-[#666] max-w-xl mb-12">
            A timestamp for taste. A credential for curators.
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
            <p className="text-[#22C55E] text-sm">You're in. Keep finding heat.</p>
          )}
          {status === 'error' && (
            <p className="text-[#EF4444] text-sm">Try again.</p>
          )}

        </div>
      </section>

      {/* Manifesto */}
      <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-[#222]">
        <div className="max-w-4xl">

          <p className="font-mono text-[#FF4D00] text-xs tracking-wider uppercase mb-8">
            Manifesto
          </p>

          <div className="space-y-8 text-lg text-[#999] leading-relaxed">
            <p>
              <span className="text-white font-medium">The problem isn't creation.</span>{' '}
              103,847 tracks upload daily. 44.7 million have never been played once.
              Algorithms optimize for engagement, not quality. The people who actually
              find music first—the ones whose playlists get stolen, whose taste gets
              mined—get nothing.
            </p>

            <p>
              <span className="text-white font-medium">Human taste is the last scarce resource.</span>{' '}
              In an age of infinite content, curation is creation. Your ear is an instrument.
              Your judgment has value. The question isn't what to listen to—it's who decides
              what's worth hearing.
            </p>

            <p>
              <span className="text-white font-medium">We're building proof.</span>{' '}
              A timestamp for taste. A record of what you knew before the algorithm caught up.
              Not another playlist app—a credential for curators. If you're right about music,
              we'll know. And eventually, so will everyone else.
            </p>
          </div>

        </div>
      </section>

      {/* The Numbers */}
      <section className="px-6 md:px-12 lg:px-24 py-24 bg-[#0A0A0A] border-t border-[#222]">
        <div className="max-w-6xl">

          <p className="font-mono text-[#FF4D00] text-xs tracking-wider uppercase mb-12">
            The Problem
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <p className="font-mono text-5xl md:text-6xl font-bold text-white mb-3">103,847</p>
              <p className="text-[#666] text-sm">tracks uploaded daily</p>
            </div>
            <div>
              <p className="font-mono text-5xl md:text-6xl font-bold text-white mb-3">44.7M</p>
              <p className="text-[#666] text-sm">tracks never played once</p>
            </div>
            <div>
              <p className="font-mono text-5xl md:text-6xl font-bold text-white mb-3">8.3%</p>
              <p className="text-[#666] text-sm">A&R success rate</p>
            </div>
          </div>

          <p className="mt-16 text-xl text-[#888] max-w-2xl">
            Labels spend $8.1 billion annually trying to predict hits. They fail 91.7% of the time.
            Meanwhile, the people with actual taste get nothing.
          </p>

        </div>
      </section>

      {/* For / Not For */}
      <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-[#222]">
        <div className="max-w-4xl">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">

            {/* For */}
            <div>
              <p className="font-mono text-[#FF4D00] text-xs tracking-wider uppercase mb-6">
                For
              </p>
              <ul className="space-y-4 text-[#ccc]">
                <li>The unpaid A&R of every friend group</li>
                <li>People who found artists before they were artists</li>
                <li>Curators whose playlists get stolen</li>
                <li>Anyone who cringes at "Discover Weekly"</li>
              </ul>
            </div>

            {/* Not For */}
            <div>
              <p className="font-mono text-[#555] text-xs tracking-wider uppercase mb-6">
                Not For
              </p>
              <ul className="space-y-4 text-[#666]">
                <li>People who let algorithms decide</li>
                <li>Passive listeners</li>
                <li>Anyone satisfied with what's "trending"</li>
                <li>Those who think music is "content"</li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 md:px-12 lg:px-24 py-24 bg-[#0A0A0A] border-t border-[#222]">
        <div className="max-w-4xl">

          <p className="font-mono text-[#FF4D00] text-xs tracking-wider uppercase mb-8">
            How It Works
          </p>

          <div className="space-y-12">
            <div className="flex gap-6">
              <span className="font-mono text-[#333] text-sm">01</span>
              <div>
                <h3 className="text-xl font-semibold mb-2">Battle</h3>
                <p className="text-[#888]">Head-to-head. AI generates unique remixes. You pick the winner.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <span className="font-mono text-[#333] text-sm">02</span>
              <div>
                <h3 className="text-xl font-semibold mb-2">Prove</h3>
                <p className="text-[#888]">The crowd validates your choices. Build your taste score.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <span className="font-mono text-[#333] text-sm">03</span>
              <div>
                <h3 className="text-xl font-semibold mb-2">Earn</h3>
                <p className="text-[#888]">Your taste trains our AI. Top curators earn equity.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 md:px-12 lg:px-24 py-32 border-t border-[#222]">
        <div className="max-w-4xl">

          <h2 className="font-display text-4xl md:text-6xl font-bold mb-4">
            Your taste is valid.
          </h2>

          <p className="text-[#888] text-xl mb-12 max-w-xl">
            We're building this with the first 1,247 curators.
          </p>

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
          <p className="text-[#555] text-sm">Your taste is valid.</p>
        </div>
      </footer>

    </div>
  );
}
