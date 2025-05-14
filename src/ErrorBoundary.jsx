import React from 'react'

export class ErrorBoundary extends React.Component {
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