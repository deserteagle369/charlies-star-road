/**
 * 生成奖励合照 API
 * POST /api/generate-reward
 * Body: { city: string, username: string }
 * Uses Pollinations.ai (free, no API key required)
 */
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CITY_SCENES: Record<string, string> = {
  shanghai: 'Dreamy night scene of Shanghai skyline with glowing Oriental Pearl Tower, Huangpu River sparkling with lights, stars above, magical atmosphere',
  london: 'Charming London scene with Big Ben at dusk, red telephone booths, double-decker buses on cobblestone streets, warm golden lights',
  paris: 'Romantic Paris evening with Eiffel Tower sparkling, artistic café on cobblestone street, warm lamp glow, couples walking by the Seine',
  newyork: 'Electric New York night with Statue of Liberty in harbor, Times Square neon signs, city skyline, stars and city lights merging',
  tokyo: 'Enchanting Tokyo night with cherry blossom trees, traditional shrine lanterns, neon-lit streets, Mount Fuji in background, magical glow',
};

const CHARACTER_STYLES: Record<string, string> = {
  shanghai: 'Confident young traveler with warm smile',
  london: 'Elegant explorer with sophisticated style',
  paris: 'Romantic artist with creative aura',
  newyork: 'Fearless adventurer with confident stride',
  tokyo: 'Gentle dreamer with peaceful expression',
};

export async function POST(req: NextRequest) {
  try {
    const { city = 'shanghai', username = 'Explorer' } = await req.json();

    const scene = CITY_SCENES[city] || CITY_SCENES.shanghai;
    const charStyle = CHARACTER_STYLES[city] || CHARACTER_STYLES.shanghai;

    const prompt = `Cinematic portrait: ${charStyle} standing in ${scene}. The traveler is the focal point, glowing softly, wearing a starlight badge that says "Star Road". Dreamy lens flare, bokeh lights, movie poster composition, ultra detailed, 8K quality, magical realism. The overall feeling is inspiring and motivational, like a scene from an animated movie about chasing dreams.`;

    // URL-encode the prompt for Pollinations
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Date.now()}&nologo=true`;

    // Pre-warm: make a HEAD request to trigger generation
    // The URL itself is the full image URL, client can use it directly
    return NextResponse.json({
      imageUrl,
      city,
      username,
    });
  } catch (error: unknown) {
    console.error('Generate reward error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
