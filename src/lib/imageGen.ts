/**
 * ENERGYM Static Asset Management
 * All AI generation has been moved to one-time pre-generated assets in /public/assets/
 */

const STATIC_ASSETS: Record<string, string> = {
  'hero': '/images/hero.jpg',
  'bodybuilding': '/images/weights.jpg',
  'cardio': '/images/cardio.jpg',
  'pool': '/images/pool.jpg',
  'yoga': '/images/yoga.jpg',
  'luxury': '/images/gym-floor.jpg',
  'default': '/images/gym-floor.jpg'
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
