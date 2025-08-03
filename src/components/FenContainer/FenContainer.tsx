import './FenContainer.css';
import { useState } from 'react';

interface FenContainerProps {
    fen: string;
    isVisible: boolean;
}

export default function FenContainer({ fen, isVisible }: FenContainerProps) {
    const [isCopying, setIsCopying] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const copyToClipboard = () => {
        setIsAnimating(true);
        setIsCopying(true);
        navigator.clipboard.writeText(fen).then(() => {
            console.log('FEN copied to clipboard');
            setTimeout(() => {
                setIsCopying(false);
                setIsAnimating(false);
            }, 1000);
        }).catch(err => {
            console.error('Failed to copy FEN: ', err);
            setIsCopying(false);
            setIsAnimating(false);
        });
    };

    if (!isVisible) return null;

    return <div className="fen-container">
        <div className="fen-header">
            <h2>FEN attuale</h2>
            <button
                onClick={copyToClipboard}
                className="fen-button"
                title="Copy FEN to clipboard"
                disabled={isCopying}
            >
                <span className={isAnimating ? 'copying-icon' : ''}>
                    {isCopying ? '✓' : '⧉'}
                </span>
            </button>
        </div>
        <input
            type="text"
            value={fen}
            readOnly
            className="fen-input"
        />
    </div>
}