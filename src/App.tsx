import './App.css'
import { Chess } from 'chess.js'
import { useState, useEffect, useRef } from "react"
import NavigationBar from './components/NavigationBar/NavigationBar'
import ChessboardContainer from './components/ChessboardContainer/ChessboardContainer'
import EvaluationBar from './components/EvaluationBar/EvaluationBar'
import PgnContainer from './components/PgnContainer/PgnContainer'
import FenContainer from './components/FenContainer/FenContainer'
import ColorSelectionModal from './components/ColorSelectionModal/ColorSelectionModal'
import LogMessage from './components/LogMessage/LogMessage'

function App() {
  const [language, setLanguage] = useState<'it' | 'en'>('en')
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white')
  const [userColor, setUserColor] = useState<'white' | 'black' | 'auto' | null>(null)
  const [showColorModal, setShowColorModal] = useState(true)
  const [fenVisible, setFenVisible] = useState(false)
  const [helpVisible, setHelpVisible] = useState(false)
  const [logMessage, setLogMessage] = useState('')

  const [game] = useState(new Chess())
  const [fen, setFen] = useState(game.fen())
  const [evaluation, setEvaluation] = useState<string>('')
  const [bestMove, setBestMove] = useState<string>('')
  const [isThinking, setIsThinking] = useState(false)
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1)
  const [autoMove, setAutoMove] = useState(true)
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
            setIsThinking(false)
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
      setIsThinking(false)
      // Delay the move index update to show the move after the piece animation
      setTimeout(() => {
        setCurrentMoveIndex(game.history().length - 1)
      }, 300)
    }
  }

  // Effect for auto move functionality
  useEffect(() => {
    if (userColor === 'auto' && bestMove && !isThinking) {
      // In auto mode, always make the best move after a delay
      const timer = setTimeout(() => {
        makeBestMove()
      }, 1500) // 1.5 second delay for better visibility

      return () => clearTimeout(timer)
    } else if (autoMove && bestMove && !isThinking && userColor && userColor !== 'auto') {
      const opponentColor = userColor === 'white' ? 'b' : 'w'

      if (game.turn() === opponentColor) {
        // Automatically make the best move for the opponent after a short delay
        const timer = setTimeout(() => {
          makeBestMove()
        }, 1000) // 1 second delay

        return () => clearTimeout(timer)
      }
    }
  }, [bestMove, autoMove, isThinking, userColor, game.turn()])

  const onPieceDrop = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null; }) => {
    if (!targetSquare) return false
    const move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
    if (move) {
      setFen(game.fen())
      setIsThinking(false)
      // Delay the move index update to show the move after the piece animation
      setTimeout(() => {
        setCurrentMoveIndex(game.history().length - 1)
      }, 300)
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

  const onMoveClick = (moveIndex: number | null) => {
    const moves = game.history()
    const tempGame = new Chess()

    if (!moveIndex) return;

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
      rotateBoard: '↻',
      makeBestMove: isThinking ? '↻' : '→',
      autoMove: '⚡',
      italian: '🇮🇹',
      english: '🇬🇧'
    },
    en: {
      rotateBoard: '↻',
      makeBestMove: isThinking ? '↻' : '→',
      autoMove: '⚡',
      italian: '🇮🇹',
      english: '🇬🇧'
    }
  }

  const translateMove = (move: string) => {
    if (language === 'en') return move

    return move.split('').map(char => {
      return moveTranslations.it[char as keyof typeof moveTranslations.it] || char
    }).join('')
  }

  const handleColorSelection = (color: 'white' | 'black' | 'auto') => {
    setUserColor(color)

    if (color === 'auto') {
      setBoardOrientation('white') // Default orientation for auto mode
      setAutoMove(true) // Enable auto move for computer vs computer
    } else {
      setBoardOrientation(color)
    }

    setShowColorModal(false)
  }

  const handleButtonHover = (message: string) => {
    setLogMessage(message)
  }

  const handleButtonLeave = () => {
    setLogMessage('')
  }

  return (
    <>
      <ColorSelectionModal
        isOpen={showColorModal}
        onColorSelect={handleColorSelection}
        language={language}
      />

      <div className="app-container">
        <div className="main-content">
          <NavigationBar
            language={language}
            setLanguage={setLanguage}
            boardOrientation={boardOrientation}
            setBoardOrientation={setBoardOrientation}
            autoMove={autoMove}
            setAutoMove={setAutoMove}
            makeBestMove={makeBestMove}
            bestMove={bestMove}
            isThinking={isThinking}
            fenVisible={fenVisible}
            setFenVisible={setFenVisible}
            helpVisible={helpVisible}
            setHelpVisible={setHelpVisible}
            onButtonHover={handleButtonHover}
            onButtonLeave={handleButtonLeave}
            buttonTexts={buttonTexts}
          />

          <LogMessage message={logMessage} language={language} isVisible={helpVisible} />

          <ChessboardContainer
            bestMove={bestMove}
            fen={fen}
            onPieceDrop={onPieceDrop}
            boardOrientation={boardOrientation}
          />

          <EvaluationBar evaluation={evaluation} />
        </div>

        <div className="side-content">
          <PgnContainer
            game={game}
            currentMoveIndex={currentMoveIndex}
            onMoveClick={onMoveClick}
            translateMove={translateMove}
          />

          <FenContainer fen={fen} isVisible={fenVisible} />
        </div>
      </div>
    </>
  )
}

export default App