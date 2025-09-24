import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

let ocrPipeline: any = null;

// Initialize OCR pipeline for text detection
const initOCR = async () => {
  if (!ocrPipeline) {
    try {
      // Use a lightweight OCR model for text detection
      ocrPipeline = await pipeline(
        'image-to-text',
        'Xenova/trocr-base-printed',
        { device: 'webgpu' }
      );
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU');
      ocrPipeline = await pipeline(
        'image-to-text',
        'Xenova/trocr-base-printed',
        { device: 'cpu' }
      );
    }
  }
  return ocrPipeline;
};

export const processImageWithMirrorSupport = async (imageElement: HTMLImageElement): Promise<string[]> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');
  
  canvas.width = imageElement.width;
  canvas.height = imageElement.height;
  
  const results: string[] = [];
  
  // Define transformations to try
  const transformations = [
    // Original
    { name: 'original', transform: () => ctx.drawImage(imageElement, 0, 0) },
    // Horizontal flip (mirror)
    { 
      name: 'mirror', 
      transform: () => {
        ctx.scale(-1, 1);
        ctx.drawImage(imageElement, -canvas.width, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
    },
    // Vertical flip
    { 
      name: 'vertical', 
      transform: () => {
        ctx.scale(1, -1);
        ctx.drawImage(imageElement, 0, -canvas.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
    },
    // 180 degree rotation
    { 
      name: 'rotated', 
      transform: () => {
        ctx.scale(-1, -1);
        ctx.drawImage(imageElement, -canvas.width, -canvas.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
    }
  ];
  
  try {
    const ocr = await initOCR();
    
    for (const transformation of transformations) {
      try {
        // Clear canvas and apply transformation
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        transformation.transform();
        
        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Try OCR
        const result = await ocr(imageData);
        
        if (result && result.generated_text) {
          const text = result.generated_text.trim();
          // Look for patterns that might be codes
          const codePattern = /[A-Z0-9]{4,}/g;
          const matches = text.match(codePattern);
          
          if (matches) {
            results.push(...matches.map(match => `${match} (${transformation.name})`));
          }
          
          // Also add the full text if it looks like a code
          if (text.length > 3 && /^[A-Z0-9\-\/]+$/i.test(text)) {
            results.push(`${text} (${transformation.name})`);
          }
        }
      } catch (error) {
        console.warn(`OCR failed for ${transformation.name}:`, error);
      }
    }
  } catch (error) {
    console.error('Failed to initialize OCR:', error);
  }
  
  return results;
};

// Enhanced barcode detection using canvas analysis
export const detectBarcodePatternsWithMirror = (imageElement: HTMLImageElement): string[] => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return [];
  
  canvas.width = imageElement.width;
  canvas.height = imageElement.height;
  
  const results: string[] = [];
  
  const transformations = [
    { name: 'original', flipX: false, flipY: false },
    { name: 'mirror', flipX: true, flipY: false },
    { name: 'vertical', flipX: false, flipY: true },
    { name: 'rotated', flipX: true, flipY: true }
  ];
  
  for (const { name, flipX, flipY } of transformations) {
    try {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      
      if (flipX || flipY) {
        ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        ctx.drawImage(
          imageElement, 
          flipX ? -canvas.width : 0, 
          flipY ? -canvas.height : 0
        );
      } else {
        ctx.drawImage(imageElement, 0, 0);
      }
      
      ctx.restore();
      
      // Analyze image for barcode-like patterns
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pattern = analyzeForBarcodePattern(imageData);
      
      if (pattern) {
        results.push(`${pattern} (${name})`);
      }
    } catch (error) {
      console.warn(`Pattern detection failed for ${name}:`, error);
    }
  }
  
  return results;
};

// Simple barcode pattern analysis
const analyzeForBarcodePattern = (imageData: ImageData): string | null => {
  const { data, width, height } = imageData;
  
  // Convert to grayscale and look for bar patterns
  const grayscale: number[] = [];
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    grayscale.push(gray);
  }
  
  // Look for repeating patterns in middle rows (where barcodes typically are)
  const middleY = Math.floor(height / 2);
  const startIdx = middleY * width;
  const endIdx = startIdx + width;
  
  const row = grayscale.slice(startIdx, endIdx);
  
  // Simple threshold to detect bars
  const threshold = 128;
  const bars: boolean[] = row.map(val => val < threshold);
  
  // Look for alternating patterns
  let pattern = '';
  let currentBar = bars[0];
  let count = 1;
  
  for (let i = 1; i < bars.length; i++) {
    if (bars[i] === currentBar) {
      count++;
    } else {
      pattern += count.toString();
      currentBar = bars[i];
      count = 1;
    }
    
    // Limit pattern length
    if (pattern.length > 20) break;
  }
  
  // If we found a pattern with reasonable bar sequences, return it
  if (pattern.length > 8 && pattern.length < 50) {
    return pattern;
  }
  
  return null;
};

export const loadImageFromBlob = (blob: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
};