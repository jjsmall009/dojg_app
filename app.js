const { useState, useEffect, useCallback } = React;

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-50 text-red-800 rounded-lg">
                    <h2 className="font-bold mb-2">Something went wrong.</h2>
                    <button 
                        onClick={() => this.setState({ hasError: false })}
                        className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

function GrammarCard({ grammarPoint, showDetailsState }) {
    const [showEnglish, setShowEnglish] = useState(false);
    const [showDetails, setShowDetails] = showDetailsState;
    const [randomExample, setRandomExample] = useState(null);

    const getLevelColor = (level) => {
        switch(level) {
            case 'B': return 'bg-[#C8FACB]';
            case 'I': return 'bg-[#C8FAF5]';
            case 'A': return 'bg-[#FFB5B5]';
            default: return 'bg-gray-100';
        }
    };

    useEffect(() => {
        // Reset random example when grammar point changes
        setRandomExample(null);
        
        if (grammarPoint && grammarPoint.details && 
            grammarPoint.details.examples && 
            grammarPoint.details.examples.length > 0) {
            const randomIndex = Math.floor(Math.random() * grammarPoint.details.examples.length);
            setRandomExample(grammarPoint.details.examples[randomIndex]);
        }
    }, [grammarPoint]);

    const highlightGrammarPoint = (text, index, grammarPoint) => {
        if (!index && index !== 0) return text;
        const point = text.slice(index, index + grammarPoint.length);
        const before = text.slice(0, index);
        const after = text.slice(index + grammarPoint.length);
        return (
            <span>
                {before}
                <span className="text-blue-600">{point}</span>
                {after}
            </span>
        );
    };

    // Early return for loading state
    if (!grammarPoint) {
        return (
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg space-y-4">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg space-y-4 card-transition transform">
            <div className="space-y-2 transition-all duration-300">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-gray-900">{grammarPoint.name || 'Loading...'}</h2>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(grammarPoint.level)}`}>
                        {grammarPoint.level === 'B' ? 'Basic' : 
                         grammarPoint.level === 'I' ? 'Intermediate' : 
                         grammarPoint.level === 'A' ? 'Advanced' : 'Unknown'}
                    </div>
                </div>
            </div>

            {randomExample && (
                <div className="mt-6 space-y-4 transition-opacity duration-300">
                    <p className="text-xl text-gray-900">
                        {highlightGrammarPoint(
                            randomExample.japanese,
                            randomExample.grammar_point_index,
                            randomExample.grammar_point
                        )}
                    </p>
                    <p className="text-lg">
                        <span 
                            className={`inline-block ${showEnglish ? 'text-gray-700' : 'blur-sm hover:blur-none transition-all'}`}
                            onMouseEnter={() => setShowEnglish(true)}
                            onMouseLeave={() => setShowEnglish(false)}
                        >
                            {randomExample.english}
                        </span>
                    </p>
                </div>
            )}

            <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
                {showDetails ? 'Hide Details' : 'Show Details'}
            </button>

            {showDetails && (
                <div className="mt-4 space-y-2">
                    <p><strong>Romaji:</strong> {grammarPoint.romaji}</p>
                    <p><strong>Meaning:</strong> {grammarPoint.meaning}</p>
                    <p><strong>Level:</strong> {grammarPoint.level}</p>
                    <p><strong>Equivalent:</strong> {grammarPoint.equivalent}</p>
                    <p><strong>Reference:</strong> {grammarPoint.reference}</p>
                    {grammarPoint.details && grammarPoint.details.examples && (
                        <div>
                            <h3 className="font-bold mt-4 mb-2">All Examples:</h3>
                            {grammarPoint.details.examples.map((example, index) => (
                                <div key={index} className="mb-4 p-2 bg-gray-50 rounded">
                                    <p className="text-lg">
                                        {highlightGrammarPoint(example.japanese, example.grammar_point_index, example.grammar_point)}
                                    </p>
                                    <p className="text-gray-600">
                                        <span 
                                            className="inline-block blur-sm hover:blur-none transition-all"
                                            onMouseEnter={(e) => e.target.classList.remove('blur-sm')}
                                            onMouseLeave={(e) => e.target.classList.add('blur-sm')}
                                        >
                                            {example.english}
                                        </span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function App() {
    const [grammarPoints, setGrammarPoints] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(() => {
        // Load last position from localStorage, but don't apply it until data is loaded
        const saved = localStorage.getItem('lastGrammarPoint');
        return saved ? parseInt(saved) : 0;
    });
    const [isLoading, setIsLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    const [jumpToNumber, setJumpToNumber] = useState('');
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Minimum swipe distance for touch events (in px)
    const minSwipeDistance = 50;

    useEffect(() => {
        setIsLoading(true);
        fetch('output/grammar_points.json')
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
    }, [currentIndex, grammarPoints.length]);

    const previousGrammarPoint = useCallback(() => {
        setCurrentIndex((prevIndex) => {
            const prevIndex2 = prevIndex - 1 < 0 ? grammarPoints.length - 1 : prevIndex - 1;
            return prevIndex2;
        });
        setShowDetails(false);
    }, [currentIndex, grammarPoints.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Only handle keyboard events if not in an input field
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

    // Touch gesture handlers
    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);