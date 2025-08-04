import './CapturedPieces.css'
import { Chess } from 'chess.js'

interface CapturedPiecesProps {
    game: Chess
    position: 'top' | 'bottom'
    color: 'white' | 'black'
}

export default function CapturedPieces({ game, position, color }: CapturedPiecesProps) {
    const getCapturedPieces = () => {
        const history = game.history({ verbose: true })
        const captured: string[] = []

        history.forEach(move => {
            if (move.captured) {
                // If this component shows white captured pieces, show black pieces that were captured
                const capturedColor = color === 'white' ? 'b' : 'w'
                if (move.color !== capturedColor) {
                    captured.push(move.captured)
                }
            }
        })

        return captured.sort()
    }

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

    const capturedPieces = getCapturedPieces()
    const isWhite = color === 'white'

    return (
        <div className={`captured-pieces captured-pieces-${position}`}>
            <div className="captured-pieces-container">
                {capturedPieces.map((piece, index) => (
                    <span key={index} className="captured-piece">
                        {getPieceSymbol(piece, !isWhite)}
                    </span>
                ))}
            </div>
        </div>
    )
}
