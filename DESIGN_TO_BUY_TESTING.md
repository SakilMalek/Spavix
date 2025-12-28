# Design-to-Buy Feature - Local Testing Guide

## Overview
The design-to-buy feature automatically detects furniture and decor items in generated room transformation images and matches them to real products with affiliate links for monetization.

## Architecture

### Backend Services
1. **ProductDetectionService** (`backend/src/services/product-detection.ts`)
   - Uses Gemini 2.0 Flash to analyze images
   - Detects items with confidence scores
   - Returns structured item data (name, category, color, material, price estimate)

2. **ProductMatchingService** (`backend/src/services/product-matching.ts`)
   - Matches detected items to real products
   - Supports Amazon, Flipkart, and Wayfair
   - Generates affiliate URLs for monetization
   - Calculates similarity scores

3. **Products API Routes** (`backend/src/routes/products.ts`)
   - `POST /api/products/detect` - Detect items only
   - `POST /api/products/match` - Match items to products
   - `POST /api/products/detect-and-match` - Full pipeline

### Frontend Components
1. **ProductSidebar** (`frontend/components/ProductSidebar.tsx`)
   - Displays detected items and matched products
   - Expandable item cards with product details
   - Export to CSV/JSON
   - Share functionality
   - Affiliate link integration

## Testing Steps

### 1. Backend API Testing

#### Test Health Check
```bash
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"..."}
```

#### Test Product Detection
```bash
POST http://localhost:3001/api/products/detect
Headers: Authorization: Bearer {token}
Body: {
  "imagePath": "/path/to/generated/image.png"
}
```

Expected Response:
```json
{
  "success": true,
  "items": [
    {
      "id": "item_1",
      "name": "gray modular sofa",
      "description": "Modern gray fabric sofa with modular design",
      "category": "furniture",
      "color": "gray",
      "material": "fabric",
      "estimatedPrice": "mid-range",
      "confidence": 95
    }
  ],
  "totalItems": 15,
  "timestamp": "2025-12-28T..."
}
```

#### Test Product Matching
```bash
POST http://localhost:3001/api/products/match
Headers: Authorization: Bearer {token}
Body: {
  "items": [
    {
      "id": "item_1",
      "name": "gray modular sofa",
      "category": "furniture"
    }
  ]
}
```

#### Test Full Pipeline
```bash
POST http://localhost:3001/api/products/detect-and-match
Headers: Authorization: Bearer {token}
Body: {
  "imagePath": "/path/to/generated/image.png"
}
```

### 2. Frontend Integration Testing

#### Step 1: Generate an Image
1. Login to dashboard
2. Upload a room image
3. Select a style and generate transformation
4. Wait for image generation to complete

#### Step 2: Trigger Product Detection
1. After image generation, click "Detect Products" button
2. ProductSidebar should appear on the right side
3. Items should load with detected furniture and decor

#### Step 3: View Product Matches
1. Expand each detected item
2. View matched products from Amazon/Flipkart
3. Check similarity scores
4. Click "View" to open affiliate links

#### Step 4: Test Export Functions
1. Click "CSV" to export as spreadsheet
2. Click "JSON" to export as JSON file
3. Verify file contains all items and product matches

#### Step 5: Test Selection and Sharing
1. Select multiple products using checkboxes
2. Click "Share" to share shopping list
3. Verify selected count updates

### 3. Monetization Testing

#### Affiliate Link Verification
1. Check that all product URLs include affiliate tags:
   - Amazon: `?tag=spavix-20`
   - Flipkart: `?affid=spavix`
2. Verify links open correctly in new tabs
3. Test that affiliate tracking works (check affiliate dashboards)

### 4. Performance Testing

#### Load Testing
- Test with images containing 20+ items
- Verify response times < 10 seconds
- Check memory usage during processing

#### Error Handling
- Test with invalid image paths
- Test with corrupted images
- Test with missing API keys
- Verify error messages are user-friendly

## Current Status

### Completed ✅
- [x] ProductDetectionService implementation
- [x] ProductMatchingService implementation
- [x] Backend API routes
- [x] ProductSidebar component
- [x] Export functionality (CSV/JSON)
- [x] Affiliate link generation
- [x] Backend integration into index.ts

### In Progress 🔄
- [ ] Frontend integration into dashboard
- [ ] Product detection trigger button
- [ ] Real product API integration (currently using mocks)

### TODO 📋
- [ ] Integrate ProductSidebar into dashboard
- [ ] Add "Detect Products" button to image generation
- [ ] Implement real Amazon PA-API v5 integration
- [ ] Implement real Flipkart API integration
- [ ] Add product image caching
- [ ] Add analytics tracking for affiliate clicks
- [ ] Add user preferences for affiliate programs
- [ ] Create admin dashboard for affiliate settings

## Environment Variables Required

```env
# Backend
GEMINI_API_KEY=your_gemini_api_key
AMAZON_AFFILIATE_ID=your_amazon_affiliate_id
FLIPKART_AFFILIATE_ID=your_flipkart_affiliate_id

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Known Limitations

1. **Product Matching**: Currently using mock data. Real integration requires:
   - Amazon Product Advertising API v5 credentials
   - Flipkart Affiliate API credentials
   - Wayfair API credentials

2. **Image Analysis**: Limited by Gemini API rate limits
   - Free tier: 2-5 requests/minute
   - Paid tier: Higher limits

3. **Similarity Matching**: Basic word-overlap algorithm
   - Can be improved with ML-based image similarity
   - Consider using CLIP or similar models

## Next Steps

1. **Integrate into Dashboard**
   - Add ProductSidebar to dashboard layout
   - Add trigger button after image generation
   - Handle loading states

2. **Real Product APIs**
   - Set up Amazon PA-API v5
   - Set up Flipkart Affiliate API
   - Implement proper product search and matching

3. **Analytics**
   - Track product views
   - Track affiliate clicks
   - Monitor conversion rates

4. **Monetization**
   - Set up affiliate account tracking
   - Configure commission rates
   - Create revenue reports

## Troubleshooting

### Issue: "Script exists: false" for Python scripts
**Solution**: Ensure Python scripts are in `backend/src/` directory and pip dependencies are installed.

### Issue: Gemini API errors
**Solution**: 
- Check API key is valid
- Verify rate limits haven't been exceeded
- Check image format is supported (JPEG, PNG, GIF, WebP)

### Issue: Product matches not found
**Solution**:
- Verify affiliate API credentials
- Check network connectivity
- Review API response logs

## References

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Amazon PA-API v5](https://webservices.amazon.com/paapi5/documentation/)
- [Flipkart Affiliate Program](https://affiliate.flipkart.com/)
