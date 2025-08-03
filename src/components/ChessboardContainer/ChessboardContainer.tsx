import { Chessboard } from 'react-chessboard'
import { type Square } from 'chess.js'
import './ChessboardContainer.css'

interface ChessboardContainerProps {
    bestMove: string
    fen: string
    onPieceDrop: ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) => boolean
    boardOrientation: 'white' | 'black'
}

export default function ChessboardContainer({
    bestMove,
    fen,
    onPieceDrop,
    boardOrientation
}: ChessboardContainerProps) {
    return (
        <div className="chessboard-container">
            <Chessboard options={{
                arrows: bestMove ? [{
                    startSquare: bestMove.substring(0, 2) as Square,
                    endSquare: bestMove.substring(2, 4) as Square,
                    color: 'rgb(0, 128, 0)'
                }] : undefined,
                position: fen,
                onPieceDrop: onPieceDrop || '',
                boardOrientation: boardOrientation,
            }} />
        </div>
    )
}
