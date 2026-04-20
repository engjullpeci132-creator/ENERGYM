/**
 * ENERGYM Static Asset Management
 * All assets are handled via standard Unsplash URLs for guaranteed CDN delivery.
 */

const STATIC_ASSETS: Record<string, string> = {
  'hero': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop',
  'bodybuilding': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1920&auto=format&fit=crop',
  'cardio': 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=1920&auto=format&fit=crop',
  'pool': 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=1920&auto=format&fit=crop',
  'yoga': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1920&auto=format&fit=crop',
  'luxury': 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1920&auto=format&fit=crop',
  'default': 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1920&auto=format&fit=crop'
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
