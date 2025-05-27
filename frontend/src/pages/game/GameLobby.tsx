import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../General/NavBar';

interface Player {
  id: string;
  name: string;
  avatar?: string;
  isReady: boolean;
}

export default function GameLobby() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState<string>(roomId || '');
  const [isCreator, setIsCreator] = useState<boolean>(roomId ? false : true);
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'You', avatar: '/garlicTextNoBackground.png', isReady: true },
    { id: '2', name: 'Waiting for player...', isReady: false },
    { id: '3', name: 'Waiting for player...', isReady: false },
    { id: '4', name: 'Waiting for player...', isReady: false },
  ]);
  const [gameSettings, setGameSettings] = useState({
    rounds: 3,
    drawingTime: 60,
    writingTime: 60,
  });
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  useEffect(() => {
    if (!roomId) {
      const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      setRoomCode(generatedCode);
    }
    const playerJoinInterval = setInterval(() => {
      setPlayers(currentPlayers => {
        const emptySlotIndex = currentPlayers.findIndex(p => p.name.includes('Waiting'));
        if (emptySlotIndex === -1) return currentPlayers;

        const names = ['Alex', 'Taylor', 'Jordan', 'Riley', 'Casey', 'Morgan'];
        const randomName = names[Math.floor(Math.random() * names.length)];
        
        const newPlayers = [...currentPlayers];
        newPlayers[emptySlotIndex] = {
          id: `player-${Date.now()}`,
          name: randomName,
          isReady: true
        };
        
        return newPlayers;
      });
    }, 3000);

    return () => clearInterval(playerJoinInterval);
  }, [roomId]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const startGame = () => {
    setIsStarting(true);
    setTimeout(() => {
      // Navigate to the prompt page first instead of directly to gameplay
      navigate('/game/prompts');
    }, 2000);
  };
  const canStart = players.filter(p => p.isReady).length >= 2 && isCreator;

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9]">
      <NavBar />
      
      <div className="w-full flex flex-col items-center justify-center flex-grow py-10 px-4">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FEE440] rounded-full opacity-20"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#F15BB5] rounded-full opacity-20"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start mb-10 relative z-10">
            <div>
              <h2 className="text-3xl font-bold text-[#9B5DE5]">Game Lobby</h2>
              <p className="text-gray-600">Waiting for players to join...</p>
            </div>
              <div className="mt-4 md:mt-0 bg-gray-100 p-4 rounded-lg flex items-center shadow-md">
              <div>
                <p className="text-sm text-gray-600 font-medium">Room Code:</p>
                <p className="text-2xl font-mono font-bold text-gray-800">{roomCode}</p>
              </div>
              <button 
                onClick={copyRoomCode}
                className="ml-4 p-2 bg-[#00BBF9] text-white rounded hover:bg-[#009BD9] transition"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>              <h3 className="text-xl font-semibold mb-4 text-[#9B5DE5]">Players</h3>
              <div className="space-y-3">
                {players.map((player) => (
                <div key={player.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#9B5DE5] to-[#00BBF9] flex items-center justify-center text-white font-bold">
                      {player.avatar ? (
                        <img src={player.avatar} alt={player.name} className="w-8 h-8" />
                      ) : (
                        player.name.charAt(0)
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-800">{player.name}</p>
                    </div>
                    <div>
                      {player.isReady ? (
                        <span className="text-green-500 text-sm font-medium">Ready</span>
                      ) : (
                        <span className="text-gray-400 text-sm">Waiting...</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {isCreator && (
              <div>                <h3 className="text-xl font-semibold mb-4 text-[#9B5DE5]">Game Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-800 font-medium mb-2">Rounds</label>
                    <select 
                      value={gameSettings.rounds}
                      onChange={(e) => setGameSettings({...gameSettings, rounds: +e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BBF9] text-gray-800"
                    >
                      <option value={2}>2 Rounds</option>
                      <option value={3}>3 Rounds</option>
                      <option value={4}>4 Rounds</option>
                      <option value={5}>5 Rounds</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-800 font-medium mb-2">Drawing Time</label>
                    <select 
                      value={gameSettings.drawingTime}
                      onChange={(e) => setGameSettings({...gameSettings, drawingTime: +e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BBF9] text-gray-800"
                    >
                      <option value={30}>30 seconds</option>
                      <option value={60}>60 seconds</option>
                      <option value={90}>90 seconds</option>
                      <option value={120}>120 seconds</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-800 font-medium mb-2">Writing Time</label>
                    <select 
                      value={gameSettings.writingTime}
                      onChange={(e) => setGameSettings({...gameSettings, writingTime: +e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BBF9] text-gray-800"
                    >
                      <option value={30}>30 seconds</option>
                      <option value={60}>60 seconds</option>
                      <option value={90}>90 seconds</option>
                      <option value={120}>120 seconds</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-[#9B5DE5] text-[#9B5DE5] rounded-lg hover:bg-[#9B5DE5] hover:text-white transition"
            >
              Leave Game
            </button>
            
            <button 
              onClick={startGame}
              disabled={!canStart || isStarting}
              className={`px-8 py-3 rounded-lg font-bold transition ${
                canStart && !isStarting
                  ? 'bg-gradient-to-r from-[#9B5DE5] to-[#00BBF9] text-white hover:opacity-90 transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isStarting ? 'Starting...' : 'Start Game'}
            </button>          </div>
          
          {!isCreator && (
            <p className="mt-4 text-center text-gray-700 font-medium">Waiting for the host to start the game...</p>
          )}
        </div>
      </div>
    </div>
  );
}
