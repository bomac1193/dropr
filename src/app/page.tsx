'use client';

import { useState } from 'react';

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
    <div className="min-h-screen" style={{ background: 'var(--outlaw-black)' }}>

      {/* Hero Section */}
      <section
        className="min-h-screen flex flex-col justify-center items-center text-center px-8 relative overflow-hidden"
        style={{ background: 'var(--hero-gradient)' }}
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'var(--glow-gradient)', opacity: 0.5 }}
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          <p
            className="font-mono text-sm tracking-widest uppercase mb-8"
            style={{ color: 'var(--electric-cyan)' }}
          >
            The Taste Economy Is Here
          </p>

          <h1
            className="font-display text-gradient-hero glow-headline mb-8"
            style={{
              fontSize: 'var(--h1-size)',
              lineHeight: 'var(--h1-line-height)',
              letterSpacing: 'var(--h1-letter-spacing)',
              fontWeight: 'var(--h1-weight)'
            }}
          >
            BECAUSE TASTE PAYS
          </h1>

          <p
            className="mb-12 max-w-2xl mx-auto"
            style={{
              fontSize: 'var(--body-large)',
              lineHeight: 'var(--body-large-line-height)',
              color: 'var(--silver-mist)'
            }}
          >
            The first platform where music taste becomes equity. Battle with AI remixes,
            prove your judgment, earn stakes in the AI you're training.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="px-6 py-4 bg-transparent border-2 text-white placeholder-gray-500 focus:outline-none transition-colors w-full sm:w-80"
              style={{
                borderColor: 'rgba(0, 240, 255, 0.3)',
                borderRadius: '8px'
              }}
              disabled={status === 'loading' || status === 'success'}
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="cta-primary"
            >
              {status === 'success' ? 'YOU\'RE IN' : status === 'loading' ? 'JOINING...' : 'START EARNING FROM YOUR TASTE'}
            </button>
          </form>

          {status === 'success' && (
            <p style={{ color: 'var(--electric-cyan)' }} className="text-sm">Welcome to the taste economy.</p>
          )}
          {status === 'error' && (
            <p style={{ color: 'var(--power-pink)' }} className="text-sm">Something went wrong. Try again.</p>
          )}

          <p className="scarcity-indicator mt-8">
            Only 2,847 spots remaining
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-8 py-24 md:py-32" style={{ background: 'var(--outlaw-black)' }}>
        <div className="max-w-6xl mx-auto">
          <p
            className="font-mono text-sm tracking-widest uppercase mb-4"
            style={{ color: 'var(--power-pink)' }}
          >
            The Problem
          </p>

          <h2
            className="font-display mb-8"
            style={{
              fontSize: 'var(--h2-size)',
              lineHeight: 'var(--h2-line-height)',
              letterSpacing: 'var(--h2-letter-spacing)',
              fontWeight: 'var(--h2-weight)',
              color: 'var(--pure-white)'
            }}
          >
            The $8.1 Billion Discovery Problem
          </h2>

          <p
            className="mb-16 max-w-3xl"
            style={{
              fontSize: 'var(--body-large)',
              lineHeight: 'var(--body-large-line-height)',
              color: 'var(--silver-mist)'
            }}
          >
            Labels spend billions trying to predict hits. They fail 90% of the time.
            Meanwhile, millions of fans with perfect taste get nothing for the value they create.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="stat-card">
              <span className="stat-number">100K</span>
              <p
                className="mt-4 text-center"
                style={{ color: 'var(--silver-mist)', fontSize: 'var(--body-regular)' }}
              >
                songs uploaded daily
              </p>
            </div>
            <div className="stat-card">
              <span className="stat-number">45M</span>
              <p
                className="mt-4 text-center"
                style={{ color: 'var(--silver-mist)', fontSize: 'var(--body-regular)' }}
              >
                tracks never heard once
              </p>
            </div>
            <div className="stat-card">
              <span className="stat-number">10%</span>
              <p
                className="mt-4 text-center"
                style={{ color: 'var(--silver-mist)', fontSize: 'var(--body-regular)' }}
              >
                A&R hit rate
              </p>
            </div>
          </div>

          <p
            className="mt-12 text-center font-display"
            style={{
              fontSize: 'var(--h3-size)',
              color: 'var(--power-pink)'
            }}
          >
            The industry doesn't need more music. It needs better taste signals.
          </p>
        </div>
      </section>

      {/* Solution Section */}
      <section
        className="px-8 py-24 md:py-32"
        style={{
          background: 'linear-gradient(180deg, var(--midnight-blue) 0%, var(--outlaw-black) 100%)'
        }}
      >
        <div className="max-w-6xl mx-auto">
          <p
            className="font-mono text-sm tracking-widest uppercase mb-4"
            style={{ color: 'var(--electric-cyan)' }}
          >
            The Solution
          </p>

          <h2
            className="font-display mb-8"
            style={{
              fontSize: 'var(--h2-size)',
              lineHeight: 'var(--h2-line-height)',
              letterSpacing: 'var(--h2-letter-spacing)',
              fontWeight: 'var(--h2-weight)',
              color: 'var(--pure-white)'
            }}
          >
            How Taste Becomes Currency
          </h2>

          <p
            className="mb-16 max-w-3xl"
            style={{
              fontSize: 'var(--body-large)',
              lineHeight: 'var(--body-large-line-height)',
              color: 'var(--silver-mist)'
            }}
          >
            DROPR transforms music curation from passive consumption into active investment.
            Your choices train AI. Your accuracy earns equity.
          </p>

          <div className="space-y-8">
            <div className="step-card">
              <div className="flex items-start gap-6">
                <span
                  className="font-mono text-2xl font-bold"
                  style={{ color: 'var(--electric-cyan)' }}
                >
                  01
                </span>
                <div>
                  <h3
                    className="font-display mb-2"
                    style={{ fontSize: 'var(--h3-size)', fontWeight: 'var(--h3-weight)' }}
                  >
                    BATTLE
                  </h3>
                  <p style={{ color: 'var(--silver-mist)', fontSize: 'var(--body-regular)' }}>
                    Compete in head-to-head remix battles. AI generates unique versions. You choose the winner.
                  </p>
                </div>
              </div>
            </div>

            <div className="step-card">
              <div className="flex items-start gap-6">
                <span
                  className="font-mono text-2xl font-bold"
                  style={{ color: 'var(--electric-cyan)' }}
                >
                  02
                </span>
                <div>
                  <h3
                    className="font-display mb-2"
                    style={{ fontSize: 'var(--h3-size)', fontWeight: 'var(--h3-weight)' }}
                  >
                    PROVE
                  </h3>
                  <p style={{ color: 'var(--silver-mist)', fontSize: 'var(--body-regular)' }}>
                    Your choices are validated by the crowd. Build your taste score. Develop your unique profile.
                  </p>
                </div>
              </div>
            </div>

            <div className="step-card">
              <div className="flex items-start gap-6">
                <span
                  className="font-mono text-2xl font-bold"
                  style={{ color: 'var(--electric-cyan)' }}
                >
                  03
                </span>
                <div>
                  <h3
                    className="font-display mb-2"
                    style={{ fontSize: 'var(--h3-size)', fontWeight: 'var(--h3-weight)' }}
                  >
                    EARN
                  </h3>
                  <p style={{ color: 'var(--silver-mist)', fontSize: 'var(--body-regular)' }}>
                    Every battle trains our AI. Top curators earn equity stakes. Your taste literally pays you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="px-8 py-24 md:py-32" style={{ background: 'var(--outlaw-black)' }}>
        <div className="max-w-6xl mx-auto">
          <p
            className="font-mono text-sm tracking-widest uppercase mb-4 text-center"
            style={{ color: 'var(--magician-purple)' }}
          >
            The Opportunity
          </p>

          <h2
            className="font-display mb-16 text-center"
            style={{
              fontSize: 'var(--h2-size)',
              lineHeight: 'var(--h2-line-height)',
              letterSpacing: 'var(--h2-letter-spacing)',
              fontWeight: 'var(--h2-weight)',
              color: 'var(--pure-white)'
            }}
          >
            Why Your Taste Is Worth Money
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="value-card">
              <div
                className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(123, 47, 190, 0.2)', border: '2px solid var(--magician-purple)' }}
              >
                <span className="text-2xl" style={{ color: 'var(--electric-cyan)' }}>01</span>
              </div>
              <h3
                className="font-display mb-4"
                style={{ fontSize: '24px', fontWeight: 700, color: 'var(--pure-white)' }}
              >
                First-Mover Advantage
              </h3>
              <p style={{ color: 'var(--silver-mist)', fontSize: 'var(--body-regular)' }}>
                Early curators get the highest equity allocation. The taste economy rewards pioneers.
              </p>
            </div>

            <div className="value-card">
              <div
                className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(123, 47, 190, 0.2)', border: '2px solid var(--magician-purple)' }}
              >
                <span className="text-2xl" style={{ color: 'var(--electric-cyan)' }}>02</span>
              </div>
              <h3
                className="font-display mb-4"
                style={{ fontSize: '24px', fontWeight: 700, color: 'var(--pure-white)' }}
              >
                Proven Track Record
              </h3>
              <p style={{ color: 'var(--silver-mist)', fontSize: 'var(--body-regular)' }}>
                Your public taste score becomes your credential. Labels and artists can find you.
              </p>
            </div>

            <div className="value-card">
              <div
                className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(123, 47, 190, 0.2)', border: '2px solid var(--magician-purple)' }}
              >
                <span className="text-2xl" style={{ color: 'var(--electric-cyan)' }}>03</span>
              </div>
              <h3
                className="font-display mb-4"
                style={{ fontSize: '24px', fontWeight: 700, color: 'var(--pure-white)' }}
              >
                Real Ownership
              </h3>
              <p style={{ color: 'var(--silver-mist)', fontSize: 'var(--body-regular)' }}>
                Not points. Not rewards. Actual equity in the AI model your taste helps train.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section
        className="px-8 py-24 md:py-32"
        style={{
          background: 'linear-gradient(180deg, var(--dark-purple) 0%, var(--outlaw-black) 100%)'
        }}
      >
        <div className="max-w-6xl mx-auto">
          <p
            className="font-mono text-sm tracking-widest uppercase mb-4 text-center"
            style={{ color: 'var(--power-pink)' }}
          >
            Early Curators
          </p>

          <h2
            className="font-display mb-16 text-center"
            style={{
              fontSize: 'var(--h2-size)',
              lineHeight: 'var(--h2-line-height)',
              letterSpacing: 'var(--h2-letter-spacing)',
              fontWeight: 'var(--h2-weight)',
              color: 'var(--pure-white)'
            }}
          >
            Taste Is Already Paying
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="testimonial-card">
              <p
                className="mb-6 italic"
                style={{ fontSize: 'var(--body-large)', color: 'var(--silver-mist)' }}
              >
                "Finally, a platform that values what I actually know—not just what I consume.
                My taste score is my new resume."
              </p>
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full"
                  style={{ background: 'var(--cta-gradient)' }}
                />
                <div>
                  <p className="font-display font-bold">@SoundHunter</p>
                  <p style={{ color: 'var(--silver-mist)', fontSize: '14px' }}>Trendsetter Rank #47</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p
                className="mb-6 italic"
                style={{ fontSize: 'var(--body-large)', color: 'var(--silver-mist)' }}
              >
                "I've been discovering underground artists for years. Now I can prove it—and
                earn from it. This changes everything."
              </p>
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full"
                  style={{ background: 'var(--cta-gradient)' }}
                />
                <div>
                  <p className="font-display font-bold">@BeatDigger</p>
                  <p style={{ color: 'var(--silver-mist)', fontSize: '14px' }}>Chaos Agent Rank #12</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section
        className="px-8 py-32 text-center relative overflow-hidden"
        style={{ background: 'var(--hero-gradient)' }}
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'var(--glow-gradient)', opacity: 0.3 }}
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          <h2
            className="font-display text-gradient-cta glow-pink mb-8"
            style={{
              fontSize: 'var(--h2-size)',
              lineHeight: 'var(--h2-line-height)',
              letterSpacing: 'var(--h2-letter-spacing)',
              fontWeight: 'var(--h2-weight)'
            }}
          >
            Because taste pays.
          </h2>

          <p
            className="mb-12 max-w-2xl mx-auto"
            style={{
              fontSize: 'var(--body-large)',
              lineHeight: 'var(--body-large-line-height)',
              color: 'var(--silver-mist)'
            }}
          >
            Join the first generation of compensated curators.
            The taste economy won't wait.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="px-6 py-4 bg-transparent border-2 text-white placeholder-gray-500 focus:outline-none transition-colors w-full sm:w-80"
              style={{
                borderColor: 'rgba(0, 240, 255, 0.3)',
                borderRadius: '8px'
              }}
              disabled={status === 'loading' || status === 'success'}
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="cta-primary"
            >
              {status === 'success' ? 'YOU\'RE IN' : status === 'loading' ? 'JOINING...' : 'CLAIM YOUR SPOT'}
            </button>
          </form>

          <p className="scarcity-indicator">
            Only 2,847 spots remaining
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-8 py-12 border-t"
        style={{
          background: 'var(--outlaw-black)',
          borderColor: 'var(--dark-purple)'
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-display font-bold text-2xl" style={{ color: 'var(--pure-white)' }}>
            DROPR
          </p>
          <p style={{ color: 'var(--silver-mist)', fontSize: '14px' }}>
            Built by VIOLET SPHINX
          </p>
        </div>
      </footer>

    </div>
  );
}
