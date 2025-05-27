import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../General/NavBar';

export default function PromptPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 second timer
  
  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      // Auto-submit when timer reaches zero
      handleSubmit();
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleSubmit = async () => {
    if (isSubmitting || !prompt.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // sedning prompt to backend
      console.log('Prompt submitted:', prompt);
      
      setTimeout(() => {
        navigate('/game/play');
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting prompt:', error);
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9]">
      <NavBar />
      
      <div className="container mx-auto px-4 py-10 flex-grow flex flex-col items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-[#9B5DE5]">Create a Drawing Prompt</h1>
            <div className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-[#9B5DE5]'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="mb-6">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter something fun for others to draw..."
              className="w-full p-4 border-2 border-gray-300 rounded-lg text-xl text-black focus:border-[#00BBF9] focus:ring focus:ring-[#00BBF9] focus:ring-opacity-50 transition h-40"
              maxLength={100}
              disabled={isSubmitting}
            />
            <div className="mt-2 flex justify-end text-gray-500">
              {prompt.length}/100
            </div>
          </div>
          
          <div className="text-center mt-8">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !prompt.trim()}
              className={`px-10 py-4 rounded-lg font-bold text-xl transition ${isSubmitting || !prompt.trim() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-[#9B5DE5] to-[#F15BB5] text-white hover:opacity-90'}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Prompt'}
            </button>
          </div>
          
          <p className="text-center text-gray-600 mt-6">
            Your prompt will be randomly assigned to another player to draw!
          </p>
        </div>
      </div>
    </div>
  );
}
