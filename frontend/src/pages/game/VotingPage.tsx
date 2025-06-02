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
  const [currentIndex, setCurrentIndex] = useState(0);  const [rating, setRating] = useState(60);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Load images when component mounts
  useEffect(() => {
    const fetchImages = async () => {      try {
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
  }, []);  useEffect(() => {
    if (isSubmitting) return;
    
    const duration = 10000;
    const interval = 100;
    let elapsed = 0;
    
    const timer = setInterval(() => {
      elapsed += interval;
      const remaining = Math.max(0, duration - elapsed);
      const seconds = Math.ceil(remaining / 1000);
      const progressPercent = (elapsed / duration) * 100;
      
      setTimeLeft(seconds);
      setProgress(Math.min(progressPercent, 100));
      
      if (remaining <= 0) {
        clearInterval(timer);
        handleSubmit();
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [currentIndex, isSubmitting]);
  
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
      try {      console.log(`Rating for image ${images[currentIndex].id}: ${rating}`);
        
      if (currentIndex < images.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setTimeLeft(10);
        setRating(60);
        setProgress(0);        setIsSubmitting(false);
      } else {
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
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">          {/* Progress bar */}          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className={`h-2 rounded-full transition-all duration-100 ease-linear ${
                timeLeft <= 3.1 
                  ? 'bg-red-500' 
                  : 'bg-[#00BBF9]'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Timer */}
          <div className="text-center mb-6">
            <div className={`text-3xl font-bold transition-colors duration-200 ${
              timeLeft <= 3.2 
                ? 'text-red-500' 
                : 'text-[#9B5DE5]'
            }`}>
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
            {/* Rating Buttons */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-[#9B5DE5]">Rate this caption:</h3>
            </div>
            <div className="flex justify-center gap-3">
              {[
                { value: 20, label: 'poop', emoji: '💩', color: 'bg-red-500 hover:bg-red-600' },
                { value: 40, label: 'OK', emoji: '🗑️', color: 'bg-orange-500 hover:bg-orange-600' },
                { value: 60, label: 'decent', emoji: '😐', color: 'bg-yellow-500 hover:bg-yellow-600' },
                { value: 80, label: 'epic', emoji: '👍', color: 'bg-blue-500 hover:bg-blue-600' },
                { value: 100, label: 'legendary', emoji: '🌟', color: 'bg-green-500 hover:bg-green-600' }              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setRating(option.value);
                    handleSubmit();
                  }}
                  disabled={isSubmitting}
                  className={`w-16 h-16 rounded-lg transition-all duration-200 ${
                    isSubmitting 
                      ? 'bg-gray-300 opacity-50 cursor-not-allowed' 
                      : `${option.color} opacity-70 hover:opacity-90 hover:scale-105`
                  } text-white font-bold flex flex-col items-center justify-center text-xs`}
                >
                  <span className="text-lg">{option.emoji}</span>
                  <span className="capitalize">{option.label}</span>
                </button>
              ))}
            </div>
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
