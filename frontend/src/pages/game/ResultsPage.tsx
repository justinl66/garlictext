import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../General/NavBar';
import dbService from '../../services/dbService';

interface Result {
  id: string;
  imageUrl: string;
  caption: string;
  authorName: string;
  votes: number;
  rank: number;
  medal: 'gold' | 'silver' | 'bronze' | null;
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPlayAgain, setShowPlayAgain] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
    useEffect(() => {
    const fetchResults = async () => {
      if (!roomId) {
        setLoading(false);
        return;
      }

      try {
        const images = await dbService.image.getImagesByRound(roomId);
        
        const processedResults: Result[] = images.map((image: any, index: number) => {
          // Calculate total votes for this image (including caption votes)
          const imageVotes = image.votes || 0;
          const captionVotes = image.captions?.reduce((sum: number, caption: any) => sum + (caption.votes || 0), 0) || 0;
          const totalVotes = imageVotes + captionVotes;
          
          return {
            id: image.id,
            imageUrl: image.enhancedImageData ? 
              dbService.image.getEnhancedImageUrl(image.id) : 
              dbService.image.getOriginalImageUrl(image.id),
            caption: image.captions?.[0]?.text || `Drawing ${index + 1}`,
            authorName: image.user?.username || 'Anonymous',
            votes: totalVotes,
            rank: index + 1,
            medal: null
          };
        });
        
        // Sort by votes (highest first) and assign ranks
        processedResults.sort((a, b) => b.votes - a.votes);
        processedResults.forEach((result, index) => {
          result.rank = index + 1;
        });
        
        setResults(processedResults.length > 0 ? processedResults : mockResults);
      } catch (error) {
        console.error('Error fetching results:', error);
        setResults(mockResults);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [roomId]);

  const mockResults: Result[] = [
    {
      id: '1',
      imageUrl: '/garlicTextNoBackground.png',
      caption: "A sweaty programmer debugging code",
      authorName: 'Justin',
      votes: 5,
      rank: 1,
      medal: null
    },
    {
      id: '2',
      imageUrl: '/garlicTextNoBackground.png',
      caption: "The legendary Eggert",
      authorName: 'Andrew',
      votes: 3,
      rank: 2,
      medal: null
    },
    {
      id: '3',
      imageUrl: '/garlicTextNoBackground.png',
      caption: "CS 35L student in their natural habitat",
      authorName: 'Mason',
      votes: 1,
      rank: 3,
      medal: null
    }
  ];  const processResults = (results: Result[]): Result[] => {
    const updatedResults = [...results];
    
    // Sort by votes (highest first)
    const sortedResults = [...updatedResults].sort((a, b) => b.votes - a.votes);
    
    let currentMedal: 'gold' | 'silver' | 'bronze' = 'gold';
    let currentVotes = sortedResults[0]?.votes;
    let processedResults: Result[] = [];
    
    sortedResults.forEach((result, index) => {
      if (index === 0) {
        result.medal = 'gold';
      } else if (result.votes === currentVotes) {
        // Same number of votes = same medal
        result.medal = currentMedal;
      } else {
        // Different vote count, move to next medal tier
        if (currentMedal === 'gold') {
          currentMedal = 'silver';
        } else if (currentMedal === 'silver') {
          currentMedal = 'bronze';
        } else {
          // Bronze and below get no medal
          result.medal = null;
        }
        result.medal = currentMedal;
      }
      currentVotes = result.votes;
      processedResults.push(result);
    });

    // Only show top 3 medal categories
    const medalsToShow = processedResults.filter(r => r.medal !== null);
    
    // If we have more than 3 gold medals, randomly select 3
    const goldMedals = medalsToShow.filter(r => r.medal === 'gold');
    if (goldMedals.length > 3) {
      const selectedGolds = goldMedals.sort(() => Math.random() - 0.5).slice(0, 3);
      processedResults = processedResults.filter(r => r.medal !== 'gold' || selectedGolds.includes(r));
    }

    // Sort for display: gold first, then silver, then bronze
    return processedResults.filter(r => r.medal !== null).sort((a, b) => {
      const medalOrder = { gold: 3, silver: 2, bronze: 1 };
      return medalOrder[b.medal!] - medalOrder[a.medal!];
    });
  };

  const topResults = processResults(results);
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentIndex < topResults.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {        clearInterval(timer);
        setTimeout(() => {
          setShowPlayAgain(true);
        }, 3000);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [currentIndex, topResults.length]);

  const currentResult = topResults[currentIndex];

  const getMedalEmoji = (medal: string) => {
    switch (medal) {
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '';
    }
  };


  const getPodiumPosition = (results: Result[], index: number): 'left' | 'middle' | 'right' => {
    const goldCount = results.filter(r => r.medal === 'gold').length;
    const silverCount = results.filter(r => r.medal === 'silver').length;
    const bronzeCount = results.filter(r => r.medal === 'bronze').length;


    if (goldCount === 1 && silverCount === 1 && bronzeCount === 1) {
      if (results[index].medal === 'bronze') return 'left';
      if (results[index].medal === 'silver') return 'right';
      return 'middle';
    }


    if (goldCount === 2 && bronzeCount === 1) {
      if (results[index].medal === 'bronze') return 'left';
      if (index === results.findIndex(r => r.medal === 'gold')) return 'right';
      return 'middle';
    }


    if (goldCount === 1 && silverCount === 2) {
      if (results[index].medal === 'silver') {
        return index === results.findIndex(r => r.medal === 'silver') ? 'left' : 'right';
      }
      return 'middle';
    }


    if (goldCount === 3) {
      if (index === 0) return 'left';
      if (index === 1) return 'right';
      return 'middle';
    }


    return index === 0 ? 'left' : index === 1 ? 'right' : 'middle';
  };
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9]">
      <NavBar />
      
      <div className="container mx-auto px-4 py-6 flex-grow flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-6xl">
          {loading ? (
            <div className="text-center">
              <h1 className="text-4xl font-bold text-[#9B5DE5] mb-4">Loading Results...</h1>
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#9B5DE5] mx-auto"></div>
            </div>
          ) : (
            <>

              <div className="flex justify-center items-end h-96 mb-8 relative">
                {topResults.map((result, index) => {
                  const position = getPodiumPosition(topResults, index);
                  return (
                    <div 
                      key={result.id}
                      className={`flex flex-col items-center transition-all duration-500 absolute ${
                        currentIndex >= index ? 'opacity-100' : 'opacity-0'
                      } ${
                        position === 'left' ? 'left-[20%]' :
                        position === 'right' ? 'right-[20%]' :
                        'left-1/2 transform -translate-x-1/2'
                      }`}
                    >

                      <div className="w-48">
                        <div className={`bg-gray-100 rounded-lg overflow-hidden mb-2 ${
                          result.medal === 'gold' ? 'h-48' :
                          result.medal === 'silver' ? 'h-40' :
                          'h-36'
                        } ${
                          result.medal === 'gold' ? 'border-4 border-yellow-400' :
                          result.medal === 'silver' ? 'border-4 border-gray-300' :
                          'border-4 border-amber-600'
                        }`}>
                          <img 
                            src={result.imageUrl} 
                            alt={`Drawing by ${result.authorName}`}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="text-center mb-2">
                          <p className="text-sm font-medium text-gray-800">{result.caption}</p>
                        </div>
                        <div className={`h-16 ${
                          result.medal === 'gold' ? 'bg-yellow-400' :
                          result.medal === 'silver' ? 'bg-gray-300' :
                          'bg-amber-600'
                        } rounded-t-lg flex items-center justify-center text-white font-bold`}>
                          {getMedalEmoji(result.medal!)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>


              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-[#9B5DE5] mb-2">
                  {currentResult?.medal === 'gold' ? '🏆 Winner! 🏆' : 
                   currentResult?.medal === 'silver' ? '🥈 Second Place! 🥈' : 
                   '🥉 Third Place! 🥉'}
                </h1>
                <p className="text-gray-600">By {currentResult?.authorName}</p>                <p className="text-2xl font-bold text-[#00BBF9] mt-2">
                  Points: {currentResult?.votes}
                </p>
              </div>


              {showPlayAgain && (
                <div className="flex justify-center">
                  <button 
                    onClick={() => navigate('/')}
                    className="px-8 py-3 bg-gradient-to-r from-[#9B5DE5] to-[#F15BB5] text-white rounded-lg hover:opacity-90 transition font-bold text-xl"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
