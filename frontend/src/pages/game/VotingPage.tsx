import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../General/NavBar';
import dbService from '../../services/dbService';
import { AuthContext } from '../../firebase/firebaseAuth';

// Define TypeScript interfaces for our data structure
interface CaptionedImage {
  id: string;
  imageUrl: string;
  caption: string;
  authorName: string;
}

interface PromptGroup {
  promptId: string;
  promptText: string;
  captionedImages: CaptionedImage[];
}

export default function VotingPage() {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.currentUser;
  
  const [promptGroups, setPromptGroups] = useState<PromptGroup[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 second timer for voting
  
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
  
  // Load captioned images grouped by prompts when component mounts
  useEffect(() => {
    const fetchPromptGroups = async () => {
      try {
        // Placeholders for now
        const mockPromptGroups = [
          {
            promptId: 'prompt1',
            promptText: 'Draw a programmer debugging code',
            captionedImages: [
              {
                id: '1',
                imageUrl: '/garlicTextNoBackground.png',
                caption: "a sweaty person",
                authorName: 'Player 1'
              },
              {
                id: '2',
                imageUrl: '/garlicTextNoBackground.png',
                caption: 'a Degen',
                authorName: 'Player 2'
              }
            ]
          },
          {
            promptId: 'prompt2',
            promptText: 'Draw Eggert',
            captionedImages: [
              {
                id: '3',
                imageUrl: '/garlicTextNoBackground.png',
                caption: 'jolly CS nerd',
                authorName: 'Player 3'
              },
              {
                id: '4',
                imageUrl: '/garlicTextNoBackground.png',
                caption: 'david smallberg',
                authorName: 'Player 4'
              }
            ]
          },
          {
            promptId: 'prompt3',
            promptText: 'Draw CS 35L student',
            captionedImages: [
              {
                id: '5',
                imageUrl: '/garlicTextNoBackground.png',
                caption: 'depressed person',
                authorName: 'Player 5'
              },
              {
                id: '6',
                imageUrl: '/garlicTextNoBackground.png',
                caption: 'sleep deprivation',
                authorName: 'Player 6'
              },
              {
                id: '7',
                imageUrl: '/garlicTextNoBackground.png',
                caption: 'musty CS majors',
                authorName: 'Player 7'
              }
            ]
          }
        ];
        
        setPromptGroups(mockPromptGroups);
      } catch (error) {
        console.error('Error fetching prompt groups:', error);
      }
    };
    
    fetchPromptGroups();
  }, []);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleSelectImage = (imageId: string) => {
    setSelectedImageId(imageId);
  };
  
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      if (selectedImageId) {
        // Mock submission
        console.log(`Voted for image: ${selectedImageId}`);
        
        if (dbService && currentUser) {
          // Example API call if dbService is available
          /*
          await dbService.submitVote({
            userId: currentUser.uid,
            imageId: selectedImageId,
            gameId: 'current-game-id' // You would get this from context or params
          });
          */
          console.log('Vote recorded in database');
        } else {
          console.log('Mock submission - would save vote to database');
        }
      } else {
        // If time ran out and no selection was made
        console.log('No selection made, skipping vote');
      }
      
      // Navigate to results or next phase
      setTimeout(() => {
        navigate('/game/lobby'); // Fix this after result page is done
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting vote:', error);
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9]">
      <NavBar />
      
      <div className="container mx-auto px-4 py-6 flex-grow">
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[#9B5DE5]">Vote for Your Favorite!</h1>
            <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-[#9B5DE5]'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
          
          <p className="text-gray-600 mb-8">
            Choose your favorite captioned drawing by clicking on it. Your vote will help determine the winner!
          </p>
          
          <div className="space-y-10">
            {promptGroups.map((promptGroup) => (
              <div key={promptGroup.promptId} className="border rounded-xl p-6 bg-gray-50">
                <h2 className="text-xl font-bold text-[#9B5DE5] mb-3">{promptGroup.promptText}</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {promptGroup.captionedImages.map((image) => (
                    <div 
                      key={image.id}
                      onClick={() => handleSelectImage(image.id)}
                      className={`border-4 rounded-lg cursor-pointer transition overflow-hidden h-full flex flex-col ${
                        selectedImageId === image.id 
                          ? 'border-[#00BBF9] shadow-lg transform scale-102' 
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <div className="aspect-square bg-gray-100 relative flex-shrink-0">
                        <img 
                          src={image.imageUrl} 
                          alt={`Captioned by ${image.authorName}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      <div className="p-4 bg-gray-800 text-white flex-grow flex flex-col">
                        <p className="text-lg font-medium mb-1 flex-grow line-clamp-3">{image.caption}</p>
                        <p className="text-sm text-gray-400 mt-auto">Captioned by: {image.authorName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-lg font-bold text-xl transition ${
                isSubmitting 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : selectedImageId 
                    ? 'bg-gradient-to-r from-[#9B5DE5] to-[#F15BB5] text-white hover:opacity-90' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {isSubmitting ? 'Submitting...' : selectedImageId ? 'Submit Vote' : 'Skip Voting'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
