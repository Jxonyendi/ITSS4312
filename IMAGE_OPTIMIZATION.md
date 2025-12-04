# Image Optimization Guide

## Current Implementation

The app currently uses external Unsplash URLs for pizza images. For production, you should optimize and use local images.

## Steps to Optimize Images

### 1. Download and Optimize Images

1. **Download pizza images** from Unsplash or use your own
2. **Optimize images** using tools like:
   - [TinyPNG](https://tinypng.com/) - Compress PNG/JPEG
   - [Squoosh](https://squoosh.app/) - Advanced compression
   - [ImageOptim](https://imageoptim.com/) - Mac app

### 2. Recommended Image Sizes

- **Pizza card images**: 800x600px (optimized to ~50-100KB)
- **Thumbnail images**: 400x300px (optimized to ~20-50KB)
- **Format**: WebP (with JPEG fallback)

### 3. Add Images to Project

1. Create image directory:
   ```bash
   mkdir -p src/assets/images/pizzas
   ```

2. Add optimized images:
   ```
   src/assets/images/pizzas/
   ├── ultimate-pepperoni.webp
   ├── ultimate-pepperoni.jpg (fallback)
   ├── extravaganza.webp
   ├── extravaganza.jpg
   └── ...
   ```

### 4. Update Pizza Data

Update `src/app/orders/tab4.page.ts`:

```typescript
specialtyPizzas: SpecialtyPizza[] = [
  {
    id: 'ultimate-pepperoni',
    name: 'Ultimate Pepperoni',
    // ... other properties
    image: 'assets/images/pizzas/ultimate-pepperoni.webp',
  },
  // ...
];
```

### 5. Add Lazy Loading

Images are already set up for lazy loading in `src/global.scss`. Ensure your HTML uses:

```html
<img [src]="pizza.image" loading="lazy" alt="{{ pizza.name }}" />
```

## Performance Benefits

- **Faster load times**: Local images load faster than external URLs
- **Reduced bandwidth**: Optimized images use less data
- **Better caching**: Browser can cache local assets effectively
- **Offline support**: Works without internet connection

## Image Compression Tips

1. **Use WebP format** with JPEG fallback
2. **Target file sizes**:
   - Large images: 50-100KB
   - Thumbnails: 20-50KB
3. **Use responsive images** for different screen sizes
4. **Implement lazy loading** for images below the fold


