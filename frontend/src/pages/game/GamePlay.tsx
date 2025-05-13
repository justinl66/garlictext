import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../General/NavBar';

export default function GamePlay() {
  const navigate = useNavigate();
  const [roundNumber, setRoundNumber] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isDrawingPhase, setIsDrawingPhase] = useState(true);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (isDrawingPhase) {
            setIsDrawingPhase(false);
            return 60;
          } else {
            if (roundNumber < 3) {
              setRoundNumber(prev => prev + 1);
              setIsDrawingPhase(true);
              return 60;
            } else {
              setTimeout(() => navigate('/'), 3000);
              return 0;
            }
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, roundNumber, isDrawingPhase]);

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9]">
      <NavBar />
      
      <div className="w-full flex flex-col items-center justify-center flex-grow py-10 px-4">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-[#9B5DE5]">
                {isDrawingPhase ? "Draw It!" : "Describe It!"}
              </h2>
              <p className="text-gray-600">Round {roundNumber}/3</p>
            </div>
            
            <div className="bg-[#00BBF9] text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold">
              {timeLeft}
            </div>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center min-h-[400px] mb-6">
            {isDrawingPhase ? (
              <div className="text-center">
                <p className="text-xl text-gray-700 mb-4">
                  Draw: "a dancing garlic with a top hat"
                </p>                <div className="w-full h-[300px] bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <p className="text-gray-500 font-medium">Drawing Canvas Would Go Here</p>
                </div>
              </div>
            ) : (
              <div className="text-center w-full">
                <p className="text-xl text-gray-700 mb-4">
                  Describe what you see:
                </p>
                <div className="w-full h-[300px] bg-white rounded-lg border-2 border-gray-300 mb-4 flex items-center justify-center">
                  <p className="text-gray-500 font-medium">Drawing from previous player would appear here</p>
                </div>
                <textarea
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BBF9] resize-none"
                  placeholder="Type your description here..."
                  rows={3}
                ></textarea>
              </div>
            )}
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-[#9B5DE5] text-[#9B5DE5] rounded-lg hover:bg-[#9B5DE5] hover:text-white transition"
            >
              Leave Game
            </button>
            
            <button
              className="px-8 py-3 bg-gradient-to-r from-[#9B5DE5] to-[#00BBF9] text-white font-bold rounded-lg hover:opacity-90 transition"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
