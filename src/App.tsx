import './App.css'
import { Chessboard } from 'react-chessboard'
import { Chess, type Square } from 'chess.js'
import { useState, useEffect, useRef } from "react"

function App() {
  const [game] = useState(new Chess())
  const [viewGame, setViewGame] = useState(new Chess())
  const [fen, setFen] = useState(game.fen())
  const [evaluation, setEvaluation] = useState<string>('')
  const [bestMove, setBestMove] = useState<string>('')
  const [isThinking, setIsThinking] = useState(false)
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1)
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

  // Analizza la posizione iniziale
  useEffect(() => {
    if (!isThinking) {
      analyzePosition()
    }
  }, [fen])

  const analyzePosition = () => {
    if (!engineRef.current) return
    setIsThinking(true)
    setBestMove('')
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
      setIsThinking(false)
      return true
    }
    return false
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const moves = game.history()
      if (e.key === 'ArrowLeft') {
        const newIndex = Math.max(-1, currentMoveIndex - 1)
        setCurrentMoveIndex(newIndex)
        if (newIndex === -1) {
          setFen(new Chess().fen())
        } else {
          onMoveClick(newIndex)
        }
      }
      if (e.key === 'ArrowRight') {
        const newIndex = Math.min(moves.length - 1, currentMoveIndex + 1)
        if (newIndex >= 0) {
          setCurrentMoveIndex(newIndex)
          onMoveClick(newIndex)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentMoveIndex, game])

  const onMoveClick = (moveIndex: number) => {
    const moves = game.history()
    const tempGame = new Chess()
    
    // Riproduci le mosse fino all'indice selezionato
    for (let i = 0; i <= moveIndex; i++) {
      tempGame.move(moves[i])
    }
    
    setCurrentMoveIndex(moveIndex)
    setFen(tempGame.fen())
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
              arrows: bestMove ? [{
                startSquare: bestMove.substring(0, 2) as Square,
                endSquare: bestMove.substring(2, 4) as Square,
                color: 'rgb(0, 128, 0)'
              }] : undefined,
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {game.history().map((move, index) => (
                <button 
                  key={index}
                  onClick={() => onMoveClick(index)}
                  style={{ 
                    padding: '4px 8px',
                    cursor: 'pointer',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  {index % 2 === 0 ? `${Math.floor(index/2 + 1)}.` : ''} {move}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
