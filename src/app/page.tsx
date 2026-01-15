'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Disc3, Swords, Crown, TrendingUp, Users, Sparkles, ChevronRight, Check } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
        {/* Background glow effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative text-center max-w-4xl z-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#171717] border border-[#404040] rounded-full text-sm text-[#A1A1AA] mb-8"
          >
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Coming to Roblox
          </motion.div>

          {/* Logo */}
          <h1 className="font-display text-7xl md:text-9xl font-bold tracking-tighter mb-6">
            <span className="text-gradient-hero">DROPR</span>
          </h1>

          {/* Tagline */}
          <p className="text-2xl md:text-4xl text-[#FAFAFA] font-display font-medium mb-4">
            Where Taste Becomes Status
          </p>

          <p className="text-lg md:text-xl text-[#A1A1AA] max-w-2xl mx-auto mb-10 leading-relaxed">
            The algorithm is dead. In DROPR, <span className="text-white">you</span> decide what goes viral.
            Battle friends with AI-generated beats and prove your taste to the world.
          </p>

          {/* Email Signup */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-6"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 bg-[#171717] border border-[#404040] rounded-xl text-white placeholder-[#71717A] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              disabled={status === 'loading' || status === 'success'}
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="group px-8 py-4 bg-gradient-primary rounded-xl font-semibold text-white hover-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                'Joining...'
              ) : status === 'success' ? (
                <>
                  <Check className="w-5 h-5" />
                  You're In
                </>
              ) : (
                <>
                  Get Early Access
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.form>

          {status === 'success' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-emerald-400 text-sm"
            >
              You're on the list. We'll hit you up when it's time to drop.
            </motion.p>
          )}

          {status === 'error' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm"
            >
              Something went wrong. Try again.
            </motion.p>
          )}

          {status === 'idle' && (
            <p className="text-[#71717A] text-sm">
              Join 0 others waiting for launch
            </p>
          )}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-[#404040] rounded-full flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-2 bg-[#A1A1AA] rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Problem Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#8B5CF6] font-mono text-sm tracking-wider uppercase mb-4">The Problem</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Music Discovery is <span className="text-gradient-primary">Broken</span>
            </h2>
            <p className="text-[#A1A1AA] text-lg max-w-2xl mx-auto">
              Algorithms decide what you hear. Influencers decide what goes viral.
              Your taste? Just data they extract and sell.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProblemCard
              number="01"
              title="Echo Chambers"
              description="Algorithms feed you what you already like. Nothing challenges you. Nothing surprises you."
            />
            <ProblemCard
              number="02"
              title="Zero Agency"
              description="What goes viral is decided by curators and labels. You're just a passive consumer."
            />
            <ProblemCard
              number="03"
              title="Taste ≠ Identity"
              description="Music used to say something about you. Now it's just background noise picked by an algorithm."
            />
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="relative py-24 px-6 bg-[#0D0D0D]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#06B6D4] font-mono text-sm tracking-wider uppercase mb-4">The Solution</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Make Taste a <span className="text-gradient-secondary">Competitive Sport</span>
            </h2>
            <p className="text-[#A1A1AA] text-lg max-w-2xl mx-auto">
              DROPR turns music discovery into a game. Battle friends. Prove your taste.
              Rise the ranks. You decide what goes viral.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Disc3 className="w-6 h-6" />}
              title="AI Beats"
              description="Every battle features unique AI-generated remixes. EDM, Lo-Fi, Trap—same sound, infinite versions."
              color="cyan"
            />
            <FeatureCard
              icon={<Swords className="w-6 h-6" />}
              title="1v1 Battles"
              description="Face off against other players. Pick your remix. Let the crowd decide who has better taste."
              color="violet"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Crowd Votes"
              description="No algorithm. No curators. The audience votes on every battle. Democracy of taste."
              color="pink"
            />
            <FeatureCard
              icon={<Crown className="w-6 h-6" />}
              title="Rise Up"
              description="Win battles. Gain influence. Climb the leaderboard. Become a tastemaker."
              color="amber"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#EC4899] font-mono text-sm tracking-wider uppercase mb-4">Gameplay</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold">
              How It <span className="text-gradient-primary">Works</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StepCard
              number={1}
              title="Join Battle"
              description="Get matched with another player and a random sound drop"
            />
            <StepCard
              number={2}
              title="Pick Remix"
              description="Choose from AI-generated genre remixes of the sound"
            />
            <StepCard
              number={3}
              title="Crowd Votes"
              description="Spectators vote on which remix hits harder"
            />
            <StepCard
              number={4}
              title="Win & Rise"
              description="Earn influence, climb ranks, shape what goes viral"
            />
          </div>
        </div>
      </section>

      {/* PULSE Archetypes */}
      <section className="relative py-24 px-6 bg-[#0D0D0D]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#8B5CF6] font-mono text-sm tracking-wider uppercase mb-4">Your Identity</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Discover Your <span className="text-gradient-hero">Taste Archetype</span>
            </h2>
            <p className="text-[#A1A1AA] text-lg max-w-2xl mx-auto">
              Your battles reveal your taste DNA. Which archetype are you?
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ArchetypeCard name="Trendsetter" title="The Prophet" description="First to spot winners" />
            <ArchetypeCard name="Purist" title="The Scholar" description="Deep genre knowledge" />
            <ArchetypeCard name="Chaos Agent" title="The Wildcard" description="Loves the upset" />
            <ArchetypeCard name="Crowd Surfer" title="The Vibe Reader" description="Reads the room" />
            <ArchetypeCard name="Architect" title="The Engineer" description="Values production" />
            <ArchetypeCard name="Mood Shifter" title="The Empath" description="Context is everything" />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-violet-600/10 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Ready to <span className="text-gradient-hero">Prove Your Taste</span>?
            </h2>
            <p className="text-[#A1A1AA] text-xl mb-10">
              Join the waitlist. Be first to drop when we launch on Roblox.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 bg-[#171717] border border-[#404040] rounded-xl text-white placeholder-[#71717A] focus:outline-none focus:border-violet-500 transition-all"
                disabled={status === 'loading' || status === 'success'}
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="px-8 py-4 bg-gradient-primary rounded-xl font-semibold hover-glow transition-all disabled:opacity-50"
              >
                {status === 'success' ? "You're In" : 'Join Waitlist'}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display font-bold text-xl text-gradient-hero">DROPR</div>
          <p className="text-[#71717A] text-sm">
            The algorithm is dead. Long live taste.
          </p>
          <p className="text-[#404040] text-xs">
            Built by VIOLET SPHINX
          </p>
        </div>
      </footer>
    </div>
  );
}

function ProblemCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-[#171717] border border-[#262626] rounded-2xl p-8 hover:border-[#404040] transition-colors"
    >
      <span className="font-mono text-[#404040] text-sm">{number}</span>
      <h3 className="font-display font-semibold text-xl mt-2 mb-3">{title}</h3>
      <p className="text-[#A1A1AA] leading-relaxed">{description}</p>
    </motion.div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
  const colorClasses = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="bg-[#171717] border border-[#262626] rounded-2xl p-6 hover:border-[#404040] transition-all"
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border ${colorClasses[color as keyof typeof colorClasses]} mb-4`}>
        {icon}
      </div>
      <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
      <p className="text-[#A1A1AA] text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: number * 0.1 }}
      className="text-center"
    >
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-primary text-white font-display font-bold text-xl mb-4 glow-primary">
        {number}
      </div>
      <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
      <p className="text-[#71717A] text-sm">{description}</p>
    </motion.div>
  );
}

function ArchetypeCard({ name, title, description }: { name: string; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className="bg-[#171717] border border-[#262626] rounded-xl p-5 hover:border-violet-500/30 transition-all cursor-pointer"
    >
      <p className="text-[#8B5CF6] font-mono text-xs uppercase tracking-wider mb-1">{name}</p>
      <h3 className="font-display font-semibold text-white mb-1">{title}</h3>
      <p className="text-[#71717A] text-sm">{description}</p>
    </motion.div>
  );
}
