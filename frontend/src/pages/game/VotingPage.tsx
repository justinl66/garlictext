import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../General/NavBar';
import dbService from '../../services/dbService';
import { AuthContext } from '../../firebase/firebaseAuth';

// Define TypeScript interfaces for our data structure
interface CaptionedImage {
  id: string;
  imageUrl: string;
  caption: string;
  authorName: string;
  promptText: string;
}

export default function VotingPage() {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.currentUser;
  
  const [images, setImages] = useState<CaptionedImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rating, setRating] = useState(50); // Default middle value
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds per image
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Load images when component mounts
  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Placeholder data - replace with actual API call
        const mockImages = [
          {
            id: '1',
            imageUrl: '/garlicTextNoBackground.png',
            caption: "a sweaty person",
            authorName: 'Player 1',
            promptText: 'Draw a programmer debugging code'
          },
          {
            id: '2',
            imageUrl: '/garlicTextNoBackground.png',
            caption: 'a Degen',
            authorName: 'Player 2',
            promptText: 'Draw a programmer debugging code'
          },
          {
            id: '3',
            imageUrl: '/garlicTextNoBackground.png',
            caption: 'a Degen',
            authorName: 'Player 2',
            promptText: 'Draw a programmer debugging code'
          },
          {
            id: '4',
            imageUrl: '/garlicTextNoBackground.png',
            caption: 'a Degen',
            authorName: 'Player 2',
            promptText: 'Draw a programmer debugging code'
          },
        ];
        
        setImages(mockImages);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };
    
    fetchImages();
  }, []);
  
  // Timer countdown for each image
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
      setProgress((10 - timeLeft) / 10 * 100);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);
  
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Submit the rating for the current image
      console.log(`Rating for image ${images[currentIndex].id}: ${rating}`);
      
      // If there are more images to vote on
      if (currentIndex < images.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setTimeLeft(10);
        setRating(50);
        setProgress(0);
        setIsSubmitting(false);
      } else {
        // All images have been voted on
        setTimeout(() => {
          navigate('/game/results');
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      setIsSubmitting(false);
    }
  };
  
  const currentImage = images[currentIndex];
  
  if (!currentImage) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9]">
      <NavBar />
      
      <div className="container mx-auto px-4 py-6 flex-grow flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-[#00BBF9] h-2 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Timer */}
          <div className="text-center mb-6">
            <div className={`text-3xl font-bold ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-[#9B5DE5]'}`}>
              {timeLeft}s
            </div>
          </div>
          
          {/* Prompt */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-[#9B5DE5]">Prompt:</h2>
            <p className="text-gray-700">{currentImage.promptText}</p>
          </div>
          
          {/* Image */}
          <div className="flex justify-center items-center mb-6">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden max-h-[300px] w-[300px]">
              <img 
                src={currentImage.imageUrl} 
                alt={`Drawing by ${currentImage.authorName}`}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          {/* Caption */}
          <div className="bg-gray-200 rounded-lg p-4 mb-6">
            <p className="text-lg font-medium text-center text-[#9B5DE5]">{currentImage.caption}</p>
            <p className="text-sm text-gray-600 text-center mt-2">By: {currentImage.authorName}</p>
          </div>
          
          {/* Rating Slider */}
          <div className="mb-8">
            <input
              type="range"
              min="0"
              max="100"
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#9B5DE5]"
            />
            <div className="flex justify-between mt-2 text-sm font-bold">
              <span className="text-red-500">💩 Poop</span>
              <span className="text-yellow-500">😐 Meh</span>
              <span className="text-green-500">🌟 Legendary</span>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-lg font-bold text-xl transition ${
                isSubmitting 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#9B5DE5] to-[#F15BB5] text-white hover:opacity-90'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
          
          {/* Progress indicator */}
          <div className="text-center mt-4 text-gray-600">
            {currentIndex + 1} of {images.length} drawings voted
          </div>
        </div>
      </div>
    </div>
  );
}
