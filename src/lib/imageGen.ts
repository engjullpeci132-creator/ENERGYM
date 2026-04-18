/**
 * ENERGYM Static Asset Management
 * All assets are handled via standard Vite imports for production reliability.
 */

import hero from '../assets/images/hero.jpg';
import weights from '../assets/images/weights.jpg';
import cardio from '../assets/images/cardio.jpg';
import pool from '../assets/images/pool.jpg';
import yoga from '../assets/images/yoga.jpg';
import gymFloor from '../assets/images/gym-floor.jpg';

const STATIC_ASSETS: Record<string, string> = {
  'hero': hero,
  'bodybuilding': weights,
  'cardio': cardio,
  'pool': pool,
  'yoga': yoga,
  'luxury': gymFloor,
  'default': gymFloor
};

export async function generateGymImage(prompt: string) {
  // Matches prompt keywords to pre-generated static assets
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('pool') || lowerPrompt.includes('swim')) return STATIC_ASSETS['pool'];
  if (lowerPrompt.includes('yoga') || lowerPrompt.includes('zen')) return STATIC_ASSETS['yoga'];
  if (lowerPrompt.includes('weight') || lowerPrompt.includes('bodybuild') || lowerPrompt.includes('heavy')) return STATIC_ASSETS['bodybuilding'];
  if (lowerPrompt.includes('cardio') || lowerPrompt.includes('run') || lowerPrompt.includes('bike')) return STATIC_ASSETS['cardio'];
  if (lowerPrompt.includes('luxury') || lowerPrompt.includes('elite')) return STATIC_ASSETS['luxury'];
  if (lowerPrompt.includes('hero')) return STATIC_ASSETS['hero'];

  return STATIC_ASSETS['default'];
}
