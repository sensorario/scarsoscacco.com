import './FenContainer.css';

export default function FenContainer({ fen }: { fen: string }) {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(fen).then(() => {
            console.log('FEN copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy FEN: ', err);
        });
    };

    return <div className="fen-container">
        <div className="fen-header">
            <h2>FEN attuale</h2>
            <button 
                onClick={copyToClipboard}
                className="copy-button"
                title="Copy FEN to clipboard"
            >
                📋
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