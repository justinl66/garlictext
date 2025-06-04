import { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../General/NavBar';
import { AuthContext } from '../../firebase/firebaseAuth';
import { Player } from '../../interfaces';
import Cookies from "js-cookie";

export default function GameLobby() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const {user} = useContext(AuthContext);

  const [gameName, setGameName] = useState<string>('');
  const [creator, setCreator] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameSettings, setGameSettings] = useState({
    rounds: 3,
    drawingTime: 60,
    writingTime: 60,
    maxPlayers: 10,
  });
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);


  const updateLobbyFromServer = async (reloaded: boolean) => {
    let currentUpdate = reloaded? "0" : (Cookies.get('currentUpdate') || "0");

    try{
        const response = await fetch(`http://localhost:5001/api/games/${roomId}/lobbyInfo?version=${currentUpdate}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if(response.status === 222){
                setGameStarted(true);
                setError(null);
                return;
            }
            throw new Error('Network response was not ok: ' + response.statusText); 
        }

        const data = await response.json();
        if(data.message === "good" && !reloaded){
            return;
        }
        setGameName(data.name);
        setCreator(data.gameHost);
        
        if(data.players && data.players.length < 4){
          let newPlayers: Player[] = data.players;
          for(let i = data.players.length; i < 4; i++){
            newPlayers.push({
              id: i,
              name: "Waiting for player...",
              avatar: '/garlicTextNoBackground.png',
              isReady: false,
            });
          }
          setPlayers(newPlayers);
        }else{
          setPlayers(data.players || []);
        }

        setGameSettings({
            rounds: data.rounds,
            drawingTime: data.drawingTime,
            writingTime: data.writingTime,
            maxPlayers: data.maxPlayers,
        });
        Cookies.set('currentUpdate', data.currentUpdate || "0");
        setError(null);

    }catch(e:any){
        setError("Error fetching data: " + e.message);
        return;
    }
  }

  const updateRounds = async (rounds: number) => {
    setGameSettings({...gameSettings, rounds: rounds})
    try{
     const response = await fetch(`http://localhost:5001/api/games/${roomId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.stsTokenManager.accessToken}`,
      },
      body: JSON.stringify({ rounds }),
    })

    if (!response.ok) {
      const errorText = await response.json();
      throw new Error(errorText.message);
      return;
    }
  }catch(e:any){
    setError("Error updating rounds: " + e.message);
    return;
  }
}

  const updateDrawingTime = async (drawingTime: number) => {
    setGameSettings({...gameSettings, drawingTime: drawingTime})
    try{
    const response = await fetch(`http://localhost:5001/api/games/${roomId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.stsTokenManager.accessToken}`,
      },
      body: JSON.stringify({ drawingTime }),
    })
    if (!response.ok) {
      const errorText = await response.json();
      throw new Error(errorText.message);
    }
  } catch(e:any){
    setError("Error updating drawing time: " + e.message);
    return;
  }
}

const updateWritingTime = async (writingTime: number) => {
  setGameSettings({...gameSettings, writingTime: writingTime})
  try{
    const response = await fetch(`http://localhost:5001/api/games/${roomId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.stsTokenManager.accessToken}`,
      },
      body: JSON.stringify({ writingTime }),
    })
    if (!response.ok) { 
      const errorText = await response.json();
      throw new Error(errorText.message);
    }
  } catch(e:any){
    setError("Error updating writing time: " + e.message);
    return;
  }
}

  const leaveGame = async () => {
    try {
      if(user?.uid){
        const response = await fetch(`http://localhost:5001/api/games/leave/${roomId}/auth`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.stsTokenManager.accessToken}`,
          },
          body: JSON.stringify({ userId: user?.uid }),
        });
        if (!response.ok) {
          const errorText = await response.json();
          throw new Error(errorText.message);
        }
      }else{
        const response = await fetch(`http://localhost:5001/api/games/leave/${roomId}/nauth`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: Cookies.get('id') }),
        });
        if (!response.ok) {
          const errorText = await response.json();
          throw new Error(errorText.message);
        }
      }
      navigate('/');
    } catch (error) {
      setError("Error leaving game: " + (error as Error).message);
    }
  };

  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  useEffect(() => {
    if (!roomId) {
      navigate('/'); // Redirect to home if no roomId
    }

    updateLobbyFromServer(true);

    const pingServer = setInterval(async () => {
      await updateLobbyFromServer(false);
      // alert(creator)
    }, 3000);

    return () => clearInterval(pingServer);
  }, [roomId]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId  || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const startGame = () => {
    setIsStarting(true);
    setTimeout(() => {
      navigate('/game/prompts/' + roomId);
    }, 2000);
  };
  // const canStart = players.filter(p => p.isReady).length >= 2 && isCreator;

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
                <p className="text-2xl font-mono font-bold text-gray-800">{roomId}</p>
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
                {players.map((player:Player) => (
                <div key={player.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#9B5DE5] to-[#00BBF9] flex items-center justify-center text-white font-bold">
                      {player.avatar ? (
                        <img src={player.avatar} alt={player.name} className="w-8 h-8" />
                      ) : (
                        player.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-800">{player.name}</p>
                    </div>
                    <div>
                      
                      {creator == player.id ?(
                        <img src="/crown.png" alt="Host" className="w-8 h-8 mr-1.5" />
                      ): (
                        <>
                          {player.isReady ? (
                            <span className="text-green-500 text-sm font-medium">Ready</span>
                          ) : (
                            <span className="text-gray-400 text-sm">Waiting...</span>
                          )}
                        </>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            </div>
            
              <div>                <h3 className="text-xl font-semibold mb-4 text-[#9B5DE5]">Game Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-800 font-medium mb-2">Rounds</label>
                    <select 
                      value={gameSettings.rounds}
                      onChange={(e) => updateRounds(+e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BBF9] text-gray-800"
                      disabled={creator != user?.uid}
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
                      onChange={(e) => updateDrawingTime(+e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BBF9] text-gray-800"
                      disabled={user?.uid != creator}
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
                      onChange={(e) => updateWritingTime(+e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BBF9] text-gray-800"
                      disabled={user?.uid != creator}
                    >
                      <option value={30}>30 seconds</option>
                      <option value={60}>60 seconds</option>
                      <option value={90}>90 seconds</option>
                      <option value={120}>120 seconds</option>
                    </select>
                  </div>
                </div>
              </div>
          </div>
          
          <div className="flex justify-between items-center">
            <button 
              onClick={leaveGame}
              className="px-6 py-3 border border-[#9B5DE5] text-[#9B5DE5] rounded-lg hover:bg-[#9B5DE5] hover:text-white transition"
            >
              Leave Game
            </button>
            
            <button 
              onClick={startGame}
              disabled={creator != user?.uid || isStarting}
              className={`px-8 py-3 rounded-lg font-bold transition ${
                (user?.uid && creator == user?.uid) && !isStarting
                  ? 'bg-gradient-to-r from-[#9B5DE5] to-[#00BBF9] text-white hover:opacity-90 transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isStarting ? 'Starting...' : 'Start Game'}
            </button>          </div>
          
          {creator != user?.uid && (
            <p className="mt-4 text-center text-gray-700 font-medium">Waiting for the host to start the game...</p>
          )}
          <p className='mt-3 text-center text-red-500 font-medium'>{error}</p>
        </div>
      </div>
    </div>
  );
}
