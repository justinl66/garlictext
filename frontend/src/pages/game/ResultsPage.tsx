import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../General/NavBar';

interface Result {
  id: string;
  imageUrl: string;
  caption: string;
  authorName: string;
  meanRating: number;
  rank: number;
  medal: 'gold' | 'silver' | 'bronze' | null;
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPlayAgain, setShowPlayAgain] = useState(false);
  
  // Mock data - replace with actual data from backend
  const [results] = useState<Result[]>([
    {
      id: '1',
      imageUrl: '/garlicTextNoBackground.png',
      caption: "A sweaty programmer debugging code",
      authorName: 'Justin',
      meanRating: 90,
      rank: 1,
      medal: null
    },
    {
      id: '2',
      imageUrl: '/garlicTextNoBackground.png',
      caption: "The legendary Eggert",
      authorName: 'Andrew',
      meanRating: 80,
      rank: 1,
      medal: null
    },
    {
      id: '3',
      imageUrl: '/garlicTextNoBackground.png',
      caption: "CS 35L student in their natural habitat",
      authorName: 'Mason',
      meanRating: 50,
      rank: 2,
      medal: null
    }
  ]);

  // Process results to handle ties and assign medals
  const processResults = (results: Result[]): Result[] => {
    // Sort by meanRating in descending order
    const sortedResults = [...results].sort((a, b) => b.meanRating - a.meanRating);
    
    let currentMedal: 'gold' | 'silver' | 'bronze' = 'gold';
    let currentRating = sortedResults[0]?.meanRating;
    let processedResults: Result[] = [];
    
    // Assign medals based on ties
    sortedResults.forEach((result, index) => {
      if (index === 0) {
        result.medal = 'gold';
      } else if (result.meanRating === currentRating) {
        // If tied with previous result, give same medal
        result.medal = currentMedal;
      } else {
        // If not tied, move to next medal
        if (currentMedal === 'gold') {
          currentMedal = 'silver';
        } else if (currentMedal === 'silver') {
          currentMedal = 'bronze';
        }
        result.medal = currentMedal;
      }
      currentRating = result.meanRating;
      processedResults.push(result);
    });

    // If more than 3 gold medals, randomly select 3
    const goldMedals = processedResults.filter(r => r.medal === 'gold');
    if (goldMedals.length > 3) {
      const selectedGolds = goldMedals.sort(() => Math.random() - 0.5).slice(0, 3);
      processedResults = processedResults.filter(r => r.medal !== 'gold' || selectedGolds.includes(r));
    }

    // Sort by medal priority (bronze -> silver -> gold) and then by original order
    return processedResults.sort((a, b) => {
      const medalOrder = { bronze: 0, silver: 1, gold: 2 };
      return medalOrder[a.medal!] - medalOrder[b.medal!];
    });
  };

  const topResults = processResults(results);

  useEffect(() => {
    // Auto-advance to next result every 3 seconds
    const timer = setInterval(() => {
      if (currentIndex < topResults.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        clearInterval(timer);
        // Show play again button after showing all results
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

  // Function to determine podium position based on medal and index
  const getPodiumPosition = (results: Result[], index: number): 'left' | 'middle' | 'right' => {
    const goldCount = results.filter(r => r.medal === 'gold').length;
    const silverCount = results.filter(r => r.medal === 'silver').length;
    const bronzeCount = results.filter(r => r.medal === 'bronze').length;

    // Case 1: One of each medal (gold, silver, bronze)
    if (goldCount === 1 && silverCount === 1 && bronzeCount === 1) {
      if (results[index].medal === 'bronze') return 'left';
      if (results[index].medal === 'silver') return 'right';
      return 'middle';
    }

    // Case 2: Two gold, one bronze
    if (goldCount === 2 && bronzeCount === 1) {
      if (results[index].medal === 'bronze') return 'left';
      if (index === results.findIndex(r => r.medal === 'gold')) return 'right';
      return 'middle';
    }

    // Case 3: One gold, two silver
    if (goldCount === 1 && silverCount === 2) {
      if (results[index].medal === 'silver') {
        return index === results.findIndex(r => r.medal === 'silver') ? 'left' : 'right';
      }
      return 'middle';
    }

    // Case 4: Three gold
    if (goldCount === 3) {
      if (index === 0) return 'left';
      if (index === 1) return 'right';
      return 'middle';
    }

    // Default case: left to right
    return index === 0 ? 'left' : index === 1 ? 'right' : 'middle';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9]">
      <NavBar />
      
      <div className="container mx-auto px-4 py-6 flex-grow flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-6xl">
          {/* Podium - Always visible with consistent spacing */}
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
                  {/* Consistent width container for all positions */}
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
                    {/* Caption directly under drawing */}
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

          {/* Current Result Details */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#9B5DE5] mb-2">
              {currentResult.medal === 'gold' ? '🏆 Winner! 🏆' : 
               currentResult.medal === 'silver' ? '🥈 Second Place! 🥈' : 
               '🥉 Third Place! 🥉'}
            </h1>
            <p className="text-gray-600">By {currentResult.authorName}</p>
            <p className="text-2xl font-bold text-[#00BBF9] mt-2">
              Rating: {currentResult.meanRating}%
            </p>
          </div>

          {/* Play Again Button */}
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
        </div>
      </div>
    </div>
  );
}
