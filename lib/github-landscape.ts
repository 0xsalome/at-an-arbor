export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionData {
  total: {
    [year: string]: number;
  };
  contributions: Array<{
    date: string; // "YYYY-MM-DD"
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
  }>;
}

// Map contribution levels to "geological" ASCII textures
const TEXTURES = {
  0: [' ', ' ', '.', ' '],           // Void/Air/Light dust
  1: ['.', '..', ' .', '. '],        // Sand/Dirt
  2: ['+', '++', '+.', '.+'],        // Gravel
  3: ['*', '**', '#', '##'],         // Rock
  4: ['@', '%', '&', '$']            // Gem/Ore
};

// Colors for the layers (from surface to deep)
const DEPTH_COLORS = [
  'text-gray-400', // Surface
  'text-gray-500',
  'text-stone-500',
  'text-stone-600',
  'text-zinc-600',
  'text-zinc-700', // Deep
];

export async function fetchContributionData(username: string): Promise<ContributionData | null> {
  try {
    const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching contribution data:', error);
    return null;
  }
}

export function generateLandscape(data: ContributionData) {
  // Reverse to have today at the top (surface) and past at the bottom (deep)
  const days = [...data.contributions].reverse();
  
  return days.map((day, index) => {
    // Generate a pseudo-random texture variation based on date string
    const seed = day.date.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const textureSet = TEXTURES[day.level];
    const texture = textureSet[seed % textureSet.length];
    
    // Determine depth color
    const depthIndex = Math.min(Math.floor(index / 60), DEPTH_COLORS.length - 1);
    
    return {
      ...day,
      texture,
      color: DEPTH_COLORS[depthIndex],
      depth: index
    };
  });
}
