/**
 * 生成奖励合照 API
 * POST /api/generate-reward
 * Body: { photoBase64: string, city: string, username: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openai';

export const dynamic = 'force-dynamic';

const CITY_SCENES: Record<string, string> = {
  shanghai: 'Shanghai skyline at night with Oriental Pearl Tower, neon lights, and Huangpu River',
  london: 'London cityscape with Big Ben, red telephone booths, and double-decker buses',
  paris: 'Paris streetscape with Eiffel Tower, artistic café atmosphere, warm golden hour light',
  newyork: 'New York City view with Statue of Liberty, Times Square lights, urban energy',
  tokyo: 'Tokyo scene with cherry blossoms, traditional shrine, neon-lit streets blending old and new',
};

export async function POST(req: NextRequest) {
  try {
    const { photoBase64, city = 'shanghai', username = 'Explorer' } = await req.json();

    if (!photoBase64) {
      return NextResponse.json({ error: 'Missing photoBase64' }, { status: 400 });
    }

    const scene = CITY_SCENES[city] || CITY_SCENES.shanghai;

    const response = await openai.images.edit({
      model: 'dall-e-3',
      image: photoBase64,
      prompt: `Create an artistic travel portrait: The user is standing in ${scene}.
The user's photo should be naturally integrated into this beautiful scene.
Maintain the user's facial features and appearance.
Add artistic effects like soft lighting, color grading, and subtle magical sparkle effects.
Add a small decorative element: a star badge with "Charlie's Star Road" logo.
Overall style: dreamy, warm, motivational, like a movie poster.
Resolution: 1024x1024, high quality, vibrant colors.`,
      n: 1,
      size: '1024x1024',
    });

    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }

    return NextResponse.json({ imageUrl });
  } catch (error: unknown) {
    console.error('Generate reward error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
