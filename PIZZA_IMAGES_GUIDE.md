# Pizza Images Guide

## Current Setup
Your app is currently using **Unsplash** images via direct URLs. This is a great free option!

## Best Free Image Sources for Pizza

### 1. **Unsplash** (Currently Using) ⭐ Recommended
- **Website**: https://unsplash.com
- **Search**: "pizza", "pepperoni pizza", "margherita pizza", etc.
- **License**: Free to use (even commercially)
- **How to use**: 
  - Search for pizza images
  - Click on an image
  - Click "Download" or copy the direct URL
  - Use the URL directly in your code (like you're doing now)

**Example URLs you can use:**
```
https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80
https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80
https://images.unsplash.com/photo-1506354666786-959d6d497f1a?auto=format&fit=crop&w=800&q=80
```

### 2. **Pexels** (Alternative)
- **Website**: https://www.pexels.com
- **Search**: "pizza"
- **License**: Free to use
- **How to use**: Download images and host them, or use their API

### 3. **Pixabay** (Alternative)
- **Website**: https://pixabay.com
- **Search**: "pizza"
- **License**: Free to use
- **How to use**: Download images and host them

## Using Local Images (Recommended for Production)

If you want to use local images instead of URLs:

### Step 1: Download Images
1. Go to Unsplash.com
2. Search for pizza images
3. Download high-quality images (at least 800x600px)
4. Save them in `src/assets/images/pizza/`

### Step 2: Create the Directory
```bash
mkdir -p src/assets/images/pizza
```

### Step 3: Add Images
Place your downloaded pizza images in the folder:
- `src/assets/images/pizza/ultimate-pepperoni.jpg`
- `src/assets/images/pizza/extravaganza.jpg`
- `src/assets/images/pizza/memphis-bbq.jpg`
- etc.

### Step 4: Update Your Code
In `src/app/orders/tab4.page.ts`, change the image URLs:

```typescript
image: 'assets/images/pizza/ultimate-pepperoni.jpg',
```

Instead of:
```typescript
image: 'https://images.unsplash.com/photo-1548365328-9f547b5746ef?auto=format&fit=crop&w=800&q=80',
```

## Image Specifications

For best results, use images with:
- **Aspect Ratio**: 4:3 or 16:9 (landscape)
- **Minimum Size**: 800x600 pixels
- **Format**: JPG or PNG
- **File Size**: Under 500KB (optimize for web)

## Quick Image Search Terms

Use these search terms on Unsplash/Pexels:
- "pepperoni pizza"
- "margherita pizza"
- "bbq chicken pizza"
- "veggie pizza"
- "meat lovers pizza"
- "cheese pizza"
- "pizza slice"
- "pizza close up"

## Current Pizza Images in Your App

Your app currently has these pizzas:
1. **Ultimate Pepperoni** - Needs: Pepperoni pizza image
2. **ExtravaganZZa** - Needs: Meat lovers pizza image
3. **Memphis BBQ Chicken** - Needs: BBQ chicken pizza image
4. **Pacific Veggie** - Needs: Vegetable pizza image
5. **Philly Cheese Steak** - Needs: Steak/meat pizza image
6. **Deluxe** - Needs: Deluxe/loaded pizza image

## Pro Tips

1. **Consistent Style**: Try to use images with similar lighting and style
2. **High Quality**: Use high-resolution images (they'll be optimized automatically)
3. **Fast Loading**: If using URLs, Unsplash automatically optimizes images
4. **Fallback**: Your code already has a fallback image if one fails to load

## Quick Links

- **Unsplash Pizza Search**: https://unsplash.com/s/photos/pizza
- **Pexels Pizza Search**: https://www.pexels.com/search/pizza/
- **Pixabay Pizza Search**: https://pixabay.com/images/search/pizza/

