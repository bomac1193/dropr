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
    <main className="page-container">

      {/* Header - Wordmark */}
      <header className="animate delay-1" style={{ marginBottom: 'var(--space-5xl)' }}>
        <span className="wordmark">DROPR</span>
      </header>

      {/* Tagline */}
      <section className="animate delay-2" style={{ marginBottom: 'var(--space-4xl)' }}>
        <h1 className="hero-tagline">
          Drop heat.<br />
          <span style={{ color: 'var(--color-accent)' }}>Prove your taste.</span>
        </h1>
      </section>

      {/* Manifesto Section */}
      <section className="animate delay-3" style={{ marginBottom: 'var(--space-4xl)' }}>
        <p className="section-label">Manifesto</p>

        <div className="body-text" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <p>
            <span className="body-emphasis">The problem isn't creation.</span>{' '}
            100,000 tracks upload daily. 45 million have never been played once.
            Algorithms optimize for engagement, not quality. The people who actually
            find music first—the ones whose playlists get stolen, whose taste gets
            mined—get nothing.
          </p>

          <p>
            <span className="body-emphasis">Human taste is the last scarce resource.</span>{' '}
            In an age of infinite content, curation is creation. Your ear is an instrument.
            Your judgment has value. The question isn't what to listen to—it's who decides
            what's worth hearing.
          </p>

          <p>
            <span className="body-emphasis">We're building proof.</span>{' '}
            A timestamp for taste. A record of what you knew before the algorithm caught up.
            Not another playlist app—a credential for curators. If you're right about music,
            we'll know. And eventually, so will everyone else.
          </p>
        </div>
      </section>

      {/* Gold Divider */}
      <div className="animate delay-4 divider-gold" style={{ marginBottom: 'var(--space-3xl)' }} />

      {/* For / Not For Grid */}
      <section className="animate delay-5" style={{ marginBottom: 'var(--space-4xl)' }}>
        <div className="for-grid">
          {/* For Column */}
          <div>
            <p className="for-label">For</p>
            <ul className="list-text" style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              color: 'var(--color-text)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-xs)'
            }}>
              <li>The unpaid A&R of every friend group</li>
              <li>People who found artists before they were artists</li>
              <li>Curators whose playlists get stolen</li>
              <li>Anyone who cringes at "Discover Weekly"</li>
            </ul>
          </div>

          {/* Not For Column */}
          <div>
            <p className="not-for-label">Not For</p>
            <ul className="list-text" style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              color: 'var(--color-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-xs)'
            }}>
              <li>People who let algorithms decide</li>
              <li>Passive listeners</li>
              <li>Anyone satisfied with what's "trending"</li>
              <li>Those who think music is "content"</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="animate delay-6" style={{ marginBottom: 'var(--space-4xl)' }}>
        <p className="section-label-no-border">Early Access</p>

        {status === 'success' ? (
          <div className="success-box">
            <p className="for-label" style={{ marginBottom: 'var(--space-sm)' }}>You're in</p>
            <p className="body-text">
              We'll be in touch. In the meantime, keep finding heat.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="cta-input"
              disabled={status === 'loading'}
              required
              aria-label="Email address"
              style={{ marginBottom: 'var(--space-lg)' }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="cta-button"
              style={{ marginBottom: 'var(--space-md)' }}
            >
              {status === 'loading' ? 'Joining...' : 'Get Early Access'}
            </button>
            <p className="micro-text" style={{ color: '#444444' }}>
              Limited spots. We're building this with the first 1,000.
            </p>
            {status === 'error' && (
              <p className="micro-text" style={{ color: '#AA4444', marginTop: 'var(--space-sm)' }}>
                Something went wrong. Try again.
              </p>
            )}
          </form>
        )}
      </section>

      {/* Footer */}
      <footer
        className="animate delay-7"
        style={{
          marginTop: 'var(--space-7xl)',
          paddingTop: 'var(--space-xl)',
          borderTop: '1px solid var(--color-border-subtle)'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-md)'
        }}>
          <span className="footer-text">© 2025 DROPR</span>
          <span className="footer-text">Your taste is valid.</span>
        </div>
      </footer>

    </main>
  );
}
