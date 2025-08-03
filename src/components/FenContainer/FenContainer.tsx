import './FenContainer.css';

export default function FenContainer({ fen }: { fen: string }) {
    return <div>
        <h2>FEN attuale</h2>
        <pre style={{ wordWrap: 'break-word' }}>{fen}</pre>
    </div>
}