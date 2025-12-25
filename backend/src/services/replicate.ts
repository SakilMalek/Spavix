import Replicate from 'replicate';
import sharp from 'sharp';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

if (!REPLICATE_API_TOKEN) {
  console.warn('⚠️  REPLICATE_API_TOKEN not set. Image generation will use demo mode.');
}

const replicate = REPLICATE_API_TOKEN ? new Replicate({ auth: REPLICATE_API_TOKEN }) : null;

export class ReplicateService {
  private static readonly MODEL = 'black-forest-labs/flux-schnell';

  static async generateImage(prompt: string): Promise<Buffer> {
    try {
      if (!replicate) {
        throw new Error('Replicate API token not configured');
      }

      console.log('Using Replicate model:', this.MODEL);
      console.log('Sending request to Replicate API...');

      const output = await replicate.run(this.MODEL, {
        input: {
          prompt: prompt,
          height: 512,
          width: 512,
          num_outputs: 1,
          num_inference_steps: 4,
        },
      });

      console.log('Replicate API response:', output);

      // output is an array of URLs
      if (!Array.isArray(output) || output.length === 0) {
        throw new Error('No image generated from Replicate');
      }

      const imageUrl = output[0];
      console.log('Generated image URL:', imageUrl);

      // Fetch the image from the URL and convert to buffer
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);

      console.log('Image fetched successfully, size:', imageBuffer.length);
      return imageBuffer;
    } catch (error: any) {
      const errorMessage = error.message || JSON.stringify(error);
      console.error('Replicate generation error:', errorMessage);

      // Check if it's a credit/payment error
      if (errorMessage.includes('402') || errorMessage.includes('Insufficient credit') || errorMessage.includes('Payment Required')) {
        console.log('⚠️  Insufficient Replicate credits. Using demo placeholder image.');
        console.log('💡 To add credits, visit: https://replicate.com/account/billing#billing');
      } else {
        console.log('⚠️  Replicate API unavailable. Using demo placeholder image.');
      }

      // Fall back to demo mode with a placeholder image
      return this.generateDemoImage();
    }
  }

  private static async generateDemoImage(): Promise<Buffer> {
    // Create a gradient placeholder image instead of solid gray
    const width = 512;
    const height = 512;

    // Create a simple gradient image using sharp
    const svgImage = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#e5e7eb;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#9ca3af;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#grad1)"/>
        <text x="50%" y="50%" font-size="24" fill="#374151" text-anchor="middle" dominant-baseline="middle" font-family="Arial">
          Demo Image
        </text>
      </svg>
    `;

    const demoImage = await sharp(Buffer.from(svgImage)).png().toBuffer();
    return demoImage;
  }

  static buildPrompt(
    roomType: string,
    style: string,
    materials: {
      wallColor?: string;
      floorType?: string;
      curtainType?: string;
      lightingMood?: string;
      accentWall?: string;
    }
  ): string {
    const materialDescriptions: string[] = [];

    if (materials.wallColor) {
      materialDescriptions.push(`walls in ${materials.wallColor}`);
    }
    if (materials.accentWall) {
      materialDescriptions.push(`accent wall in ${materials.accentWall}`);
    }
    if (materials.floorType) {
      materialDescriptions.push(`${materials.floorType} flooring`);
    }
    if (materials.curtainType) {
      materialDescriptions.push(`${materials.curtainType} curtains`);
    }

    const lightingDesc = materials.lightingMood
      ? `${materials.lightingMood} lighting`
      : 'natural lighting';

    const materialSection = materialDescriptions.length > 0 ? materialDescriptions.join(', ') : 'modern finishes';

    return `Transform this ${roomType} into a ${style} interior design. 
    Features: ${materialSection}. 
    Lighting: ${lightingDesc}. 
    Keep the same room layout, doors, and windows. 
    Photorealistic, high-quality, professional interior design render, 8K resolution.`;
  }
}
