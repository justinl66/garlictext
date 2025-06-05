import dbService from './dbService';

const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000';

export interface DrawingSubmissionData {
  userId: string;
  roundId?: string;
  prompt: string;
  drawingDataURL: string;
}

export interface ImageSubmissionResult {
  imageId: string;
  originalImageUrl: string;
  enhancedImageUrl?: string;
  status: 'original_saved' | 'enhanced' | 'error';
}

class ImageStorageService {  async submitDrawing(submissionData: DrawingSubmissionData): Promise<ImageSubmissionResult> {
    try {
      const imageData: any = {
        userId: submissionData.userId,
        prompt: submissionData.prompt,
        originalDrawingData: submissionData.drawingDataURL
      };

      // Only include roundId if it's not null/undefined
      if (submissionData.roundId && submissionData.roundId !== 'null') {
        imageData.roundId = submissionData.roundId;
      }      const savedImage = await dbService.image.createImage(imageData);
      const imageId = savedImage.id;

      const result: ImageSubmissionResult = {
        imageId,
        originalImageUrl: dbService.image.getOriginalImageUrl(imageId),
        status: 'original_saved'
      };

      this.enhanceImageAsync(imageId, submissionData.drawingDataURL, submissionData.prompt)
        .catch(error => {});

      return result;

    } catch (error) {
      throw new Error(`Failed to submit drawing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async enhanceImageAsync(imageId: string, originalDataURL: string, prompt: string): Promise<void> {
    try {      console.log('🎨 Starting AI enhancement for image:', imageId);

      const response = await fetch(originalDataURL);
      const blob = await response.blob();      const file = new File([blob], 'drawing.png', { type: 'image/png' });

      const formData = new FormData();
      formData.append('image', file);
      formData.append('prompt', prompt);
      formData.append('strength', '0.75');
      formData.append('guidance_scale', '7.5');      formData.append('num_images', '1');

      const aiResponse = await fetch(`${AI_API_URL}/generate/`, {
        method: 'POST',
        body: formData,
      });

      if (!aiResponse.ok) {
        throw new Error(`AI API responded with status: ${aiResponse.status}`);
      }

      const aiResult = await aiResponse.json();
      
      if (!aiResult.images || aiResult.images.length === 0) {
        throw new Error('AI API returned no enhanced images');      }      const enhancedImageDataURL = aiResult.images[0];

      await dbService.image.updateEnhancedImage(imageId, enhancedImageDataURL);    } catch (error) {
      throw error;
    }}

  getImageUrls(imageId: string) {
    return {
      original: dbService.image.getOriginalImageUrl(imageId),
      enhanced: dbService.image.getEnhancedImageUrl(imageId)
    };  }

  async hasEnhancedVersion(imageId: string): Promise<boolean> {
    try {
      const image = await dbService.image.getImageById(imageId);
      return Boolean(image.enhancedImageData);
    } catch (error) {
      console.error('Error checking enhanced version:', error);
      return false;
    }  }

  async getImagesForRound(roundId: string) {
    try {
      const images = await dbService.image.getImagesByRound(roundId);
      
      return images.map((image: any) => ({
        ...image,
        originalImageUrl: this.getImageUrls(image.id).original,
        enhancedImageUrl: this.getImageUrls(image.id).enhanced
      }));
    } catch (error) {
      console.error('Error getting images for round:', error);
      throw error;
    }
  }
}

export const imageStorageService = new ImageStorageService();
export default imageStorageService;
