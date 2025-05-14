import React, { useState, useEffect } from 'react'

export function GrammarCard({ grammarPoint, showDetailsState }) {
    const [showEnglish, setShowEnglish] = useState(false);
    const [showDetails, setShowDetails] = showDetailsState;
    const [randomExample, setRandomExample] = useState(null);

    const getLevelColor = (level) => {
        switch(level) {
            case 'B': return 'bg-[#E3FAEA]';
            case 'I': return 'bg-[#e6ffff]';
            case 'A': return 'bg-[#ffe6e6]';
            default: return 'bg-gray-100';
        }
    };

    useEffect(() => {
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