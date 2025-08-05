import React from 'react';

interface CheckmateModalProps {
    isOpen: boolean;
    winner: 'white' | 'black' | null;
    onRestart: () => void;
    onStay: () => void;
}

export const CheckmateModal: React.FC<CheckmateModalProps> = ({
    isOpen,
    winner,
    onRestart,
    onStay
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
                    Checkmate!
                </h2>
                <p className="text-center mb-6 text-gray-600">
                    {winner ? `${winner.charAt(0).toUpperCase() + winner.slice(1)} wins!` : 'Game Over'}
                </p>
                <p className="text-center mb-6 text-sm text-gray-500">
                    Would you like to start a new game or stay and review?
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onRestart}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        New Game
                    </button>
                    <button
                        onClick={onStay}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                    >
                        Stay & Review
                    </button>
                </div>
            </div>
        </div>
    );
};
