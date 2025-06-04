import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';

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
  
  // State for pending search/filter values (before submission)
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [pendingMaxPlayersFilter, setPendingMaxPlayersFilter] = useState('');
  const [pendingHideFullGames, setPendingHideFullGames] = useState(false);
  const [pendingNumRoundsFilter, setPendingNumRoundsFilter] = useState('');

  const [loading, setLoading] = useState(false);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);

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
      setLoading(false);
    }
  };

  const handleJoinGame = (gameId: string) => {
    navigate(`/game/lobby/${gameId}`);
  };

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
                  placeholder="e.g., 'Adventure Quest'"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BBF9] text-gray-900"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6+</option>
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
                    <option value="5">5</option>
                    <option value="8">8</option>
                    <option value="10">10</option>
                    <option value="12">12</option>
                  </select>
                </div>

                {/* Hide Full Games Checkbox */}
                <div className="flex items-center mt-2 md:mt-0">
                  <input
                    type="checkbox"
                    id="hideFullGames"
                    checked={pendingHideFullGames}
                    onChange={(e) => setPendingHideFullGames(e.target.checked)}
                    className="h-5 w-5 text-[#00BBF9] rounded border-gray-300 focus:ring-[#00BBF9]"
                  />
                  <label htmlFor="hideFullGames" className="ml-2 block text-gray-700 font-medium">Hide Full Games</label>
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
      </div>
    </div>
  );
}
