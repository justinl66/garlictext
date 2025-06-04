import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import { AuthContext } from '../../firebase/firebaseAuth';
import { joinGame } from '../../services/game_backend_interact';

// Define a type for a game object (adjust based on your actual game data structure)
interface Game {
  id: string;
  name: string;
  host: string;
  players: number;
  maxPlayers: number;
  rounds: number;
  isFull: boolean;
}

export default function FindGame() {
  const navigate = useNavigate();
  
  const {user} = useContext(AuthContext);

  // State for pending search/filter values (before submission)
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [pendingMaxPlayersFilter, setPendingMaxPlayersFilter] = useState('');
  const [pendingHideFullGames, setPendingHideFullGames] = useState(false);
  const [pendingNumRoundsFilter, setPendingNumRoundsFilter] = useState('');

  const [loading, setLoading] = useState(false);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const [error, setError] = useState<string | null>(null);

  const handleSearchSubmit = async () => {
    setLoading(true);
    try{
      let queryString = '';
      if(pendingSearchTerm) {
        queryString += `?name=${pendingSearchTerm}`;
      }
      if(pendingMaxPlayersFilter) {
        queryString += queryString ? `&maxPlayers=${pendingMaxPlayersFilter}` : `?maxPlayers=${pendingMaxPlayersFilter}`;
      }
      if(pendingNumRoundsFilter) {
        queryString += queryString ? `&rounds=${pendingNumRoundsFilter}` : `?rounds=${pendingNumRoundsFilter}`;
      }
      if(pendingHideFullGames) {
        queryString += queryString ? `&hideFull=true` : `?hideFull=true`;
      }

      const response = await fetch(`http://localhost:5001/api/games/query/${queryString}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setFilteredGames(data);
      setLoading(false);
      setError(null); // Clear any previous errors
    }catch (e: any) {
      setError('Error fetching games:' + e.message);
      setFilteredGames([]);
      setLoading(false);
    }
  };

  const handleJoinGame = async (gameId: string) => {
    if(user?.uid){
      try{
            const result = await joinGame("", gameId, user)
            navigate(`/game/lobby/${result}`);
        }catch (error) {
            setError(`Error joining game: ${error}`);
        }
    }else{
      setJoinCode(gameId); // Store the game ID to join later
      setShowJoinModal(true);
      setPlayerName(''); // Reset player name for non-authenticated users
      setError(null); // Clear any previous errors
    }
  };

  const handleJoinGameNonAuth = async () => {
    try{
        const result = await joinGame(playerName, joinCode, user)
        navigate(`/game/lobby/${result}`);
    }catch (error) {
        setError(`Error joining game: ${error}`);
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9]">
      <NavBar />
      
      <div className="w-full flex flex-col items-center justify-center flex-grow py-10 px-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FEE440] rounded-full opacity-20"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#F15BB5] rounded-full opacity-20"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-[#9B5DE5] mb-6 text-center">Find a Game</h2>
            
            <div className="space-y-6 mb-8">
              {/* Search by Game Name */}
              <div>
                <label htmlFor="gameName" className="block text-gray-700 font-medium mb-2">Search by Game Name</label>
                <input 
                  type="text"
                  id="gameName"
                  value={pendingSearchTerm}
                  onChange={(e) => setPendingSearchTerm(e.target.value)}
                  onKeyDown={(e)=> {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchSubmit();
                    }
                  }}
                  placeholder="e.g., 'Adventure Quest'"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BBF9] text-gray-900"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                {/* Max Players Filter */}
                <div>
                  <label htmlFor="maxPlayers" className="block text-gray-700 font-medium mb-2">Max Players</label>
                  <select
                    id="maxPlayers"
                    value={pendingMaxPlayersFilter}
                    onChange={(e) => setPendingMaxPlayersFilter(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BBF9] text-gray-900"
                  >
                    <option value="">Any</option>
                    <option value="4">4 Players</option>
                    <option value="6">6 Players</option>
                    <option value="8">8 Players</option>
                    <option value="10">10 Players</option>
                    <option value="12">12 Players</option>
                  </select>
                </div>

                {/* Number of Rounds Filter */}
                <div>
                  <label htmlFor="numRounds" className="block text-gray-700 font-medium mb-2">Number of Rounds</label>
                  <select
                    id="numRounds"
                    value={pendingNumRoundsFilter}
                    onChange={(e) => setPendingNumRoundsFilter(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BBF9] text-gray-900"
                  >
                    <option value="">Any</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>

                {/* Hide Full Games Checkbox */}
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="hideFullGames"
                    checked={pendingHideFullGames}
                    onChange={(e) => setPendingHideFullGames(e.target.checked)}
                    // Hide the native checkbox visually, but keep it accessible
                    className="sr-only peer"
                  />
                  <div
                    // This div will be our custom checkbox
                    className={`
                      relative w-5 h-5 rounded border-2 transition-all duration-200 ease-in-out
                      ${pendingHideFullGames // Apply classes based on the pending state
                        ? 'bg-gradient-to-br from-[#9B5DE5] via-[#00BBF9] scale-125' // Checked state: gradient background, no border
                        : 'bg-white border-black' // Unchecked state: white background, black border
                      }
                      peer-focus:ring-2 peer-focus:ring-[#00BBF9] peer-focus:ring-offset-2
                      flex items-center justify-center
                    `}
                    // This makes the custom div clickable and toggles the hidden input
                    onClick={() => setPendingHideFullGames(!pendingHideFullGames)}
                  >
                    {pendingHideFullGames && (
                      // Checkmark for checked state
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <label htmlFor="hideFullGames" className="ml-2 block text-gray-700 font-medium cursor-pointer">
                    Hide Full Games
                  </label>
                </div>
              </div>

              {/* Submit Search Button */}
              <button
                onClick={handleSearchSubmit}
                className="w-full py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-[#9B5DE5] to-[#00BBF9] text-white hover:opacity-90 transform hover:scale-105 transition"
              >
                Search Games
              </button>
            </div>

            {/* Game List */}
            <h3 className="text-2xl font-bold text-[#9B5DE5] mb-4">Available Games</h3>
            {loading ? (
              <p className="text-center text-gray-600">Loading games...</p>
            ) : (
              <div className="space-y-4">
                {filteredGames.length > 0 ? (
                  filteredGames.map((game) => (
                    <div 
                      key={game.id} 
                      className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
                    >
                      <div>
                        <p className="text-lg font-semibold text-gray-800">{game.name} <span className="text-sm text-gray-500">by {game.host}</span></p>
                        <p className="text-sm text-gray-600">Players: {game.players}/{game.maxPlayers} | Rounds: {game.rounds}</p>
                      </div>
                      <button
                        onClick={() => handleJoinGame(game.id)}
                        disabled={game.isFull}
                        className={`px-6 py-2 rounded-lg font-bold text-white transition ${
                          game.isFull
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#00BBF9] to-[#9B5DE5] hover:opacity-90 transform hover:scale-105'
                        }`}
                      >
                        {game.isFull ? 'Full' : 'Join'}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-600">No games found matching your criteria.</p>
                )}
              </div>
            )}
            
            <p className="text-red-500 text-center mt-4">{error}</p>
            
            <div className="text-center mt-8">
              <button 
                onClick={() => navigate('/')}
                className="text-[#9B5DE5] font-medium hover:underline"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-2xl">
                  <button 
                      onClick={() => setShowJoinModal(false)}
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                  </button>
                  
                  <h3 className="text-2xl font-bold text-[#9B5DE5] mb-4">Join a Game</h3>                  
                      {!user && (
                          <div>
                              <label className="block text-gray-700 font-medium mb-2">Your Name</label>
                              <input 
                                  type="text"
                                  value={playerName}
                                  onChange={(e) => setPlayerName(e.target.value)}
                                  placeholder="Enter your name..."
                                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BBF9] text-gray-900"
                              />
                          </div>
                      )}
                      <p className='font-medium text-red-500 mb-2 text-center'>{error}</p>
                      <button 
                          onClick={handleJoinGameNonAuth}
                          disabled={playerName.length < 3 || joinCode.length !== 6}
                          className={`w-full py-4 rounded-lg font-bold text-lg ${
                              (playerName.length  >= 3 && joinCode.length === 6)
                                  ? 'bg-gradient-to-r from-[#9B5DE5] to-[#00BBF9] text-white hover:opacity-90 transition' 
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                      >
                          Join Game
                      </button>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
}
