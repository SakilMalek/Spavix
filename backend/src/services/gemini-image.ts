import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the correct path to the Python script
// __dirname = dist/services, need to go up 3 levels to backend root
// dist/services -> dist -> src -> backend
const GEMINI_SCRIPT_PATH = path.join(__dirname, '..', '..', '..', 'gemini_image_generate.py');

export class GeminiImageService {
  static async generateImage(prompt: string, inputImageUrl: string): Promise<Buffer> {
    try {
      console.log('Using Gemini 2.5 Flash Image (img2img)');
      console.log('Prompt:', prompt);

      // Create backend_output directory if it doesn't exist
      const outputDir = path.join(process.cwd(), '..', 'backend_output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Generate unique filenames
      const timestamp = Date.now();
      const inputPath = path.join(outputDir, `input_${timestamp}.jpg`);
      const outputPath = path.join(outputDir, `output_${timestamp}.png`);

      // Convert base64 input image to file
      await this.saveBase64Image(inputImageUrl, inputPath);

      // Run the Python script with input image
      const imageBuffer = await this.runGeminiGeneration(prompt, inputPath, outputPath);

      // Keep the files for inspection (don't delete)
      console.log(`✅ Input image saved: ${inputPath}`);
      console.log(`✅ Output image saved: ${outputPath}`);
      console.log('Image generated successfully, size:', imageBuffer.length);
      
      return imageBuffer;
    } catch (error: any) {
      const errorMessage = error.message || JSON.stringify(error);
      console.error('Gemini generation error:', errorMessage);
      console.log('⚠️  Using demo placeholder image.');

      // Fall back to demo mode
      return this.generateDemoImage();
    }
  }

  private static async saveBase64Image(base64Url: string, outputPath: string): Promise<void> {
    // Extract base64 data from data URL
    const base64Data = base64Url.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Save to file
    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`Saved input image to: ${outputPath}`);
  }

  private static async runGeminiGeneration(prompt: string, inputPath: string, outputPath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // Verify API key is loaded
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        reject(new Error('GEMINI_API_KEY not found in environment variables'));
        return;
      }
      
      console.log(`[Gemini] API Key loaded: ${apiKey.substring(0, 10)}...`);
      console.log(`[Gemini] Input path: ${inputPath}`);
      console.log(`[Gemini] Output path: ${outputPath}`);
      console.log(`[Gemini] Script path: ${GEMINI_SCRIPT_PATH}`);
      console.log(`[Gemini] Script exists: ${fs.existsSync(GEMINI_SCRIPT_PATH)}`);
      console.log(`[Gemini] __dirname: ${__dirname}`);
      console.log(`[Gemini] process.cwd(): ${process.cwd()}`);
      
      // Check if script exists, if not try alternative paths
      let scriptPath = GEMINI_SCRIPT_PATH;
      if (!fs.existsSync(scriptPath)) {
        const alternativePath = path.join(process.cwd(), 'gemini_image_generate.py');
        if (fs.existsSync(alternativePath)) {
          console.log(`[Gemini] Using alternative script path: ${alternativePath}`);
          scriptPath = alternativePath;
        }
      }
      
      const pythonProcess = spawn('python', [
        scriptPath,
        '--prompt',
        prompt,
        '--input',
        inputPath,
        '--output',
        outputPath,
      ], {
        env: {
          ...process.env,
          GEMINI_API_KEY: apiKey,
          PYTHONUNBUFFERED: '1'
        }
        // Remove shell: true - it breaks argument parsing on Windows
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout?.on('data', (data) => {
        stdout += data.toString();
        console.log('[Gemini]', data.toString().trim());
      });

      pythonProcess.stderr?.on('data', (data) => {
        stderr += data.toString();
        console.log('[Gemini]', data.toString().trim());
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${stderr}`));
          return;
        }

        // Read the generated image
        if (!fs.existsSync(outputPath)) {
          reject(new Error('Output image file not created'));
          return;
        }

        try {
          const imageBuffer = fs.readFileSync(outputPath);
          resolve(imageBuffer);
        } catch (error) {
          reject(error);
        }
      });

      pythonProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  private static async generateDemoImage(): Promise<Buffer> {
    // Create a gradient placeholder image
    const width = 512;
    const height = 512;

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
    },
    budgetLevel: string = 'medium'
  ): string {
    // Build material descriptions
    const materialDescriptions: string[] = [];

    if (materials.wallColor) {
      materialDescriptions.push(`${materials.wallColor} walls`);
    }
    if (materials.accentWall && materials.accentWall !== 'none') {
      materialDescriptions.push(`${materials.accentWall} accent wall`);
    }
    if (materials.floorType) {
      materialDescriptions.push(`${materials.floorType} flooring`);
    }
    if (materials.curtainType && materials.curtainType !== 'none') {
      materialDescriptions.push(`${materials.curtainType} curtains`);
    }

    const lightingDesc = materials.lightingMood
      ? `${materials.lightingMood} lighting`
      : 'natural lighting';

    const materialSection = materialDescriptions.length > 0 
      ? materialDescriptions.join(', ') 
      : 'modern finishes';

    // Enhanced prompt - PRESERVE STRUCTURE, CHANGE AESTHETICS ONLY
    return `IMPORTANT: Keep the exact same room layout, structure, and furniture placement. Only update the colors, materials, and lighting.

Redesign this ${roomType} in ${style} style with these changes:

PRESERVE:
- Keep the exact same room layout and dimensions
- Keep all existing furniture in the same positions
- Keep doors, windows, and walls in the same locations
- Maintain the overall spatial arrangement

CHANGE ONLY:
- Wall colors: ${materials.wallColor || 'neutral tones'}
${materials.accentWall && materials.accentWall !== 'none' ? `- Add ${materials.accentWall} accent wall` : ''}
- Floor material: ${materials.floorType || 'hardwood'} flooring
${materials.curtainType && materials.curtainType !== 'none' ? `- Window treatments: ${materials.curtainType} curtains` : ''}
- Lighting: ${lightingDesc}
- Update furniture colors and finishes to match ${style} aesthetic
- Add decorative elements (plants, artwork) that fit the style

STYLE GUIDELINES:
- Apply ${style} design principles to existing furniture
- Maintain the same furniture count and positions
- Update colors and textures only
- Keep the room functional and recognizable

OUTPUT: Photorealistic image showing the same ${roomType} with updated colors, materials, and lighting. The layout and furniture placement must remain identical. 8K resolution.`;
  }
}
