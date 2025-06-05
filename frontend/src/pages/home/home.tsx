import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../firebase/firebaseAuth.tsx';
import NavBar from '../General/NavBar.tsx';
import { useNavigate } from 'react-router-dom';
import { createGame, joinGame } from '../../services/game_backend_interact.ts';

export default function HomePage() {
    const authContext = useContext(AuthContext);

    // Handle null context
    if (!authContext) {
        return <div className="flex items-center justify-center min-h-screen bg-slate-100"><div className="text-xl font-semibold text-slate-700">Loading Authentication...</div></div>;
    }

    const { user, loading } = authContext;
    const [roomName, setRoomName] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [createdCode, setCreatedCode] = useState<string | null>(null);
    const [joinError, setJoinError] = useState<string | null>(null);

    // New state to manage which view/form is active
    const [activeView, setActiveView] = useState<'choice' | 'create' | 'join'>('choice');

    const navigate = useNavigate();

    useEffect(() => {
        if (createdCode) {
            navigate(`/game/lobby/${createdCode}`);
        }
    }, [createdCode, navigate]);

    const createGameHandler = async () => {
        if(!roomName || roomName.length < 3) {
            setError("Please enter a valid room name (at least 3 characters).");
            return;
        }
        if(user?.uid){
            // Ensure you have the correct way to get the accessToken if stsTokenManager is not directly available
            const token = user.stsTokenManager?.accessToken || await user.getIdToken();
            const result = await createGame(roomName, token);
            if(result.startsWith("Error")) {
                setError(result);
                return;
            }else{
                setCreatedCode(result);
            }
        }else{
            setError("You must be logged in to create a game.");
            return;
        }
    }

    const joinGameHandler = async () => {
        setJoinError(null); // Clear previous errors

        if (!joinCode || joinCode.length !== 6) {
            setJoinError("Please enter a valid 6-character room code.");
            return;
        }

        let nameToUse: string;

        if (user) {
            nameToUse = user.displayName || (user.email ? user.email.split('@')[0] : `Player${Math.floor(Math.random() * 1000)}`);
            if (!nameToUse) {
                 nameToUse = `Player${Math.floor(Math.random() * 1000)}`;
            }
        } else {
            if (!playerName.trim()) {
                setJoinError("Please enter your name to join as a guest.");
                return;
            }
            nameToUse = playerName.trim();
        }

        try {
            const gameId = await joinGame(nameToUse, joinCode.toUpperCase(), user);
            if (gameId.startsWith("Error:")) {
                setJoinError(gameId);
            } else {
                navigate(`/game/lobby/${gameId}`);
            }
        } catch (err) {
            if (err instanceof Error) {
                setJoinError(`Error joining game: ${err.message}`);
            } else {
                setJoinError("An unknown error occurred while joining the game.");
            }
        }
    }
    
    const handleBackToChoice = () => {
        setActiveView('choice');
        setError(null);
        setJoinError(null);
        setRoomName("");
        setJoinCode("");
        setPlayerName("");
    }

    // Show loading state while Firebase is determining auth state
    if (loading) {
        return (
            <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-300 via-pink-300 to-blue-300">
                <NavBar />
                <div className="w-full flex flex-col items-center justify-center flex-grow">
                    <div className="w-24 h-24 border-8 border-t-yellow-300 border-white rounded-full animate-spin"></div>
                    <p className="text-slate-700 text-lg font-semibold mt-4">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-purple-200 via-pink-200 to-sky-200 text-slate-800">
            <NavBar />

            <div className="w-full flex flex-col items-center justify-center flex-grow py-10 px-4">
                <div className="flex flex-col justify-center items-center mb-12 text-center">
                    <img src={"/garlicTextNoBackground.png"} alt="GarlicText Icon" className="w-32 h-32 md:w-40 md:h-40 mb-2 animate-[--custom-bounce_0.8s_ease-in-out_infinite]" style={{"--custom-bounce-height": "-20px"} as React.CSSProperties} />
                    <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'cursive'" }}>
                        GarlicText
                    </h1>
                    <p className="text-slate-600 mt-2 text-lg">The game of hilarious misinterpretations!</p>
                </div>

                {activeView === 'choice' && (
                    <div className="space-y-6 md:space-y-0 md:space-x-8 flex flex-col md:flex-row">
                        <button
                            onClick={() => setActiveView('create')}
                            className="w-full md:w-72 py-4 px-8 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center"
                        >
                            {/* <PlusCircleIcon className="h-7 w-7 mr-3" /> */}
                            Create a New Game
                        </button>
                        <button
                            onClick={() => setActiveView('join')}
                            className="w-full md:w-72 py-4 px-8 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center"
                        >
                            {/* <ArrowRightOnRectangleIcon className="h-7 w-7 mr-3" /> */}
                            Join an Existing Game
                        </button>
                    </div>
                )}

                {activeView === 'create' && (
                    <div className="w-full max-w-lg bg-white/80 backdrop-blur-md rounded-xl shadow-2xl p-8 relative overflow-hidden border border-purple-300">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-300/50 rounded-full filter blur-xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-300/50 rounded-full filter blur-xl"></div>
                        
                        <button onClick={handleBackToChoice} className="absolute top-4 left-4 text-slate-600 hover:text-purple-600 transition-colors">
                            &larr; Back
                        </button>
                        <h3 className="text-3xl font-bold text-purple-600 mb-6 text-center relative z-10">Create a Game</h3>
                        <div className="space-y-5 relative z-10">
                            <div>
                                <label className="block text-slate-700 font-medium mb-2">Room Name</label>
                                <input
                                    type="text"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    placeholder="Enter a fun room name..."
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 shadow-sm"
                                />
                            </div>
                            {error && <p className='font-medium text-red-500 text-sm text-center'>{error}</p>}
                            <button
                                onClick={createGameHandler}
                                className="w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold text-lg rounded-lg hover:opacity-90 transition transform hover:scale-105 active:scale-95 shadow-md"
                            >
                                Let's Go!
                            </button>
                        </div>
                    </div>
                )}

                {activeView === 'join' && (
                    <div className="w-full max-w-lg bg-white/80 backdrop-blur-md rounded-xl shadow-2xl p-8 relative overflow-hidden border border-orange-300">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-300/50 rounded-full filter blur-xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-300/50 rounded-full filter blur-xl"></div>

                        <button onClick={handleBackToChoice} className="absolute top-4 left-4 text-slate-600 hover:text-orange-600 transition-colors">
                            &larr; Back
                        </button>
                        <h3 className="text-3xl font-bold text-orange-600 mb-6 text-center relative z-10">Join a Game</h3>
                        <div className="space-y-5 relative z-10">
                            <div>
                                <label className="block text-slate-700 font-medium mb-2">Room Code</label>
                                <input
                                    type="text"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    placeholder="Enter 6-character code..."
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 shadow-sm"
                                    maxLength={6}
                                />
                            </div>
                            {!user && (
                                <div>
                                    <label className="block text-slate-700 font-medium mb-2">Your Name (Guest)</label>
                                    <input
                                        type="text"
                                        value={playerName}
                                        onChange={(e) => setPlayerName(e.target.value)}
                                        placeholder="Enter your display name..."
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 shadow-sm"
                                    />
                                </div>
                            )}
                            {joinError && <p className='font-medium text-red-500 text-sm text-center'>{joinError}</p>}
                            <button
                                onClick={joinGameHandler}
                                disabled={!joinCode || (joinCode.length !== 6) || (!user && !playerName.trim())}
                                className={`w-full py-3 rounded-lg font-bold text-lg transition transform hover:scale-105 active:scale-95 shadow-md ${
                                    (joinCode && joinCode.length === 6 && (user || playerName.trim()))
                                        ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white hover:opacity-90'
                                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                }`}
                            >
                                Jump In!
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Quick note on the garlic icon animation:
// You might need to define the --custom-bounce keyframes in your global CSS (e.g., index.css)
// if it's not already defined or if you want a different bounce effect.
// Example for index.css:
/*
@keyframes custom-bounce {
  0%, 100% {
    transform: translateY(var(--custom-bounce-height, -25%));
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
.animate-\[--custom-bounce_0\.8s_ease-in-out_infinite\] {
  animation: custom-bounce 0.8s ease-in-out infinite;
}
*/

// If you decide to use Heroicons:
// 1. Install: npm install @heroicons/react
// 2. Uncomment the import at the top.
// 3. Uncomment the icon components within the buttons.
