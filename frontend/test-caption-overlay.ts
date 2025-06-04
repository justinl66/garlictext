/**
 * Test file for caption overlay functionality
 * This tests the frontend HTML5 Canvas-based caption overlay
 */

import { createCaptionedImage, calculateOptimalFontSize } from '../src/utils/captionOverlay';

// Test the caption overlay with a sample image
async function testCaptionOverlay() {
  // Create a simple test image (red square)
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Failed to get canvas context');
    return;
  }
  
  // Draw a red square
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(0, 0, 400, 300);
  
  // Add some simple drawing
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(50, 50, 100, 100);
  ctx.fillStyle = '#0000FF';
  ctx.fillRect(250, 150, 100, 100);
  
  const testImageDataURL = canvas.toDataURL('image/png');
  
  try {
    // Test caption overlay
    const result = await createCaptionedImage(
      testImageDataURL,
      'This is a test caption for the garlictext game!',
      {
        fontSize: 24,
        textColor: '#FFFFFF',
        backgroundColor: '#000000',
        padding: 20
      }
    );
    
    console.log('✅ Caption overlay test successful!');
    console.log('📏 Result dimensions:', result.width, 'x', result.height);
    console.log('📸 Data URL length:', result.dataURL.length);
    
    // Test font size calculation
    const fontSize1 = calculateOptimalFontSize('Short caption', 400);
    const fontSize2 = calculateOptimalFontSize('This is a much longer caption that should result in a smaller font size', 400);
    
    console.log('📝 Font size for short caption:', fontSize1);
    console.log('📝 Font size for long caption:', fontSize2);
    
    return result;
    
  } catch (error) {
    console.error('❌ Caption overlay test failed:', error);
    throw error;
  }
}

// Export for testing
if (typeof window !== 'undefined') {
  (window as any).testCaptionOverlay = testCaptionOverlay;
}

console.log('🧪 Caption overlay test module loaded');
console.log('💡 Run testCaptionOverlay() in browser console to test');
