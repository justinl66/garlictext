import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../General/NavBar';
import dbService from '../../services/dbService';
import { AuthContext } from '../../firebase/firebaseAuth';
import Cookies from 'js-cookie';

interface CaptionedImage {
  id: string;
  imageUrl: string;
  caption: string;
  authorName: string;
  promptText: string;
  isUsingFallback?: boolean;
}

export default function VotingPage() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.currentUser;
  const [images, setImages] = useState<CaptionedImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);  
  const [rating, setRating] = useState(3);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);  
  const [progress, setProgress] = useState(0);
  const [isWaitingForOthers, setIsWaitingForOthers] = useState(false);


  useEffect(() => {
      checkGameStatus(true); // Fetch room data on mount
    const pingServer = setInterval(async () => {
      await checkGameStatus(false);
      // alert(creator)
    }, 3000);    return () => clearInterval(pingServer);
  })


  const checkGameStatus = async (reloaded:boolean) =>{
      if (!roomId) {
        return;
      }

      try {
        let currentUpdate = reloaded? '0' : (Cookies.get('currentUpdate') || '0');
        const result = await fetch(`http://localhost:5001/api/games/${roomId}/status?version=${currentUpdate}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        if(!result.ok) {
          throw new Error(`HTTP error! status: ${result.status}`);
        }

        const gameData = await result.json();

        if(gameData.message === 'good') {
          return;
        }

        Cookies.set('currentUpdate', gameData.currentUpdate);
        
        // alert(gameData.status)
        if (gameData.status && gameData.status !== 'voting') {
          if (gameData.status == 'trophies') {
            navigate(`/game/results/${roomId}`);
          } else {
            alert(`Stale game: ${gameData.status}`);
            navigate('/');
          }
        }
        
      } catch (error) {
        console.log('Error checking game status:', error);
      }
    }

  useEffect(() => {
    const fetchImages = async () => {
      if (!roomId) {
        return;
      }      try {
        const imagesData = await dbService.image.getImagesByRound(roomId);
        
        const transformedImages: CaptionedImage[] = imagesData.map((image: any) => ({          id: image.id,
          imageUrl: image.enhancedImageData ? 
            dbService.image.getEnhancedImageUrl(image.id) : 
            dbService.image.getOriginalImageUrl(image.id),
          caption: image.captions?.[0]?.text || `Drawing by ${image.user?.username || 'Anonymous'}`,
          authorName: image.captions?.[0]?.user?.username || image.user?.username || 'Anonymous',
          promptText: image.prompt || 'No prompt available'        }));

        const filteredImages = transformedImages.filter((image: any) => 
          image.authorName !== (currentUser?.displayName || currentUser?.email)
        );
          setImages(filteredImages);
      } catch (error) {
        const mockImages = [
          {
            id: '1',
            imageUrl: '/garlicTextNoBackground.png',
            caption: "a sweaty person",
            authorName: 'Player 1',
            promptText: 'Draw a programmer debugging code'
          }
        ];
        setImages(mockImages);
      }    };
      fetchImages();
  }, [roomId, currentUser]);

  useEffect(() => {
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
        handleSubmit(); // Use default rating when timer expires
      }
    }, interval);
      return () => clearInterval(timer);
  }, [currentIndex, isSubmitting]);
    const handleImageError = (imageId: string) => {
    setImages(prevImages => 
      prevImages.map(img => {
        if (img.id === imageId && !img.isUsingFallback) {
          return {
            ...img,
            imageUrl: dbService.image.getOriginalImageUrl(imageId),
            isUsingFallback: true
          };
        }
        return img;
      })
    );
  };const handleSubmit = async (ratingValue?: number) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
      try {
      const currentImage = images[currentIndex];
      const voteRating = ratingValue !== undefined ? ratingValue : rating;
      await dbService.image.voteForImage(currentImage.id, voteRating, (currentIndex >= images.length - 1) );
        if (currentIndex < images.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setTimeLeft(10);
        setRating(3);
        setProgress(0);        setIsSubmitting(false);
      } else {
        // User has finished voting on all images, show waiting state
        setIsWaitingForOthers(true);
        // TODO: Add backend polling logic here to check if all players have finished voting
        // For now, just navigate after a timeout (you can replace this with actual backend logic)
        
      }
    } catch (error) {
      console.error('Error submitting vote:', error);      if (currentIndex < images.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setTimeLeft(10);
        setRating(3);
        setProgress(0);
      } else {
        setIsWaitingForOthers(true);
        
      }
      setIsSubmitting(false);
    }
  };
  
  const currentImage = images[currentIndex];
  
  if (!currentImage) {
    return <div>Loading...</div>;
  }

  // Show waiting for others UI when user has completed all voting
  if (isWaitingForOthers) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9]">
        <NavBar />
        
        <div className="container mx-auto px-4 py-6 flex-grow flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl text-center">
            {/* Loading spinner */}
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#9B5DE5] border-t-transparent"></div>
            </div>
            
            {/* Waiting message */}
            <h2 className="text-2xl font-bold text-[#9B5DE5] mb-4">
              Great job! 🎉
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              You've finished voting on all drawings!
            </p>
            <p className="text-gray-600">
              Waiting for other players to complete their voting...
            </p>
            
            {/* Progress indicator */}
            <div className="mt-8">
              <div className="flex justify-center gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-[#9B5DE5] rounded-full animate-pulse"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '1s'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9]">
      <NavBar />
      
      <div className="container mx-auto px-4 py-6 flex-grow flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className={`h-2 rounded-full transition-all duration-200 ease-linear ${
                timeLeft <= 3.2 
                  ? 'bg-red-500' 
                  : 'bg-[#00BBF9]'
              }`}
              style={{ width: `${progress}%` }}
            />          </div>
          
          <div className="text-center mb-6">
            <div className={`text-3xl font-bold transition-colors duration-200 ${
              timeLeft <= 3.2 
                ? 'text-red-500' 
                : 'text-[#9B5DE5]'
            }`}>
              {timeLeft}s
            </div>          </div>
          
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-[#9B5DE5]">Prompt:</h2>
            <p className="text-gray-700">{currentImage.promptText}</p>          </div>
          
          <div className="flex justify-center items-center mb-6">            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden max-h-[300px] w-[300px]">
              <img 
                src={currentImage.imageUrl} 
                alt={`Drawing by ${currentImage.authorName}`}
                className="w-full h-full object-contain"
                onError={() => handleImageError(currentImage.id)}
              />
            </div></div>
          
          <div className="bg-gray-200 rounded-lg p-4 mb-6">
            <p className="text-lg font-medium text-center text-[#9B5DE5]">{currentImage.caption}</p>
            <p className="text-sm text-gray-600 text-center mt-2">By: {currentImage.authorName}</p>          </div>
            <div className="mb-8">            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-[#9B5DE5]">Rate this drawing:</h3>
            </div><div className="flex justify-center gap-3">
              {[
                { value: 1, label: '1', emoji: '💩', color: 'bg-red-500 hover:bg-red-600' },
                { value: 2, label: '2', emoji: '🗑️', color: 'bg-orange-500 hover:bg-orange-600' },
                { value: 3, label: '3', emoji: '😐', color: 'bg-yellow-500 hover:bg-yellow-600' },
                { value: 4, label: '4', emoji: '👍', color: 'bg-blue-500 hover:bg-blue-600' },
                { value: 5, label: '5', emoji: '🌟', color: 'bg-green-500 hover:bg-green-600' }
              ].map((option) => (                <button
                  key={option.value}
                  onClick={() => {
                    setRating(option.value);
                    handleSubmit(option.value); // Pass the rating directly
                  }}
                  disabled={isSubmitting}className={`w-16 h-16 rounded-lg transition-all duration-200 ${
                    isSubmitting 
                      ? 'bg-gray-300 opacity-50 cursor-not-allowed' 
                      : `${option.color} ${rating === option.value ? 'opacity-90 scale-105 ring-4 ring-white' : 'opacity-70 hover:opacity-90 hover:scale-105'}`
                  } text-white font-bold flex flex-col items-center justify-center text-xs`}
                >
                  <span className="text-lg">{option.emoji}</span>
                  <span className="capitalize">{option.label}</span>
                </button>
              ))}            </div>
          </div>
          
          <div className="text-center mt-4 text-gray-600">
            {currentIndex + 1} of {images.length} drawings voted
          </div>
        </div>
      </div>
    </div>
  );
}
