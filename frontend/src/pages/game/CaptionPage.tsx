import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../General/NavBar';

export default function CaptionPage() {
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const imageUrl = '/garlicTextNoBackground.png';
  
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
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleSubmit = async () => {
    if (isSubmitting || !caption.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('Caption submitted:', caption);
      
      setTimeout(() => {
        navigate('/game/lobby');
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting caption:', error);
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9]">
      <NavBar />
      
      <div className="container mx-auto px-4 py-6 flex-grow flex flex-col">
        <div className="bg-white rounded-xl shadow-2xl p-6 flex-grow flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#9B5DE5]">Write a Caption!</h2>
              <p className="text-gray-600">Be creative and funny with your caption</p>
            </div>
            <div className="flex items-center">
              <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-[#9B5DE5]'}`}>
                {formatTime(timeLeft)}
              </div>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || !caption.trim()}
                className={`ml-4 px-6 py-2 rounded-lg font-bold transition ${
                  isSubmitting || !caption.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-[#00CCB1] text-white hover:bg-[#00B8A0]'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Caption'}
              </button>
            </div>
          </div>
          
          <div className="flex-grow flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex items-center justify-center border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              <img 
                src={imageUrl} 
                alt="Drawing to caption" 
                className="max-w-full max-h-[500px] object-contain"
              />
            </div>
            
            <div className="flex-1 flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-[#9B5DE5] mb-2">
                  What's happening in this image?
                </h3>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a funny caption for this image..."
                  className="w-full p-4 border-2 border-gray-300 rounded-lg text-lg text-gray-800 focus:border-[#00BBF9] focus:ring focus:ring-[#00BBF9] focus:ring-opacity-50 transition h-40"
                  maxLength={150}
                  disabled={isSubmitting}
                />
                <div className="mt-2 flex justify-end text-gray-500">
                  {caption.length}/150
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">How it works:</span> This image was drawn by another player and enhanced by AI. Your caption will be paired with the image and shown to other players in the next round.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
