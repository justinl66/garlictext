import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import NavBar from '../General/NavBar';
import { AuthContext } from '../../firebase/firebaseAuth';
import { createCaptionedImage, calculateOptimalFontSize } from '../../utils/captionOverlay';
import dbService from '../../services/dbService';

export default function CaptionPage() {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { roomId } = useParams<{ roomId: string }>();
  const { state } = useLocation();
  const [caption, setCaption] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);  const [image, setImage] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
    
  const currentRoomId = roomId;
  
  if (!authContext) {
    return <div>Loading...</div>;
  }
  const { user: currentUser } = authContext;  useEffect(() => {
    if (currentRoomId) {
      const fetchAssignedImage = async () => {
        try {
          const assignedImageData = await dbService.image.getAssignedImageForUser(currentRoomId);          if (assignedImageData && assignedImageData.image) {
            const assignedImage = assignedImageData.image;
            setImageId(assignedImage.id);
            setIsUsingFallback(false);
            const enhancedImageUrl = dbService.image.getEnhancedImageUrl(assignedImage.id);
            setImage(enhancedImageUrl);
          } else {
            const latestImage = await dbService.image.getLatestImage();
            if (latestImage && latestImage.id) {
              setImageId(latestImage.id);
              setIsUsingFallback(false);
              const enhancedImageUrl = dbService.image.getEnhancedImageUrl(latestImage.id);
              setImage(enhancedImageUrl);
            }
          }
        } catch (error) {
          console.error('Error fetching assigned image:', error);
          try {            const latestImage = await dbService.image.getLatestImage();
            if (latestImage && latestImage.id) {
              setImageId(latestImage.id);
              setIsUsingFallback(false);
              const enhancedImageUrl = dbService.image.getEnhancedImageUrl(latestImage.id);
              setImage(enhancedImageUrl);
            }
          } catch (fallbackError) {
            console.error('Error fetching fallback image:', fallbackError);
            setImage('/placeholder-drawing.png');
          }
        }
      };
      fetchAssignedImage();
    }
  }, [state, currentRoomId]);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);
    const handleImageError = () => {
    if (imageId && !isUsingFallback) {
      setIsUsingFallback(true);
      const originalImageUrl = dbService.image.getOriginalImageUrl(imageId);
      setImage(originalImageUrl);
    } else {
      setImage(null);
    }
  };
    const handleSubmit = async () => {
    if (isSubmitting || !caption.trim() || !imageId || !currentUser) return;
    
    setIsSubmitting(true);    try {
      if (!imageId) {
        throw new Error('Image ID is required');
      }      if (!currentRoomId || currentRoomId.trim() === '') {
        throw new Error('Room ID is required');
      }
      if (!currentUser?.uid) {
        throw new Error('User authentication required');
      }      const captionData = {
        imageId,
        text: caption.trim(),
        roundId: currentRoomId
      };
      await dbService.caption.createCaption(captionData);
      
      if (image) {
        try {
          
          const response = await fetch(image);
          const blob = await response.blob();
          const imageDataURL = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);          });
          
          const img = new Image();
          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = imageDataURL;
          });
            const fontSize = calculateOptimalFontSize(caption, img.width);
            const captionedResult = await createCaptionedImage(imageDataURL, caption, {
            fontSize,
            fontFamily: 'Arial, sans-serif',
            textColor: '#FFFFFF',
            backgroundColor: '#000000',
            padding: 20
          });
          
          await dbService.image.updateCaptionedImage(imageId, captionedResult.dataURL);        } catch (overlayError) {
          console.error('Error creating captioned image:', overlayError);
        }
      }
        setTimeout(() => {
        navigate(`/game/voting/${currentRoomId}`);
      }, 1500);
        } catch (error) {
      console.error('Error submitting caption:', error);
      setIsSubmitting(false);
    }};
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9]">
      <NavBar />
      
      <div className="container mx-auto px-4 py-6 flex-grow flex flex-col">        <div className="bg-white rounded-xl shadow-2xl p-6 flex-grow flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#9B5DE5]">Add a caption!</h2>
              <p className="text-gray-600">Be creative and funny with your caption for this AI-enhanced drawing</p>
            </div>
            <div className="flex items-center">
              <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-[#9B5DE5]'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>          </div>
            <div className="flex-grow flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex items-center justify-center border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">              {image ? (
                <img 
                  src={image} 
                  alt="AI-enhanced drawing" 
                  className="max-w-full max-h-full object-contain"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                  <p className="text-gray-500 text-center p-4">
                    Image is loading or not available.<br/>
                    In actual gameplay, this would be another player's AI-enhanced drawing.
                  </p>
                </div>
              )}            </div>
            
            <div className="flex-1 flex flex-col">
              <div className="mb-4">
                <label htmlFor="caption" className="block text-lg font-medium text-gray-700 mb-2">
                  Your Caption
                </label>
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a funny caption for this image..."
                  className="w-full h-40 p-3 border-2 border-gray-300 rounded-lg text-black focus:border-[#00BBF9] focus:ring focus:ring-[#00BBF9] focus:ring-opacity-50 transition"
                  maxLength={100}
                />
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-gray-500">Be creative and funny!</span>
                  <span className={`${caption.length > 80 ? 'text-red-500' : 'text-gray-500'}`}>
                    {caption.length}/100
                  </span>
                </div>
              </div>
              
              <div className="mt-auto">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !caption.trim()}
                  className={`w-full py-3 rounded-lg font-bold text-lg transition ${
                    isSubmitting || !caption.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#9B5DE5] to-[#F15BB5] text-white hover:opacity-90'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Caption'}
                </button>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Tip:</span> The funniest captions usually win! Think about what would make your friends laugh.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
