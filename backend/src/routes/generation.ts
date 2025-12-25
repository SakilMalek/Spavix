import { Router, Response } from 'express';
import { GeminiImageService } from '../services/gemini-image.js';
import { ShoppingListService } from '../services/shopping-list.js';
import { Database } from '../services/database.js';
import { AuthRequest } from '../middleware/auth.js';

export const generationRoutes = Router();

interface GenerationRequest {
  imageUrl: string;
  roomType: string;
  style: string;
  materials: {
    wallColor?: string;
    floorType?: string;
    curtainType?: string;
    lightingMood?: string;
    accentWall?: string;
  };
}

generationRoutes.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { imageUrl, roomType, style, materials } = req.body as GenerationRequest;

    if (!imageUrl || !roomType || !style) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    console.log('Generating image with prompt for:', { roomType, style });

    const prompt = GeminiImageService.buildPrompt(roomType, style, materials);
    console.log('Generated prompt:', prompt);

    console.log('Calling Gemini 2.5 Flash Image (img2img) for transformation...');
    const imageBuffer = await GeminiImageService.generateImage(prompt, imageUrl);
    console.log('Image generated successfully, size:', imageBuffer.length);

    const afterImageUrl = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    const generation = await Database.saveGeneration(
      req.user.id,
      imageUrl,
      afterImageUrl,
      style,
      materials,
      roomType
    );

    console.log('Generation saved to database:', generation.id);

    // Don't auto-generate shopping list to avoid quota issues
    // User can request it manually via the shopping list button

    res.json({
      success: true,
      generationId: generation.id,
      beforeImage: imageUrl,
      afterImage: afterImageUrl,
    });
  } catch (error: any) {
    console.error('Generation error:', error.message || error);
    res.status(500).json({ error: error.message || 'Generation failed' });
  }
});

generationRoutes.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const generations = await Database.getGenerations(req.user.id, limit, offset);

    // Convert snake_case to camelCase for frontend compatibility
    const formattedGenerations = generations.map((gen: any) => ({
      id: gen.id,
      beforeImageUrl: gen.before_image_url,
      afterImageUrl: gen.after_image_url,
      style: gen.style,
      roomType: gen.room_type,
      createdAt: gen.created_at,
    }));

    console.log('Returning generations:', formattedGenerations.length, 'items');
    if (formattedGenerations.length > 0) {
      console.log('First generation:', {
        id: formattedGenerations[0].id,
        style: formattedGenerations[0].style,
        hasAfterImageUrl: !!formattedGenerations[0].afterImageUrl,
        afterImageUrlLength: (formattedGenerations[0].afterImageUrl || '').length,
      });
    }

    res.json({
      success: true,
      generations: formattedGenerations,
      total: formattedGenerations.length,
    });
  } catch (error) {
    console.error('Get generations error:', error);
    res.status(500).json({ error: 'Failed to fetch generations' });
  }
});

generationRoutes.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const generation = await Database.getGenerationById(req.params.id, req.user.id);

    if (!generation) {
      res.status(404).json({ error: 'Generation not found' });
      return;
    }

    res.json({ success: true, generation });
  } catch (error) {
    console.error('Get generation error:', error);
    res.status(500).json({ error: 'Failed to fetch generation' });
  }
});

generationRoutes.post('/:id/shopping-list', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const generation = await Database.getGenerationById(req.params.id, req.user.id);

    if (!generation) {
      res.status(404).json({ error: 'Generation not found' });
      return;
    }

    console.log('Checking for cached shopping list for generation:', req.params.id);

    // Check if shopping list already exists in cache
    const cachedShoppingList = await Database.getShoppingList(req.params.id, req.user.id);

    if (cachedShoppingList) {
      console.log('Returning cached shopping list');
      res.json({
        success: true,
        shoppingList: cachedShoppingList,
        generationId: generation.id,
        cached: true,
      });
      return;
    }

    console.log('Generating new shopping list for generation:', req.params.id);

    const shoppingList = await ShoppingListService.generateShoppingList(
      generation.before_image_url,
      generation.after_image_url
    );

    // Save shopping list to cache
    await Database.saveShoppingList(req.params.id, req.user.id, shoppingList);
    console.log('Shopping list saved to cache');

    res.json({
      success: true,
      shoppingList,
      generationId: generation.id,
      cached: false,
    });
  } catch (error: any) {
    console.error('Shopping list generation error:', error.message || error);
    res.status(500).json({ error: error.message || 'Failed to generate shopping list' });
  }
});
