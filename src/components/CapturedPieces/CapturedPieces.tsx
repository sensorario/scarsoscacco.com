import './CapturedPieces.css'
import { Chess } from 'chess.js'

interface CapturedPiecesProps {
    capturedPieces: string[]
    game: Chess
    position: 'top' | 'bottom'
    color: 'white' | 'black'
    amount: number
    highest: number
    surplus: number
}

export default function CapturedPieces({ capturedPieces, position, color, amount, highest, surplus }: CapturedPiecesProps) {

    const getPieceSymbol = (piece: string, isWhite: boolean) => {
        const symbols = {
            'p': isWhite ? '♙' : '♟',
            'n': isWhite ? '♘' : '♞',
            'b': isWhite ? '♗' : '♝',
            'r': isWhite ? '♖' : '♜',
            'q': isWhite ? '♕' : '♛',
            'k': isWhite ? '♔' : '♚'
        }
        return symbols[piece as keyof typeof symbols] || ''
    }

    const isWhite = color === 'white'

    return (
        <div className={`captured-pieces captured-pieces-${position}`}>
            <div className="captured-pieces-container">
                {capturedPieces.map((piece: string, index: number) => (
                    <span key={index} className="captured-piece">
                        {getPieceSymbol(piece, !isWhite)}
                    </span>
                ))}  {highest - amount === 0 ? '+' + Math.abs(surplus) : '-' + Math.abs(surplus)}
            </div>
        </div>
    )
}
