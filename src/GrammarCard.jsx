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
        <div className="max-w-2xl mx-auto p-6 bg-white/80 backdrop-blur-lg rounded-xl shadow-lg space-y-4 card-transition transform hover:shadow-xl transition-all duration-300 overflow-x-hidden">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        {grammarPoint.name || 'Loading...'}
                    </h2>
                    <div className={`px-4 py-1.5 rounded-full text-sm font-medium shadow-sm ${getLevelColor(grammarPoint.level)} transition-colors duration-300`}>
                        {grammarPoint.level === 'B' ? 'Basic' : 
                         grammarPoint.level === 'I' ? 'Intermediate' : 
                         grammarPoint.level === 'A' ? 'Advanced' : 'Unknown'}
                    </div>
                </div>
            </div>

            {randomExample && (
                <div className="mt-6 space-y-4 transition-all duration-300 ease-in-out">
                    <div className="p-4 rounded-lg bg-gray-50/80 backdrop-blur-sm">
                        <p className="text-xl text-gray-900 mb-3">
                            {highlightGrammarPoint(
                                randomExample.japanese,
                                randomExample.grammar_point_index,
                                randomExample.grammar_point
                            )}
                        </p>
                        <p className="text-lg">
                            <span 
                                className={`inline-block ${showEnglish ? 'text-gray-700' : 'blur-sm hover:blur-none transition-all duration-300'}`}
                                onMouseEnter={() => setShowEnglish(true)}
                                onMouseLeave={() => setShowEnglish(false)}
                            >
                                {randomExample.english}
                            </span>
                        </p>
                    </div>
                </div>
            )}

            <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg 
                          hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md 
                          hover:shadow-lg active:shadow-sm transform hover:-translate-y-0.5 active:translate-y-0"
            >
                {showDetails ? 'Hide Details' : 'Show Details'}
            </button>

            {showDetails && (
                <div className="mt-6 space-y-4 details-section transition-all duration-300">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-gray-50/80 backdrop-blur-sm">
                            <p><strong className="text-gray-700">Romaji:</strong> {grammarPoint.romaji}</p>
                            <p><strong className="text-gray-700">Level:</strong> {grammarPoint.level}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50/80 backdrop-blur-sm">
                            <p><strong className="text-gray-700">Reference:</strong> {grammarPoint.reference}</p>
                            <p><strong className="text-gray-700">Equivalent:</strong> {grammarPoint.equivalent}</p>
                        </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50/80 backdrop-blur-sm">
                        <p><strong className="text-gray-700">Meaning:</strong></p>
                        <p className="mt-1">{grammarPoint.meaning}</p>
                    </div>

                    {grammarPoint.details && grammarPoint.details.examples && (
                        <div className="mt-6">
                            <h3 className="font-bold mb-4 text-lg bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">All Examples</h3>
                            <div className="space-y-4">
                                {grammarPoint.details.examples.map((example, index) => (
                                    <div key={index} className="p-4 rounded-lg bg-gray-50/80 backdrop-blur-sm transition-all duration-300 hover:bg-gray-50">
                                        <p className="text-lg mb-2">
                                            {highlightGrammarPoint(example.japanese, example.grammar_point_index, example.grammar_point)}
                                        </p>
                                        <p className="text-gray-600">
                                            <span 
                                                className="inline-block blur-sm hover:blur-none transition-all duration-300"
                                                onMouseEnter={(e) => e.target.classList.remove('blur-sm')}
                                                onMouseLeave={(e) => e.target.classList.add('blur-sm')}
                                            >
                                                {example.english}
                                            </span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}