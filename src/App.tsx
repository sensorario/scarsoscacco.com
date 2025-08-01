import './App.css'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { useState, useEffect, useRef } from "react"

function App() {
  const [game] = useState(new Chess())
  const [fen, setFen] = useState(game.fen())
  const [evaluation, setEvaluation] = useState<string>('')
  const [bestMove, setBestMove] = useState<string>('')
  const engineRef = useRef<Worker | null>(null)

  useEffect(() => {
    engineRef.current = new Worker('/stockfish/stockfish.js')

    engineRef.current.onmessage = (e) => {
      console.log('Stockfish message:', e.data)
      if (typeof e.data === 'string') {
        if (e.data === 'uciok') {
          console.log('UCI OK ricevuto')
          engineRef.current?.postMessage('isready')
        }
        if (e.data === 'readyok') {
          console.log('READY OK ricevuto')
          analyzePosition()
        }
        if (e.data.includes('score cp')) {
          const match = e.data.match(/score cp ([-\d]+)/)
          if (match) {
            const score = parseInt(match[1]) / 100
            setEvaluation(score > 0 ? `+${score}` : score.toString())
          }
        }
        if (e.data.startsWith('bestmove')) {
          const move = e.data.split(' ')[1]
          if (move) {
            setBestMove(move)
          }
        }
      }
    }

    engineRef.current.onerror = (e) => {
      console.error('Errore Stockfish:', e)
    }

    console.log('Invio comando UCI')
    engineRef.current.postMessage('uci')

    return () => engineRef.current?.terminate()
  }, [])

  const analyzePosition = () => {
    if (!engineRef.current) return
    engineRef.current.postMessage('stop')
    engineRef.current.postMessage('setoption name MultiPV value 1')
    engineRef.current.postMessage('position fen ' + fen)
    engineRef.current.postMessage('go depth 15')
  }

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
      // Analizza la nuova posizione
      setTimeout(analyzePosition, 100)
      return true
    }
    return false
  }

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        padding: '20px',
      }}>
        <div>
          <h1>Scacchiera</h1>
          <div className="chessboard-container">
            <Chessboard options={{
              position: fen,
              onPieceDrop: onPieceDrop,
              width: 400,
              height: 400,
            }} />
          </div>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          <div>
            <h2>Valutazione</h2>
            <pre>{evaluation || 'In analisi...'}</pre>
          </div>
          <div>
            <h2>Mossa migliore</h2>
            <pre>{bestMove || 'In analisi...'}</pre>
          </div>
          <div>
            <h2>FEN attuale</h2>
            <pre style={{ wordWrap: 'break-word' }}>{fen}</pre>
          </div>
          <div>
            <h2>PGN attuale</h2>
            <pre style={{ wordWrap: 'break-word' }}>{game.pgn()}</pre>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
