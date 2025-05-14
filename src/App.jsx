import React, { useState, useEffect, useCallback } from 'react'
import { GrammarCard } from './GrammarCard'

function App() {
    const [grammarPoints, setGrammarPoints] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(() => {
        const saved = localStorage.getItem('lastGrammarPoint');
        return saved ? parseInt(saved) : 0;
    });
    const [isLoading, setIsLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    const [jumpToNumber, setJumpToNumber] = useState('');
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [touchStartY, setTouchStartY] = useState(null);
    const [touchEndY, setTouchEndY] = useState(null);

    // Minimum distances for swipe/scroll detection
    const minSwipeDistance = 50;
    const minScrollDistance = 10;

    useEffect(() => {
        setIsLoading(true);
        fetch('/dojg_app/output/grammar_points.json')
            .then(response => response.json())
            .then(data => {
                setGrammarPoints(data.grammar_points);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error loading grammar points:', error);
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!isLoading && grammarPoints.length > 0) {
            localStorage.setItem('lastGrammarPoint', currentIndex.toString());
        }
    }, [currentIndex, isLoading, grammarPoints.length]);

    const nextGrammarPoint = useCallback(() => {
        setCurrentIndex((prevIndex) => {
            const nextIndex = prevIndex + 1 >= grammarPoints.length ? 0 : prevIndex + 1;
            return nextIndex;
        });
        setShowDetails(false);
    }, [grammarPoints.length]);

    const previousGrammarPoint = useCallback(() => {
        setCurrentIndex((prevIndex) => {
            const prevIndex2 = prevIndex - 1 < 0 ? grammarPoints.length - 1 : prevIndex - 1;
            return prevIndex2;
        });
        setShowDetails(false);
    }, [grammarPoints.length]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName.toLowerCase() === 'input') return;

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                previousGrammarPoint();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextGrammarPoint();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextGrammarPoint, previousGrammarPoint]);

    const onTouchStart = (e) => {
        // Check if the touch started in a scrollable area
        const target = e.target;
        const isInDetailsView = target.closest('.details-section');
        
        setTouchEnd(null);
        setTouchEndY(null);
        setTouchStart(e.targetTouches[0].clientX);
        setTouchStartY(e.targetTouches[0].clientY);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
        setTouchEndY(e.targetTouches[0].clientY);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd || !touchStartY || !touchEndY) return;

        const horizontalDistance = Math.abs(touchStart - touchEnd);
        const verticalDistance = Math.abs(touchStartY - touchEndY);
        
        // If vertical scrolling is the primary motion, don't trigger swipe
        if (verticalDistance > minScrollDistance && verticalDistance > horizontalDistance) {
            return;
        }

        // Only trigger swipe if the horizontal motion is significant
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            nextGrammarPoint();
        } else if (isRightSwipe) {
            previousGrammarPoint();
        }
    };

    const handleJumpToNumber = (e) => {
        e.preventDefault();
        const number = parseInt(jumpToNumber);
        if (number && number > 0 && number <= grammarPoints.length) {
            setCurrentIndex(number - 1);
            setShowDetails(false);
            setJumpToNumber('');
        }
    };

    if (isLoading || grammarPoints.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-pink-50">
                <div className="text-center p-8 bg-white/80 backdrop-blur-lg rounded-xl shadow-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-500 mx-auto mb-4"></div>
                    <div className="text-gray-600 font-medium">Loading grammar points...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div className="p-4 sm:p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="sticky top-0 backdrop-blur-lg bg-white/70 p-4 rounded-xl mb-6 shadow-sm z-10 flex justify-between items-center">
                        <div className="text-gray-600 font-medium">
                            <span className="text-sm text-gray-400">Grammar Point</span>
                            <div className="text-xl font-bold text-gray-800">{currentIndex + 1} / {grammarPoints.length}</div>
                        </div>
                        <form onSubmit={handleJumpToNumber} className="flex gap-2 items-center">
                            <input
                                type="number"
                                min="1"
                                max={grammarPoints.length}
                                value={jumpToNumber}
                                onChange={(e) => setJumpToNumber(e.target.value)}
                                placeholder="Jump to #"
                                className="px-3 py-2 border border-gray-200 rounded-lg w-24 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button 
                                type="submit"
                                className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                                Go
                            </button>
                        </form>
                    </div>

                    <GrammarCard 
                        grammarPoint={grammarPoints[currentIndex]} 
                        showDetailsState={[showDetails, setShowDetails]}
                    />

                    <div className="flex justify-between mt-6 gap-4">
                        <button
                            onClick={previousGrammarPoint}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg 
                                    hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-sm 
                                    hover:shadow-md active:shadow-sm transform hover:-translate-y-0.5 active:translate-y-0
                                    font-medium"
                        >
                            ← Previous
                        </button>
                        <button
                            onClick={nextGrammarPoint}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg 
                                    hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm 
                                    hover:shadow-md active:shadow-sm transform hover:-translate-y-0.5 active:translate-y-0
                                    font-medium"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;