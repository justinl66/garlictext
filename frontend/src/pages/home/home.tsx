import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../firebase/firebaseAuth.tsx';
import NavBar from '../General/NavBar.tsx';
import { useNavigate } from 'react-router-dom';
import { createGame, joinGame } from '../../services/game_backend_interact.ts';

export default function HomePage() {
    const authContext = useContext(AuthContext);
    
    // Handle null context
    if (!authContext) {
        return <div>Loading...</div>;
    }
    
    const { user, loading } = authContext;
    const [roomName, setRoomName] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createdCode, setCreatedCode] = useState<string | null>(null);

    const [joinError, setJoinError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        if(createdCode){
            navigate(`/game/lobby/${createdCode}`);
        }
    }, [createdCode]);

    const createGameHandler = async () => {
        if(!roomName || roomName.length < 3) {
            setError("Please enter a valid room name (at least 3 characters).");
            return;
        }
        if(user?.uid){
            const result = await createGame(roomName, user?.stsTokenManager.accessToken);
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
        if(!joinCode || joinCode.length !== 6) {
            setJoinError("Please enter a valid room code.");
            return;
        }

        try{
            const result = await joinGame(playerName, joinCode, user)
            navigate(`/game/lobby/${result}`);
        }catch (error) {
            setJoinError(`Error joining game: ${error}`);
        }
    }

    // Show loading state while Firebase is determining auth state
    if (loading) {
        return (
            <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9]">
                <NavBar />
                <div className="w-full flex flex-col items-center justify-center flex-grow">
                    <div className="w-24 h-24 border-8 border-t-[#FEE440] border-white rounded-full animate-spin"></div>
                    <p className="text-white text-lg font-semibold mt-4">Loading...</p>
                </div>
            </div>
        );
    }

    return(
        <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9]">
            <NavBar />
            
            <div className="w-full flex flex-col items-center justify-center flex-grow py-10">
                <div className="flex flex-row justify-center items-center mb-6">
                    <h2 className="text-6xl font-sans font-bold text-[#FEE440] text-shadow-lg">GarlicText</h2>
                    <img src={"/garlicTextNoBackground.png"} alt="garlicTextIcon" width={80} height={80} className="animate-[--custom-bounce_0.65s_ease-in-out_infinite] ml-3"/>
                </div>
                
                
                <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FEE440] rounded-full opacity-20"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#F15BB5] rounded-full opacity-20"></div>
                    
                    <h3 className="text-3xl font-bold text-[#9B5DE5] mb-6">Create a Game</h3>
                    
                    <div className="space-y-5 relative z-10">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Room Name</label>                            <input 
                                type="text"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                placeholder="Enter a room name..."
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BBF9] text-gray-900"
                            />
                        </div>
                        <p className='font-medium text-red-500'>{error}</p>
                        
                          <button 
                            onClick={createGameHandler}
                            className="w-full py-4 bg-gradient-to-r from-[#9B5DE5] to-[#00BBF9] text-white font-bold text-lg rounded-lg hover:opacity-90 transition transform hover:scale-105 active:scale-95 shadow-lg"
                        >
                            Create Game
                        </button>
                        
                        <div className="text-center mt-4">
                            <p className="text-gray-600">or</p>
                            <button 
                                onClick={() => setShowJoinModal(true)}
                                className="mt-2 text-[#9B5DE5] font-medium hover:underline"
                            >Join with a code</button>                        
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
                            
                            <div className="space-y-4">                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Room Code</label>
                                    <input 
                                        type="text"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                        placeholder="Enter room code..."
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BBF9] text-gray-900"
                                        maxLength={6}
                                    />
                                </div>
                                
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
                                <p className='font-medium text-red-500 mb-2 text-center'>{joinError}</p>
                                <button 
                                    onClick={joinGameHandler}
                                    disabled={!joinCode}
                                    className={`w-full py-4 rounded-lg font-bold text-lg ${
                                        joinCode 
                                            ? 'bg-gradient-to-r from-[#9B5DE5] to-[#00BBF9] text-white hover:opacity-90 transition' 
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    Join Game
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )

}
