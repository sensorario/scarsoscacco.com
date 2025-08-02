import './App.css'
import { Chessboard } from 'react-chessboard'
import { Chess, type Square } from 'chess.js'
import { useState, useEffect, useRef } from "react"

function App() {
  const [language, setLanguage] = useState<'it' | 'en'>('it')
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white')

  const [game] = useState(new Chess())
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

    // Aggiorna la valutazione quando cambia la posizione
    analyzePosition()

    return () => engineRef.current?.terminate()
  }, [fen])

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

  const makeBestMove = () => {
    if (!bestMove) return

    const from = bestMove.substring(0, 2)
    const to = bestMove.substring(2, 4)
    const promotion = bestMove.length > 4 ? bestMove.substring(4, 5) : undefined

    const move = game.move({ from, to, promotion })
    if (move) {
      setFen(game.fen())
      setCurrentMoveIndex(game.history().length - 1)
      setIsThinking(false)
    }
  }

  const onPieceDrop = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null; }) => {
    if (!targetSquare) return false
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
      if (e.key === 'Backspace') {
        game.undo()
        setFen(game.fen())
        setCurrentMoveIndex(moves.length - 2)
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

  const moveTranslations = {
    it: {
      'K': 'R',
      'Q': 'D',
      'R': 'T',
      'B': 'A',
      'N': 'C',
      'x': 'x',
      '+': '+',
      '#': '#',
      'O-O': 'O-O',
      'O-O-O': 'O-O-O'
    },
    en: {
      'K': 'K',
      'Q': 'Q',
      'R': 'R',
      'B': 'B',
      'N': 'N',
      'x': 'x',
      '+': '+',
      '#': '#',
      'O-O': 'O-O',
      'O-O-O': 'O-O-O'
    }
  }

  const buttonTexts = {
    it: {
      rotateBoard: 'Ruota scacchiera',
      makeBestMove: 'Fai la mossa migliore'
    },
    en: {
      rotateBoard: 'Rotate board',
      makeBestMove: 'Make best move'
    }
  }

  const translateMove = (move: string) => {
    if (language === 'en') return move

    return move.split('').map(char => {
      return moveTranslations.it[char as keyof typeof moveTranslations.it] || char
    }).join('')
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
          <div style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setLanguage('it')}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: '1px solid #666',
                backgroundColor: language === 'it' ? 'white' : '#4a5568',
                color: language === 'it' ? '#1a202c' : 'white',
                marginRight: '8px',
                cursor: 'pointer'
              }}
            >
              Italiano
            </button>
            <button
              onClick={() => setLanguage('en')}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: '1px solid #666',
                backgroundColor: language === 'en' ? 'white' : '#4a5568',
                color: language === 'en' ? '#1a202c' : 'white',
                cursor: 'pointer'
              }}
            >
              English
            </button>
            <button
              onClick={() => setBoardOrientation(prev => prev === 'white' ? 'black' : 'white')}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: '1px solid #666',
                backgroundColor: '#4a5568',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {buttonTexts[language].rotateBoard}
            </button>
          </div>
          <h1>Scacchiera</h1>
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

            <button
              onClick={makeBestMove}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: '1px solid #666',
                backgroundColor: bestMove ? '#22c55e' : '#4a5568',
                color: 'white',
                cursor: 'pointer',
                marginTop: '8px'
              }}
              disabled={!bestMove}
            >
              {buttonTexts[language].makeBestMove}
            </button>

          </div>
          <div>
            <h2>FEN attuale</h2>
            <pre style={{ wordWrap: 'break-word' }}>{fen}</pre>
          </div>
          <div>
            <h2>PGN attuale</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {game.history().reduce((pairs: any[], move: string, index: number) => {
                if (index % 2 === 0) {
                  // White move - start a new pair
                  pairs.push({
                    moveNumber: Math.floor(index / 2) + 1,
                    white: move,
                    whiteIndex: index,
                    black: null,
                    blackIndex: null
                  })
                } else {
                  // Black move - complete the pair
                  if (pairs.length > 0) {
                    pairs[pairs.length - 1].black = move
                    pairs[pairs.length - 1].blackIndex = index
                  }
                }
                return pairs
              }, []).map((pair, pairIndex) => (
                <div key={pairIndex} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>
                    {pair.moveNumber}.
                  </span>
                  <button
                    onClick={() => onMoveClick(pair.whiteIndex)}
                    style={{
                      padding: '4px 8px',
                      cursor: 'pointer',
                      border: '1px solid #666',
                      borderRadius: '4px',
                      backgroundColor: currentMoveIndex === pair.whiteIndex ? 'white' : '#4a5568',
                      color: currentMoveIndex === pair.whiteIndex ? '#1a202c' : 'white',
                      fontWeight: currentMoveIndex === pair.whiteIndex ? 'bold' : 'normal'
                    }}
                  >
                    {translateMove(pair.white)}
                  </button>
                  {pair.black && (
                    <button
                      onClick={() => onMoveClick(pair.blackIndex)}
                      style={{
                        padding: '4px 8px',
                        cursor: 'pointer',
                        border: '1px solid #666',
                        borderRadius: '4px',
                        backgroundColor: currentMoveIndex === pair.blackIndex ? 'white' : '#4a5568',
                        color: currentMoveIndex === pair.blackIndex ? '#1a202c' : 'white',
                        fontWeight: currentMoveIndex === pair.blackIndex ? 'bold' : 'normal'
                      }}
                    >
                      {translateMove(pair.black)}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App