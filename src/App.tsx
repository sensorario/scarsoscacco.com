import './App.css'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import React, { useState } from 'react'

function App() {
  const [game] = useState(new Chess())
  const [fen, setFen] = useState(game.fen())

  const onPieceDrop = ({
    sourceSquare,
    targetSquare,
  }: {
    piece: string;
    sourceSquare: string;
    targetSquare: string;
  }) => {
    const move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
    if (move) {
      setFen(game.fen())
      return true
    }
    return false
  }

  return (
    <>
      <div>
        <h1>Scacchiera</h1>
        <div className="chessboard-container">
          <Chessboard options={{
            position: fen,
            onPieceDrop: onPieceDrop,
            widtrh: 400,
            height: 400,
          }} />
        </div>
        <div>
          <h2>FEN attuale</h2>
          <pre>{fen}</pre>
        </div>
        <div>
          <h2>PGN attuale</h2>
          <pre>{game.pgn()}</pre>
        </div>
      </div>
    </>
  )
}

export default App
