import express from 'express';
import path from 'path';

// Middleware to serve static files from uploads directory
export const staticMiddleware = express.static(
  path.join(process.cwd(), 'public'),
  {
    maxAge: '1d', // Cache for 1 day
    etag: true,
    lastModified: true
  }
);

// Middleware specifically for product images
export const productImagesMiddleware = express.static(
  path.join(process.cwd(), 'public/uploads/products'),
  {
    maxAge: '7d', // Cache product images for 7 days
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // Set appropriate headers for images
      if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (path.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (path.endsWith('.webp')) {
        res.setHeader('Content-Type', 'image/webp');
      } else if (path.endsWith('.gif')) {
        res.setHeader('Content-Type', 'image/gif');
      }
    }
  }
);