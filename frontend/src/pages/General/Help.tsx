import { Link, useNavigate } from 'react-router-dom';
import NavBar from './NavBar.tsx';
import { useEffect } from 'react';
import { startBubbleAnimation } from '../../utils/bubbleAnimation.ts';

export default function Help() {

  const navigate = useNavigate();

  useEffect(() => {
    const cleanup = startBubbleAnimation();
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9] pt-0.5 pb-10 relative">
      <div id="bubble-container" className="absolute inset-0 z-0"></div>
      <NavBar />
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-xl h-full mt-10 pt-10 relative z-10">
        <h1 className="text-4xl font-bold text-[#00B8F5] mb-6">How to Play</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-[#9B5DE5] mb-3">Getting Started</h2>
            <p className="mb-4">Welcome to Garlic Text! Create lobbies with friends and draw up some fun! AI-powered drawings can make any group of friends into funny, weird, and creative meme-makers!</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#9B5DE5] mb-3">Game Rules</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create a game or join an existing one</li>
              <li>Choose or generate a prompt</li>
              <li>Draw picture based on the prompt, with AI-powered boosts</li>
              <li>View everyone's drawings, and vote for the best!</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#9B5DE5] mb-3">Tips & Tricks</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be quick, the timer is ticking!</li>
              <li>Write open-ended prompts to get the best out of the AI</li>
              <li>Surprise other players with unexpected twists</li>
              <li>Have fun and be creative!</li>
            </ul>
          </section>
        </div>
        <div className="mt-8">
          <button 
          onClick={() => navigate(-1)} 
          className="px-6 py-2 bg-[#00B8F5] text-white rounded-md hover:bg-[#00CCB1] transition duration-200 font-semibold"
          >
          ← Back
          </button>
        </div>
      </div>
    </div>
  );
}