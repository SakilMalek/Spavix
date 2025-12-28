import { Router, Request, Response } from 'express';
import { ProductDetectionService } from '../services/product-detection.js';
import { ProductMatchingService, ProductMatch } from '../services/product-matching.js';
import * as path from 'path';
import * as fs from 'fs';

const router = Router();

// Initialize services
const apiKey = process.env.GEMINI_API_KEY || '';
const productDetectionService = new ProductDetectionService(apiKey);
const productMatchingService = new ProductMatchingService();

// POST /api/products/detect-and-match
// Detects items in an image and finds matching products
router.post('/detect-and-match', async (req: Request, res: Response): Promise<void> => {
  try {
    const { imagePath, imageUrl } = req.body;

    if (!imagePath && !imageUrl) {
      res.status(400).json({
        error: 'Either imagePath or imageUrl is required',
      });
      return;
    }

    console.log('[Products API] Starting detection and matching...');

    // If imageUrl is provided, download and save it temporarily
    let localImagePath = imagePath;
    if (imageUrl && !imagePath) {
      localImagePath = await downloadImage(imageUrl);
    }

    // Step 1: Detect items in the image
    const detectionResult = await productDetectionService.detectItemsInImage(localImagePath);

    // Step 2: Match each detected item to real products
    const productMatches: ProductMatch[] = [];

    for (const item of detectionResult.items) {
      const matches = await productMatchingService.matchProductsForItem(item.name, item.category);

      productMatches.push({
        detectedItemId: item.id,
        detectedItemName: item.name,
        matches: matches,
        bestMatch: matches.length > 0 ? matches[0] : undefined,
      });

      // Add small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Clean up temporary file if created
    if (imageUrl && !imagePath && fs.existsSync(localImagePath)) {
      fs.unlinkSync(localImagePath);
    }

    res.json({
      success: true,
      detectedItems: detectionResult.items,
      productMatches: productMatches,
      totalItems: detectionResult.totalItems,
      totalMatches: productMatches.filter((m) => m.matches.length > 0).length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Products API] Error:', error.message);
    res.status(500).json({
      error: 'Failed to detect and match products',
      message: error.message,
    });
  }
});

// POST /api/products/detect
// Only detects items without matching
router.post('/detect', async (req: Request, res: Response): Promise<void> => {
  try {
    const { imagePath, imageUrl } = req.body;

    if (!imagePath && !imageUrl) {
      res.status(400).json({
        error: 'Either imagePath or imageUrl is required',
      });
      return;
    }

    let localImagePath = imagePath;
    if (imageUrl && !imagePath) {
      localImagePath = await downloadImage(imageUrl);
    }

    const detectionResult = await productDetectionService.detectItemsInImage(localImagePath);

    if (imageUrl && !imagePath && fs.existsSync(localImagePath)) {
      fs.unlinkSync(localImagePath);
    }

    res.json({
      success: true,
      items: detectionResult.items,
      totalItems: detectionResult.totalItems,
      timestamp: detectionResult.analysisTimestamp,
    });
  } catch (error: any) {
    console.error('[Products API] Detection error:', error.message);
    res.status(500).json({
      error: 'Failed to detect items',
      message: error.message,
    });
  }
});

// POST /api/products/match
// Matches detected items to products
router.post('/match', async (req: Request, res: Response): Promise<void> => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      res.status(400).json({
        error: 'items array is required',
      });
      return;
    }

    const productMatches: ProductMatch[] = [];

    for (const item of items) {
      const matches = await productMatchingService.matchProductsForItem(item.name, item.category);

      productMatches.push({
        detectedItemId: item.id,
        detectedItemName: item.name,
        matches: matches,
        bestMatch: matches.length > 0 ? matches[0] : undefined,
      });

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    res.json({
      success: true,
      productMatches: productMatches,
      totalMatches: productMatches.filter((m) => m.matches.length > 0).length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Products API] Matching error:', error.message);
    res.status(500).json({
      error: 'Failed to match products',
      message: error.message,
    });
  }
});

// Helper function to download image from URL
async function downloadImage(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();

    const tempDir = path.join(process.cwd(), '..', 'temp_images');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filename = `temp_${Date.now()}.jpg`;
    const filepath = path.join(tempDir, filename);

    fs.writeFileSync(filepath, Buffer.from(buffer));
    console.log('[Products API] Downloaded image to:', filepath);

    return filepath;
  } catch (error: any) {
    throw new Error(`Failed to download image: ${error.message}`);
  }
}

export default router;
