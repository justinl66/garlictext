import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';

export default function FindGame() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinGame = () => {
    if (!joinCode) return;
    
    setIsJoining(true);
    // Simulate joining a game
    setTimeout(() => {
      navigate(`/game/lobby/${joinCode.toUpperCase()}`);
    }, 1000);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9]">
      <NavBar />
      
      <div className="w-full flex flex-col items-center justify-center flex-grow py-10 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FEE440] rounded-full opacity-20"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#F15BB5] rounded-full opacity-20"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-[#9B5DE5] mb-6 text-center">Find a Game</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Enter Game Code</label>                <input 
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BBF9] text-center font-mono text-lg text-gray-900"
                  maxLength={6}
                  disabled={isJoining}
                />
              </div>
              
              <button 
                onClick={handleJoinGame}
                disabled={!joinCode || isJoining}
                className={`w-full py-4 rounded-lg font-bold text-lg transition ${
                  joinCode && !isJoining
                    ? 'bg-gradient-to-r from-[#9B5DE5] to-[#00BBF9] text-white hover:opacity-90 transform hover:scale-105' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isJoining ? 'Joining...' : 'Join Game'}
              </button>
              
              <div className="text-center">
                <p className="text-gray-600 mb-4">or</p>
                <button 
                  onClick={() => navigate('/')}
                  className="text-[#9B5DE5] font-medium hover:underline"
                >
                  ← Back to Home
                </button>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Tip:</span> Ask your friend for the 6-character game code they got when creating the game.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
