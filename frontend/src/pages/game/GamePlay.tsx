import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import NavBar from '../General/NavBar';
import { AuthContext } from '../../firebase/firebaseAuth';
import { ServerContext } from '../../services/serverContext';
import imageStorageService from '../../services/imageStorageService';

export default function DrawingPage() {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { roomId } = useContext(ServerContext);
  
  if (!authContext) {
    return <div>Loading...</div>;
  }
  
  const { user: currentUser } = authContext;
  
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [canvasMode, setCanvasMode] = useState<'draw' | 'erase'>('draw');
  const [theme] = useState('CS major cramming for 35L final');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState<'not_submitted' | 'submitting' | 'enhancing'>('not_submitted');
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  
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
  
  // Palette colors
  const colors = [
    '#000000', // Black
    '#FFFFFF', // White
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
    '#A52A2A', // Brown
    '#808080', // Gray
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
      }      console.log('🎨 Submitting drawing to database...');    
      const result = await imageStorageService.submitDrawing({
        roundId: roomId || null, 
        prompt: theme,
        drawingDataURL: dataURL
      });

      console.log('✅ Drawing submitted successfully:', result);
      
      setSubmitStage('enhancing');
      
      setTimeout(() => {
        navigate('/game/caption', { 
          state: { 
            imageId: result.imageId,
            originalImageUrl: result.originalImageUrl 
          } 
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting drawing:', error);
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
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9]">
      <NavBar />
      
      <div className="container mx-auto px-4 py-6 flex-grow flex flex-col">
        <div className="bg-white rounded-xl shadow-2xl p-6 flex-grow flex flex-col">
          {/* Header with theme and timer */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#9B5DE5]">Draw!</h2>
              <p className="text-gray-600">Theme: <span className="font-bold text-[#F15BB5]">{theme}</span></p>
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
            <div className="flex-grow relative border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
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
                strokeColor={strokeColor}
                backgroundImage=""
                exportWithBackgroundImage={false}
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
                  </button>                  <button
                    onClick={() => handleModeChange('erase')}
                    className={`p-2 rounded ${canvasMode === 'erase' ? 'bg-[#9B5DE5] text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828zm2.121.707a1 1 0 0 0-1.414 0L4.16 7.547l5.293 5.293 4.633-4.633a1 1 0 0 0 0-1.414zM8.746 13.547 3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293z"/>
                    </svg>
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
    </div>
  );
}
