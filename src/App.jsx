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
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <div className="text-gray-600">Loading grammar points...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 bg-gray-100"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div className="max-w-2xl mx-auto">
                <div className="sticky top-0 bg-gray-100 py-2 mb-4 z-10 flex justify-between items-center">
                    <div className="text-gray-600 font-medium">
                        Grammar Point {currentIndex + 1} / {grammarPoints.length}
                    </div>
                    <form onSubmit={handleJumpToNumber} className="flex gap-2">
                        <input
                            type="number"
                            min="1"
                            max={grammarPoints.length}
                            value={jumpToNumber}
                            onChange={(e) => setJumpToNumber(e.target.value)}
                            placeholder="Jump to #"
                            className="px-3 py-1 border rounded w-24 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button 
                            type="submit"
                            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                            Go
                        </button>
                    </form>
                </div>

                <GrammarCard 
                    grammarPoint={grammarPoints[currentIndex]} 
                    showDetailsState={[showDetails, setShowDetails]}
                />

                <div className="flex justify-between mt-4">
                    <button
                        onClick={previousGrammarPoint}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                    >
                        Previous
                    </button>
                    <button
                        onClick={nextGrammarPoint}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;