import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../General/NavBar';
import { AuthContext } from '../../firebase/firebaseAuth';
import Cookies from 'js-cookie';

function delay(delay: number) {
    return new Promise(r => {
        setTimeout(r, delay);
    })
}

export default function PromptPage() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const {user, loading} = useContext(AuthContext);

  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 second timer
  // TODO: In a real application, isPrompter should be determined dynamically,
  // e.g., by fetching user role for the current game room from a backend service.
  // Defaulting to true for demonstration; set to false to see the "waiting" state.
  const [isPrompter, setIsPrompter] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Placeholder for fetching/determining the user's role
  // useEffect(() => {
  //   const fetchUserRole = async () => {
  //     // Example: const role = await gameService.getUserRole(roomId, currentUser.id);
  //     // setIsPrompter(role === 'prompter');
  //   };
  //   fetchUserRole();
  // }, [roomId]);

  useEffect(() => {
    fetchRoomData(true); // Fetch room data on mount
    const pingServer = setInterval(async () => {
      await fetchRoomData(false);
      // alert(creator)
    }, 3000);    return () => clearInterval(pingServer);
  }, [roomId, loading]);

  const fetchRoomData = async (reload: boolean) => {
    const version = reload ? '0' : (Cookies.get('version') || '0');
    try{
      const result = await fetch(`http://localhost:5001/api/games/${roomId}/promptInfo?version=${version}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!result.ok) {
        throw new Error(`HTTP error! status: ${result.status}`);
      }
      const data = await result.json();

      if(data.message == "good"){
        return
      }

      if(data.status && data.status !== "prompting"){
        if(data.status === "drawing"){
          navigate(`/game/play/${roomId}`); 
        }else{
          alert("Stale game: " + data.status);
          navigate('/');
        }
      }

      const userId = user? user.uid : Cookies.get('id') // Get user ID from context or cookies

      setIsPrompter(data.prompterId == userId); // Check if current user is the prompter
    }catch (e:any) {
      setError('Error fetching room data:' + e.message);
      // Handle error (e.g., show a message, redirect, etc.)
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting || !prompt.trim()) return;

    setIsSubmitting(true);

    try {
      const result = await fetch(`http://localhost:5001/api/games/${roomId}/promptSubmit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptString: prompt.trim(),
        }),
      });

      if (!result.ok) {
        throw new Error("HTTP error! status: " + result.statusText);
      }

      navigate(`/game/play/${roomId}`); 

    } catch (e:any) {
      setError('Error submitting prompt:' + e.message);
      setIsSubmitting(false); // Reset on error to allow retry
    }
  }

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      if (isPrompter && !isSubmitting) {
        // Auto-submit for the prompter if time runs out and not already submitting
        handleSubmit();
      }
      // If !isPrompter and time runs out, it means the prompter failed to submit.
      // A real app might navigate back, show a message, etc.
      // For now, the timer just stops, and the waiting player sees the waiting message.
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isPrompter, isSubmitting, handleSubmit]);

  // Format time as MM:SS (no change)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // TODO: For non-prompters, add a listener for game state changes (e.g., via WebSockets)
  // to navigate when the prompt is submitted by the prompter.
  // useEffect(() => {
  //   if (!isPrompter) {
  //     const unsubscribe = gameService.onPromptReady(roomId, () => {
  //       console.log('Prompt is ready, navigating to play...');
  //       navigate(`/game/play/${roomId}`);
  //     });
  //     return () => unsubscribe(); // Cleanup listener on component unmount
  //   }
  // }, [isPrompter, roomId, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-200 via-pink-200 to-sky-200">
      <NavBar />

      <div className="container mx-auto px-4 py-10 flex-grow flex flex-col items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-[#9B5DE5]">
              {isPrompter ? "Create a Drawing Prompt" : "Waiting for Prompt"}
            </h1>
            <div className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-[#9B5DE5]'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>

          {isPrompter ? (
            <>
              <div className="mb-6">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter something fun for others to draw..."
                  className="w-full p-4 border-2 border-gray-300 rounded-lg text-xl text-gray-800 focus:border-[#00BBF9] focus:ring focus:ring-[#00BBF9] focus:ring-opacity-50 transition h-40"
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
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-2xl text-gray-700 mb-4">
                Waiting for another player to submit a drawing idea...
              </p>
              <p className="text-lg text-gray-500">
                The game will begin once the prompt is ready!
              </p>
              <div className="mt-8">
                <svg className="animate-spin h-10 w-10 text-[#9B5DE5] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-center text-gray-600 mt-6">
                Time remaining for prompt submission: {formatTime(timeLeft)}
              </p>
            </div>
          )}
          <p className='mt-3 text-center text-red-500 font-medium'>{error}</p>
        </div>
      </div>
    </div>
  );
}
