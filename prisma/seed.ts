/**
 * DROPR Database Seed Script
 *
 * Seeds the database with initial sounds and remixes.
 * Run with: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Brain Rot Sounds Library
const BRAIN_ROT_SOUNDS = [
  {
    name: 'Skibidi Toilet Theme',
    description: 'The viral Skibidi Toilet theme that took over the internet',
    category: 'BRAIN_ROT' as const,
    rarity: 'COMMON' as const,
    audioUrl: 'https://storage.dropr.io/sounds/skibidi-toilet.mp3',
    duration: 15000,
    bpm: 130,
    tags: ['viral', 'meme', 'skibidi'],
    viralScore: 95,
  },
  {
    name: 'Grimace Shake',
    description: 'The cursed Grimace Shake trend sound',
    category: 'BRAIN_ROT' as const,
    rarity: 'RARE' as const,
    audioUrl: 'https://storage.dropr.io/sounds/grimace-shake.mp3',
    duration: 12000,
    bpm: 110,
    tags: ['grimace', 'mcdonalds', 'cursed'],
    viralScore: 88,
  },
  {
    name: 'Only In Ohio',
    description: 'Ohio meme soundbite',
    category: 'BRAIN_ROT' as const,
    rarity: 'COMMON' as const,
    audioUrl: 'https://storage.dropr.io/sounds/only-in-ohio.mp3',
    duration: 8000,
    bpm: 120,
    tags: ['ohio', 'meme', 'regional'],
    viralScore: 82,
  },
  {
    name: 'Fanum Tax',
    description: 'The Fanum Tax voice line',
    category: 'BRAIN_ROT' as const,
    rarity: 'EPIC' as const,
    audioUrl: 'https://storage.dropr.io/sounds/fanum-tax.mp3',
    duration: 5000,
    bpm: 95,
    tags: ['fanum', 'streamer', 'tax'],
    viralScore: 90,
  },
  {
    name: 'Gyatt',
    description: 'The reaction sound that broke TikTok',
    category: 'BRAIN_ROT' as const,
    rarity: 'COMMON' as const,
    audioUrl: 'https://storage.dropr.io/sounds/gyatt.mp3',
    duration: 3000,
    bpm: 100,
    tags: ['gyatt', 'reaction', 'slang'],
    viralScore: 85,
  },
  {
    name: 'Its Corn',
    description: 'A big lump with knobs - the corn kid classic',
    category: 'BRAIN_ROT' as const,
    rarity: 'RARE' as const,
    audioUrl: 'https://storage.dropr.io/sounds/its-corn.mp3',
    duration: 20000,
    bpm: 115,
    tags: ['corn', 'autotune', 'wholesome'],
    viralScore: 78,
  },
  {
    name: 'Rizz Sound',
    description: 'The ultimate rizz confirmation sound',
    category: 'BRAIN_ROT' as const,
    rarity: 'COMMON' as const,
    audioUrl: 'https://storage.dropr.io/sounds/rizz.mp3',
    duration: 4000,
    bpm: 105,
    tags: ['rizz', 'w', 'charm'],
    viralScore: 87,
  },
  {
    name: 'Coconut Mall',
    description: 'Mario Kart Wii iconic track',
    category: 'CLASSIC' as const,
    rarity: 'LEGENDARY' as const,
    audioUrl: 'https://storage.dropr.io/sounds/coconut-mall.mp3',
    duration: 30000,
    bpm: 128,
    tags: ['mariokart', 'nintendo', 'classic'],
    viralScore: 92,
  },
  {
    name: 'Subway Surfers Theme',
    description: 'The game everyone plays while watching videos',
    category: 'VIRAL' as const,
    rarity: 'COMMON' as const,
    audioUrl: 'https://storage.dropr.io/sounds/subway-surfers.mp3',
    duration: 25000,
    bpm: 135,
    tags: ['subway', 'mobile', 'game'],
    viralScore: 80,
  },
  {
    name: 'Sigma Male Theme',
    description: 'Drive Forever - the sigma grindset anthem',
    category: 'VIRAL' as const,
    rarity: 'EPIC' as const,
    audioUrl: 'https://storage.dropr.io/sounds/sigma-male.mp3',
    duration: 20000,
    bpm: 118,
    tags: ['sigma', 'grindset', 'phonk'],
    viralScore: 89,
  },
];

// Remix genres with their characteristics
const REMIX_GENRES = ['TRAP', 'HOUSE', 'DUBSTEP', 'PHONK'] as const;

async function main() {
  console.log('Seeding DROPR database...\n');

  // Create sounds
  console.log('Creating sounds...');
  for (const soundData of BRAIN_ROT_SOUNDS) {
    const sound = await prisma.sound.upsert({
      where: {
        // Use name as unique identifier for seeding
        id: soundData.name.toLowerCase().replace(/\s+/g, '-'),
      },
      update: soundData,
      create: {
        id: soundData.name.toLowerCase().replace(/\s+/g, '-'),
        ...soundData,
      },
    });

    console.log(`  Created sound: ${sound.name}`);

    // Create remixes for each genre
    for (const genre of REMIX_GENRES) {
      const remixId = `${sound.id}-${genre.toLowerCase()}`;

      await prisma.remix.upsert({
        where: {
          soundId_genre: {
            soundId: sound.id,
            genre: genre,
          },
        },
        update: {},
        create: {
          id: remixId,
          soundId: sound.id,
          genre: genre,
          name: `${sound.name} (${genre} Remix)`,
          description: `AI-generated ${genre.toLowerCase()} version`,
          audioUrl: `https://storage.dropr.io/remixes/${remixId}.mp3`,
          duration: sound.duration,
          generatedBy: 'mock',
          prompt: `Create a ${genre.toLowerCase()} remix of ${sound.name}`,
        },
      });
    }
  }

  console.log('\nCreating daily challenges...');

  // Create some daily challenges
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const challenges = [
    {
      title: 'Battle Champion',
      description: 'Win 3 battles today',
      type: 'WIN_BATTLES' as const,
      targetValue: 3,
      hypeReward: 150,
    },
    {
      title: 'Brain Rot Master',
      description: 'Use Brain Rot category sounds in 5 battles',
      type: 'USE_SOUND_CATEGORY' as const,
      targetValue: 5,
      hypeReward: 100,
    },
    {
      title: 'Vote For Victory',
      description: 'Vote in 10 battles',
      type: 'VOTE_IN_BATTLES' as const,
      targetValue: 10,
      hypeReward: 75,
    },
  ];

  for (const challenge of challenges) {
    await prisma.dailyChallenge.upsert({
      where: {
        activeDate_type: {
          activeDate: today,
          type: challenge.type,
        },
      },
      update: challenge,
      create: {
        ...challenge,
        activeDate: today,
      },
    });
    console.log(`  Created challenge: ${challenge.title}`);
  }

  console.log('\nSeeding complete!');
  console.log(`  - ${BRAIN_ROT_SOUNDS.length} sounds created`);
  console.log(`  - ${BRAIN_ROT_SOUNDS.length * REMIX_GENRES.length} remixes created`);
  console.log(`  - ${challenges.length} daily challenges created`);
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
