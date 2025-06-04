/**
 * Frontend HTML5 Canvas-based caption overlay utility
 * Creates captioned images similar to the Python backend functionality
 */

export interface CaptionOverlayOptions {
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  backgroundColor?: string;
  padding?: number;
  barHeight?: number;
  maxWidth?: number;
}

export interface CaptionOverlayResult {
  dataURL: string;
  width: number;
  height: number;
}

/**
 * Creates a captioned image by overlaying text on an image using HTML5 Canvas
 * @param imageDataURL - The base64 data URL of the original image
 * @param caption - The caption text to overlay
 * @param options - Customization options for the overlay
 * @returns Promise<CaptionOverlayResult> - The captioned image as a data URL
 */
export async function createCaptionedImage(
  imageDataURL: string,
  caption: string,
  options: CaptionOverlayOptions = {}
): Promise<CaptionOverlayResult> {
  const {
    fontSize = 24,
    fontFamily = 'Arial, sans-serif',
    textColor = '#FFFFFF',
    backgroundColor = '#000000',
    padding = 20,
    maxWidth = 800
  } = options;

  return new Promise((resolve, reject) => {
    // Create image element
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Calculate dimensions
        const imgWidth = img.width;
        const imgHeight = img.height;
        
        // Create canvas for text measurement
        const measureCanvas = document.createElement('canvas');
        const measureCtx = measureCanvas.getContext('2d');
        if (!measureCtx) {
          reject(new Error('Failed to get canvas context for measurement'));
          return;
        }
        
        measureCtx.font = `${fontSize}px ${fontFamily}`;
        
        // Calculate text wrapping
        const words = caption.split(' ');
        const lines: string[] = [];
        let currentLine = '';
        const maxLineWidth = Math.min(imgWidth - (padding * 2), maxWidth);
        
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const metrics = measureCtx.measureText(testLine);
          
          if (metrics.width <= maxLineWidth || !currentLine) {
            currentLine = testLine;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        
        if (currentLine) {
          lines.push(currentLine);
        }
        
        // Calculate bar height based on number of lines
        const lineHeight = fontSize * 1.4; // 1.4x for proper line spacing
        const barHeight = (lines.length * lineHeight) + (padding * 2);
        
        // Create final canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Set canvas dimensions (image + bar)
        canvas.width = imgWidth;
        canvas.height = imgHeight + barHeight;
        
        // Draw the original image
        ctx.drawImage(img, 0, 0);
        
        // Draw the black bar at the bottom
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, imgHeight, imgWidth, barHeight);
        
        // Setup text styling
        ctx.fillStyle = textColor;
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        // Draw text lines
        const startY = imgHeight + padding;
        lines.forEach((line, index) => {
          const y = startY + (index * lineHeight);
          ctx.fillText(line, imgWidth / 2, y);
        });
        
        // Convert to data URL
        const dataURL = canvas.toDataURL('image/png');
        
        resolve({
          dataURL,
          width: canvas.width,
          height: canvas.height
        });
        
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageDataURL;
  });
}

/**
 * Auto-adjusts font size based on caption length and image width
 * @param caption - The caption text
 * @param imageWidth - Width of the image
 * @param baseFontSize - Base font size to start with
 * @returns Optimal font size
 */
export function calculateOptimalFontSize(
  caption: string,
  imageWidth: number,
  baseFontSize: number = 24
): number {
  const captionLength = caption.length;
  
  // Reduce font size for longer captions
  if (captionLength > 30) {
    const reduction = Math.floor((captionLength - 30) / 3);
    return Math.max(16, baseFontSize - reduction);
  }
  
  // Adjust based on image width
  if (imageWidth < 400) {
    return Math.max(16, baseFontSize - 4);
  }
  
  return baseFontSize;
}
