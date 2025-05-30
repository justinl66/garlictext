import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9]">
      <NavBar />
      
      <div className="w-full flex flex-col items-center justify-center flex-grow py-10 px-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-8 relative overflow-hidden text-center">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FEE440] rounded-full opacity-20"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#F15BB5] rounded-full opacity-20"></div>
            <div className="relative z-10">
            <h1 className="text-8xl font-bold text-[#9B5DE5] mb-4">404</h1>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Oops! Page Not Found</h2>
            <p className="text-lg text-gray-600 mb-8">
              The page you're looking for doesn't exist or you don't have permission to access it.
            </p>
            
            <div className="mb-8">
              <img 
                src="/garlicTextNoBackground.png" 
                alt="Garlic Text Icon" 
                width={120} 
                height={120} 
                className="mx-auto animate-bounce opacity-70"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            
            <button
              onClick={handleGoHome}
              className="px-8 py-4 bg-gradient-to-r from-[#9B5DE5] to-[#00BBF9] text-white font-bold text-xl rounded-lg hover:opacity-90 transition transform hover:scale-105 active:scale-95 shadow-lg"
            >
              🏠 Go Back Home
            </button>
            
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Lost?</span> No worries! Head back to the home page to create or join a game with your friends.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
