import { Chessboard } from 'react-chessboard'
import { type Square } from 'chess.js'
import './ChessboardContainer.css'

interface ChessboardContainerProps {
  bestMove: string
  bestMoves: string[]
  fen: string
  onPieceDrop: ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) => boolean
  boardOrientation: 'white' | 'black'
}

export default function ChessboardContainer({
  bestMove,
  bestMoves,
  fen,
  onPieceDrop,
  boardOrientation
}: ChessboardContainerProps) {
  
  const getArrows = () => {
    const arrows = []
    
    // Add primary best move arrow in green
    if (bestMove) {
      arrows.push({
        startSquare: bestMove.substring(0, 2) as Square,
        endSquare: bestMove.substring(2, 4) as Square,
        color: 'rgb(0, 128, 0)'
      })
    }
    
    // Add alternative moves in different colors
    bestMoves.forEach((move, index) => {
      if (move && move !== bestMove) {
        const colors = ['rgb(255, 165, 0)', 'rgb(255, 255, 0)', 'rgb(255, 192, 203)'] // Orange, Yellow, Pink
        arrows.push({
          startSquare: move.substring(0, 2) as Square,
          endSquare: move.substring(2, 4) as Square,
          color: colors[index] || 'rgb(128, 128, 128)'
        })
      }
    })
    
    return arrows
  }

  return (
    <div className="chessboard-container">
      <Chessboard options={{
        arrows: getArrows(),
        position: fen,
        onPieceDrop: onPieceDrop || '',
        boardOrientation: boardOrientation,
      }} />
    </div>
  )
}
