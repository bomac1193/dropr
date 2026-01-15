'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Swords, Trophy, Zap, Users, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                DROPR
              </span>
            </h1>
          </motion.div>

          <p className="text-2xl md:text-3xl text-neutral-300 mb-4 font-medium">
            AI Music Battles on Roblox
          </p>

          <p className="text-lg text-neutral-500 mb-10 max-w-xl mx-auto leading-relaxed">
            Drop beats. Battle friends. Build your taste profile.
            The first AI-powered music battle experience where your votes shape what goes viral.
          </p>

          {/* Email Signup */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-5 py-4 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-colors"
              disabled={status === 'loading' || status === 'success'}
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {status === 'loading' ? 'Joining...' : status === 'success' ? 'You\'re In!' : 'Join Waitlist'}
            </button>
          </motion.form>

          {status === 'success' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-400 text-sm"
            >
              Thanks for joining! We'll notify you when DROPR launches.
            </motion.p>
          )}

          {status === 'error' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm"
            >
              Something went wrong. Please try again.
            </motion.p>
          )}

          <p className="text-neutral-600 text-sm mt-4">
            Coming soon to Roblox
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full px-4"
        >
          <FeatureCard
            icon={<Music className="w-7 h-7" />}
            title="AI-Generated Beats"
            description="Every battle features unique AI-generated remixes. No two drops are ever the same."
            gradient="from-cyan-500 to-blue-500"
          />
          <FeatureCard
            icon={<Swords className="w-7 h-7" />}
            title="Real-Time Battles"
            description="Go head-to-head with other players. Pick your remix, stake your taste, and let the crowd decide."
            gradient="from-violet-500 to-purple-500"
          />
          <FeatureCard
            icon={<Trophy className="w-7 h-7" />}
            title="Climb the Ranks"
            description="Build influence, earn hype points, and become a tastemaker in the DROPR community."
            gradient="from-fuchsia-500 to-pink-500"
          />
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-24 text-center max-w-4xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StepCard number={1} title="Join a Battle" description="Get matched with another player and a random sound drop" />
            <StepCard number={2} title="Pick Your Remix" description="Choose from AI-generated genre remixes of the sound" />
            <StepCard number={3} title="Crowd Votes" description="Spectators vote on which remix hits harder" />
            <StepCard number={4} title="Earn & Rise" description="Win battles, gain influence, shape what goes viral" />
          </div>
        </motion.div>

        {/* Stats/Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-24 flex flex-wrap justify-center gap-12 text-center"
        >
          <StatCard icon={<Zap />} value="Real-Time" label="Battle System" />
          <StatCard icon={<Users />} value="Multiplayer" label="Voting" />
          <StatCard icon={<Sparkles />} value="AI-Powered" label="Music Generation" />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-12 text-center border-t border-neutral-900">
        <p className="text-neutral-600 text-sm mb-2">
          DROPR • AI Music Battles
        </p>
        <p className="text-neutral-700 text-xs">
          Coming soon to Roblox
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 text-center hover:border-neutral-700 transition-colors"
    >
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} text-white mb-5`}>
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-3">{title}</h3>
      <p className="text-neutral-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white font-bold text-lg mb-4">
        {number}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-neutral-500 text-sm">{description}</p>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <div className="text-violet-400 mb-2 flex justify-center">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-neutral-500 text-sm">{label}</div>
    </div>
  );
}
