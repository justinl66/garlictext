import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import NavBar from '../General/NavBar';

import { AuthContext } from '../../firebase/firebaseAuth';
import imageStorageService from '../../services/imageStorageService';
import dbService from '../../services/dbService';
import { ImPower } from "react-icons/im";
import { MdOutlineSwitchAccount } from "react-icons/md";
import { BsCloudFog2Fill } from "react-icons/bs";
import { RiKnifeBloodLine } from "react-icons/ri";
import { TiDelete } from "react-icons/ti";
import { PiPaintBucket } from "react-icons/pi";
import { ImCross, ImCheckmark } from "react-icons/im";


export default function DrawingPage() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    return <div>Loading...</div>;
  }
  
  const { user: currentUser } = authContext;
  
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [canvasMode, setCanvasMode] = useState<'draw' | 'erase'>('draw');
  const [theme, setTheme] = useState<string>('');
  const [isLoadingTheme, setIsLoadingTheme] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState<'not_submitted' | 'submitting' | 'enhancing'>('not_submitted');
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseOverCanvas, setIsMouseOverCanvas] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [activePowerUps, setActivePowerUps] = useState({
    sabotage: false,
    delete: false,
    switch: false,
    fog: false
  });
  const [showColorConfirm, setShowColorConfirm] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('');
  
  const canvasRef = useRef<ReactSketchCanvasRef>(null);

  useEffect(() => {
    const fetchGameData = async () => {
      if (!roomId) {
        console.error('Room ID is required');
        return;
      }

      try {
        setIsLoadingTheme(true);
        const gameData = await dbService.game.getGameByCode(roomId);
        
        if (gameData && gameData.promptString) {
          setTheme(gameData.promptString);
        } else {
          console.warn('No theme found in game data, using fallback');
          setTheme('Draw anything you like!');
        }
      } catch (error) {
        console.error('Error fetching game data:', error);
        setTheme('Draw anything you like!');
      } finally {
        setIsLoadingTheme(false);
      }
    };

    fetchGameData();
  }, [roomId]);
  
  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);
  
  // Updated colors to color scheme but aesthetics
  const colors = [
    '#FFFFFF', // White
    '#F9C74F', // Warm Yellow
    '#F3722C', // Deep Orange
    '#F94144', // Vivid Red
    '#A47149', // Earthy Copper Brown
    '#E4A5B9', // Soft Rose Pink
    '#90BE6D', // Muted Green
    '#43AA8B', // Teal
    '#277DA1', // Deep Cerulean
    '#5B0046', // Purple
    '#5A5A5A', // Deep Gray
    '#000000', // Black
  ];
    const handleClearCanvas = () => {
    setShowClearConfirmation(true);
  };
  const confirmClearCanvas = () => {
    canvasRef.current?.clearCanvas();
    canvasRef.current?.resetCanvas();
    setShowClearConfirmation(false);
  };
  
  const handleUndo = () => {
    canvasRef.current?.undo();
  };
  
  const handleRedo = () => {
    canvasRef.current?.redo();
  };
  
  const handleModeChange = (mode: 'draw' | 'erase') => {
    setCanvasMode(mode);
    if (mode === 'erase') {
      canvasRef.current?.eraseMode(true);
    } else {
      canvasRef.current?.eraseMode(false);
    }
  };
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    if (!currentUser) {
      console.error('User not authenticated');
      alert('Please log in to submit your drawing');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStage('submitting');
    
    try {
      // Get the drawing as a data URL
      const dataURL = await canvasRef.current?.exportImage('png');
        if (!dataURL) {
        throw new Error('Failed to export canvas image');
      }    
      const submissionData: any = {
        prompt: theme,
        drawingDataURL: dataURL
      };

      // Only include roundId if it's available
      if (roomId) {
        submissionData.roundId = roomId;
      }      const result = await imageStorageService.submitDrawing(submissionData);
        setSubmitStage('enhancing');
        setTimeout(() => {
        navigate(`/game/caption/${roomId}`, { 
          state: { 
            imageId: result.imageId,
            originalImageUrl: result.originalImageUrl,
            roomId: roomId
          } 
        });
      }, 2000);
        } catch (error) {
      alert('Failed to submit drawing. Please try again.');
      setIsSubmitting(false);
      setSubmitStage('not_submitted');
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  
  const handleSabotage = () => {
    setActivePowerUps(prev => ({
      ...prev,
      sabotage: !prev.sabotage
    }));
  };
  
  const handleDelete = () => {
    setActivePowerUps(prev => ({
      ...prev,
      delete: !prev.delete
    }));
  };
  
  const handleSwitch = () => {
    setActivePowerUps(prev => ({
      ...prev,
      switch: !prev.switch
    }));
  };
  
  const handleFog = () => {
    setActivePowerUps(prev => ({
      ...prev,
      fog: !prev.fog
    }));
  };
  
  const handlePaintBucket = () => {
    setShowColorConfirm(true);
  };
  
  const handleColorConfirm = (confirmed: boolean) => {
    if (confirmed) {
      // Create a data URL for the solid color
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = strokeColor;
        ctx.fillRect(0, 0, 1, 1);
        const dataURL = canvas.toDataURL();
        setBackgroundColor(dataURL);
      }
      
      // Clear and reset the canvas
      canvasRef.current?.clearCanvas();
      canvasRef.current?.resetCanvas();
    }
    setShowColorConfirm(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-200 via-pink-200 to-sky-200">
      <NavBar />
      
      <div className="container mx-auto px-4 py-6 flex-grow flex flex-col">
        <div className="bg-white rounded-xl shadow-2xl p-6 flex-grow flex flex-col">
          {/* Header with theme and timer */}
          <div className="flex justify-between items-center mb-4">
            <div>              <h2 className="text-2xl font-bold text-[#9B5DE5]">
                {timeLeft <= 10 ? 'Draw! 10 Second Remaining!' : 'Draw!'}
              </h2>
              <p className="text-gray-600">Theme: {' '}
                <span className="font-bold text-[#F15BB5]">
                  {isLoadingTheme ? 'Loading theme...' : theme}
                </span>
              </p>
              <p className="text-gray-500 text-sm mt-1">Your drawing will be enhanced by AI before others caption it</p>
            </div>
            <div className="flex items-center">
              <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-[#9B5DE5]'}`}>
                {formatTime(timeLeft)}
              </div>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`ml-4 px-6 py-2 rounded-lg font-bold transition ${
                  isSubmitting 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-[#00CCB1] text-white hover:bg-[#00B8A0]'
                }`}
              >
                {submitStage === 'enhancing' ? 'AI Enhancing...' : 
                 submitStage === 'submitting' ? 'Submitting...' : 
                 'Submit Drawing'}
              </button>
            </div>
          </div>
          
          {/* Main drawing area */}
          <div className="flex flex-grow">
            <div 
              className="flex-grow relative border-2 border-gray-200 rounded-lg overflow-hidden bg-white"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsMouseOverCanvas(true)}
              onMouseLeave={() => setIsMouseOverCanvas(false)}
            >
              {/* Translucent toolbar background */}
              {showToolbar && (
                <div 
                  className="absolute bottom-4 left-4 right-4 bg-white/20 backdrop-blur-md shadow-sm z-10 py-3.5 px-6 rounded-2xl
                    animate-[expand_0.3s_ease-out] origin-left"
                >
                  <div className="flex items-center">
                    {/* Left side with power button and text */}
                    <div className="flex items-center">
                      <span className="text-gray-700 font-semibold ml-8">Power-ups:</span>
                    </div>

                    {/* Right side with power-up buttons */}
                    <div className="flex space-x-8 ml-auto">
                      <button 
                        onClick={handleSabotage}
                        className="flex flex-col items-center group"
                      >
                        <RiKnifeBloodLine className="w-6 h-6 text-gray-700 group-hover:text-[#9B5DE5] transition-colors" />
                        <span className="text-xs mt-1 text-gray-600 group-hover:text-[#9B5DE5] font-semibold">Sabotage</span>
                      </button>
                      <button 
                        onClick={handleDelete}
                        className="flex flex-col items-center group"
                      >
                        <TiDelete className="w-6 h-6 text-gray-700 group-hover:text-[#9B5DE5] transition-colors" />
                        <span className="text-xs mt-1 text-gray-600 group-hover:text-[#9B5DE5] font-semibold">Delete</span>
                      </button>
                      <button 
                        onClick={handleSwitch}
                        className="flex flex-col items-center group"
                      >
                        <MdOutlineSwitchAccount className="w-6 h-6 text-gray-700 group-hover:text-[#9B5DE5] transition-colors" />
                        <span className="text-xs mt-1 text-gray-600 group-hover:text-[#9B5DE5] font-semibold">Switch</span>
                      </button>
                      <button 
                        onClick={handleFog}
                        className="flex flex-col items-center group"
                      >
                        <BsCloudFog2Fill className="w-6 h-6 text-gray-700 group-hover:text-[#9B5DE5] transition-colors" />
                        <span className="text-xs mt-1 text-gray-600 group-hover:text-[#9B5DE5] font-semibold">Fog</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Power button - now with transition for vertical position */}
              <button 
                className={`absolute left-4 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-md shadow-sm p-2 rounded-full transition-all duration-200
                  ${showToolbar ? 'bottom-[3.5rem]' : 'bottom-4'}`}
                onClick={() => setShowToolbar(!showToolbar)}
              >
                <ImPower className="w-6 h-6 text-gray-700" />
              </button>

              {isMouseOverCanvas && (
                <div 
                  className="pointer-events-none absolute z-50"
                  style={{
                    left: mousePosition.x,
                    top: mousePosition.y,
                    transform: canvasMode === 'draw' 
                      ? 'translate(-20%, -90%)'
                      : 'translate(-20%, -90%)'
                  }}
                >
                  {canvasMode === 'draw' ? (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6" 
                      viewBox="0 0 20 20" 
                      fill={strokeColor}
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  ) : (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6" 
                      fill="#000000"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828zm2.121.707a1 1 0 0 0-1.414 0L4.16 7.547l5.293 5.293 4.633-4.633a1 1 0 0 0 0-1.414zM8.746 13.547 3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293z"/>
                    </svg>
                  )}
                </div>
              )}
              
              {submitStage === 'enhancing' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-10">
                  <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                    <div className="w-16 h-16 border-4 border-t-[#FEE440] border-[#00BBF9] rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="text-xl font-bold text-[#9B5DE5]">AI Enhancing in Progress</h3>
                    <p className="text-gray-600 mt-2">Enhancing your drawing with AI...</p>
                    <p className="text-gray-500 text-sm mt-4">Other players will caption your enhanced drawing</p>
                  </div>
                </div>
              )}
              <ReactSketchCanvas
                ref={canvasRef}
                strokeWidth={strokeWidth}
                eraserWidth={strokeWidth}
                strokeColor={strokeColor}
                backgroundImage={backgroundColor}
                exportWithBackgroundImage={true}
                height="100%"
                width="100%"
                className="w-full h-full"
                preserveBackgroundImageAspectRatio="none"
              />
            </div>
            
            {/* Tools sidebar */}
            <div className="w-24 ml-4 flex flex-col space-y-4">
              {/* Color palette */}
              <div className="bg-gray-100 p-2 rounded-lg">
                <h3 className="text-xs font-semibold text-gray-500 mb-2 text-center">COLORS</h3>
                <div className="grid grid-cols-3 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setStrokeColor(color)}
                      className={`w-6 h-6 rounded-full ${color === '#FFFFFF' ? 'border border-gray-300' : ''}`}
                      style={{ 
                        backgroundColor: color,
                        boxShadow: color === strokeColor ? '0 0 0 2px #9B5DE5' : 'none'
                      }}
                      aria-label={`Select ${color} color`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Stroke width control */}
              <div className="bg-gray-100 p-2 rounded-lg">
                <h3 className="text-xs font-semibold text-gray-500 mb-2 text-center">SIZE</h3>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  value={strokeWidth} 
                  onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-center mt-2">
                  <div 
                    className="rounded-full bg-black"
                    style={{ 
                      width: `${strokeWidth}px`, 
                      height: `${strokeWidth}px`,
                      backgroundColor: strokeColor
                    }} 
                  />
                </div>
              </div>
              
              {/* Drawing tools */}
              <div className="bg-gray-100 p-2 rounded-lg">
                <h3 className="text-xs font-semibold text-gray-500 mb-2 text-center">TOOLS</h3>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleModeChange('draw')}
                    className={`p-2 rounded ${canvasMode === 'draw' ? 'bg-[#9B5DE5] text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleModeChange('erase')}
                    className={`p-2 rounded ${canvasMode === 'erase' ? 'bg-[#9B5DE5] text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828zm2.121.707a1 1 0 0 0-1.414 0L4.16 7.547l5.293 5.293 4.633-4.633a1 1 0 0 0 0-1.414zM8.746 13.547 3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293z"/>
                    </svg>
                  </button>
                  <button
                    onClick={handlePaintBucket}
                    className="p-2 rounded bg-white text-gray-700 hover:bg-gray-200"
                  >
                    <PiPaintBucket className="h-5 w-5 mx-auto" />
                  </button>
                  <button
                    onClick={handleUndo}
                    className="p-2 rounded bg-white text-gray-700 hover:bg-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={handleRedo}
                    className="p-2 rounded bg-white text-gray-700 hover:bg-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={handleClearCanvas}
                    className="p-2 rounded bg-white text-gray-700 hover:bg-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
            {/* Instructions/tips footer */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Tip:</span> Keep your drawing simple and creative! After submission, your drawing will be enhanced by AI and sent to other players who will add captions to it.
            </p>
          </div>
        </div>
      </div>

      {/* Clear Canvas Confirmation Modal */}
      {showClearConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-2xl">
            <h3 className="text-2xl font-bold text-[#9B5DE5] mb-4">Clear Canvas?</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to clear your drawing? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowClearConfirmation(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmClearCanvas}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
              >
                Clear Canvas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Color confirmation popup */}
      {showColorConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
            <div className="text-center mb-4">
              <p className="text-gray-700">
                Setting Canvas Color to {" "}
                <span 
                  className="inline-block w-8 h-8 rounded-full align-middle mx-1 border border-gray-300"
                  style={{ backgroundColor: strokeColor }}
                />
                {strokeColor}
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleColorConfirm(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ImCross className="w-6 h-6 text-red-500" />
              </button>
              <button
                onClick={() => handleColorConfirm(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ImCheckmark className="w-6 h-6 text-green-500" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
