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
import PgnFileLoader from './components/PgnFileLoader/PgnFileLoader'
import CapturedPieces from './components/CapturedPieces/CapturedPieces'
import OpeningSelector from './components/OpeningSelector/OpeningSelector'
import GoogleLogin from './components/GoogleLogin/GoogleLogin'
import { useAccessToken } from './components/GoogleLogin/useAccessToken'
import { LoggedUser } from './components/LoggedUser/LoggedUset'
import { useElo } from './hooks/useElo'
import { useGameStatus } from './hooks/useGameStatus'

function App() {
  const [language, setLanguage] = useState<'it' | 'en'>('en')
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white')
  const [userColor, setUserColor] = useState<'white' | 'black' | 'auto' | null>(null)
  const [showColorModal, setShowColorModal] = useState(true)
  const [fenVisible, setFenVisible] = useState(false)
  const [helpVisible, setHelpVisible] = useState(true)
  const [logMessage, setLogMessage] = useState('')
  const [pgnFileLoaderVisible, setPgnFileLoaderVisible] = useState(false)
  const [openingSelectorVisible, setOpeningSelectorVisible] = useState(false)
  const [bestMovesVisible, setBestMovesVisible] = useState(() => {
    const savedBestMovesVisible = localStorage.getItem('chess-best-moves-visible')
    return savedBestMovesVisible ? JSON.parse(savedBestMovesVisible) : false
  })

  const [game] = useState(() => {
    // Load game state from localStorage
    const savedPgn = localStorage.getItem('chess-game-pgn')
    const chess = new Chess()
    if (savedPgn) {
      try {
        chess.loadPgn(savedPgn)
      } catch (error) {
        console.warn('Failed to load saved game:', error)
      }
    }
    return chess
  })

  const [fen, setFen] = useState(game.fen())
  const [evaluation, setEvaluation] = useState<number>(0)
  const [mateIn, setMateIn] = useState<number | null>(null)
  const [bestMove, setBestMove] = useState<string>('')
  const [bestMoves, setBestMoves] = useState<string[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [currentMoveIndex, setCurrentMoveIndex] = useState(() => {
    const savedIndex = localStorage.getItem('chess-current-move-index')
    return savedIndex ? parseInt(savedIndex) : -1
  })
  const [autoMove, setAutoMove] = useState(() => {
    const savedAutoMove = localStorage.getItem('chess-auto-move')
    return savedAutoMove ? JSON.parse(savedAutoMove) : true
  })
  const engineRef = useRef<Worker | null>(null)
  const { elo, setElo } = useElo()
  const { gameFinished, setGameFinished } = useGameStatus()

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('chess-language')
    const savedUserColor = localStorage.getItem('chess-user-color')
    const savedBoardOrientation = localStorage.getItem('chess-board-orientation')
    const savedFenVisible = localStorage.getItem('chess-fen-visible')
    const savedHelpVisible = localStorage.getItem('chess-help-visible')

    if (savedLanguage) setLanguage(savedLanguage as 'it' | 'en')
    if (savedUserColor) {
      setUserColor(savedUserColor as 'white' | 'black' | 'auto')
      setShowColorModal(false)
    }
    if (savedBoardOrientation) setBoardOrientation(savedBoardOrientation as 'white' | 'black')
    if (savedFenVisible) setFenVisible(JSON.parse(savedFenVisible))
    if (savedHelpVisible) setHelpVisible(JSON.parse(savedHelpVisible))
  }, [])

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chess-game-pgn', game.pgn())
    localStorage.setItem('chess-current-move-index', currentMoveIndex.toString())
  }, [game.history().length, currentMoveIndex])

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('chess-language', language)
  }, [language])

  useEffect(() => {
    if (userColor) localStorage.setItem('chess-user-color', userColor)
  }, [userColor])

  useEffect(() => {
    localStorage.setItem('chess-board-orientation', boardOrientation)
  }, [boardOrientation])

  useEffect(() => {
    localStorage.setItem('chess-auto-move', JSON.stringify(autoMove))
  }, [autoMove])

  useEffect(() => {
    localStorage.setItem('chess-fen-visible', JSON.stringify(fenVisible))
  }, [fenVisible])

  useEffect(() => {
    localStorage.setItem('chess-help-visible', JSON.stringify(helpVisible))
  }, [helpVisible])

  useEffect(() => {
    localStorage.setItem('chess-best-moves-visible', JSON.stringify(bestMovesVisible))
  }, [bestMovesVisible])

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
            const cp = parseInt(match[1])
            // Convert centipawns to evaluation (0 to 100 range)
            // 0 = black advantage, 50 = equal, 100 = white advantage
            const evaluation = 100 / (1 + Math.exp(-0.00368208 * cp))
            setEvaluation(evaluation)
            setMateIn(null) // Clear mate when we have a regular evaluation
          }
        }
        if (e.data.includes('score mate')) {
          const match = e.data.match(/score mate ([-\d]+)/)
          if (match) {
            const mate = parseInt(match[1])
            setMateIn(mate)
            setEvaluation(mate > 0 ? 100 : 0) // Set evaluation to 100 for white mate, 0 for black mate
          }
        } else if (e.data.includes('multipv')) {
          // Extract moves from MultiPV lines
          const pvMatch = e.data.match(/multipv (\d+).*?pv ([a-h][1-8][a-h][1-8][qrbn]?)/);
          if (pvMatch) {
            const move = pvMatch[2];
            setBestMoves(prev => {
              const newMoves = [...prev];
              const pvIndex = parseInt(pvMatch[1]) - 1;
              newMoves[pvIndex] = move;
              return newMoves.slice(0, 3); // Keep only top 3 moves
            });
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

  const configureStockfishAsWeakPlayer = () => {
    if (!engineRef.current) return

    // Configure Stockfish to play as poorly as possible
    // engineRef.current.postMessage('setoption name Skill Level value 0')
    // engineRef.current.postMessage('setoption name Contempt value -1000')
    // engineRef.current.postMessage('setoption name Move Overhead value 3000')
    // engineRef.current.postMessage('setoption name Slow Mover value 10')
    // engineRef.current.postMessage('setoption name nodestime value 1')
    // engineRef.current.postMessage('setoption name Use NNUE value false')

    engineRef.current.postMessage('setoption name UCI_LimitStrength value true')
    engineRef.current.postMessage(`setoption name UCI_Elo value ${elo}`)
    engineRef.current.postMessage('setoption name MultiPV value 1')
  }

  const analyzePosition = () => {
    if (!engineRef.current) return
    setIsThinking(true)
    setBestMove('')
    setBestMoves([])
    engineRef.current.postMessage('stop')
    configureStockfishAsWeakPlayer()
    engineRef.current.postMessage('position fen ' + fen)
    engineRef.current.postMessage('go depth 1 movetime 50')
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

      // Check if game is finished
      const wasGameFinished = gameFinished
      const isGameFinished = game.isGameOver()
      setGameFinished(isGameFinished)

      // If game just finished and user won, increment ELO
      if (!wasGameFinished && isGameFinished && userColor && userColor !== 'auto') {
        // Check if user won
        if (game.isCheckmate()) {
          const winner = game.turn() === 'w' ? 'black' : 'white'
          if (winner === userColor) {
            setElo(prevElo => prevElo + 10)
          }
        }
      }

      // Save game state after move
      localStorage.setItem('chess-game-pgn', game.pgn())
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

      // Check if game is finished
      const wasGameFinished = gameFinished
      const isGameFinished = game.isGameOver()
      setGameFinished(isGameFinished)

      // If game just finished and user won, increment ELO
      if (!wasGameFinished && isGameFinished && userColor && userColor !== 'auto') {
        // Check if user won
        if (game.isCheckmate()) {
          const winner = game.turn() === 'w' ? 'black' : 'white'
          if (winner === userColor) {
            setElo(prevElo => prevElo + 10)
          }
        }
      }

      // Save game state after move
      localStorage.setItem('chess-game-pgn', game.pgn())
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
    localStorage.setItem('chess-user-color', color)

    if (color === 'auto') {
      setBoardOrientation('white')
      setAutoMove(true)
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

  const handleLoadPgn = (pgn: string) => {
    try {
      const newGame = new Chess()
      newGame.loadPgn(pgn)

      // Replace the current game with loaded game
      game.reset()
      game.loadPgn(pgn)

      setFen(game.fen())
      setCurrentMoveIndex(game.history().length - 1)
      localStorage.setItem('chess-game-pgn', game.pgn())

      console.log('PGN loaded successfully')
    } catch (error) {
      console.error('Failed to load PGN:', error)
      alert('Invalid PGN format. Please check your input.')
    }
  }

  const handleClosePgnFileLoader = () => {
    setPgnFileLoaderVisible(false)
  }

  const handleCloseOpeningSelector = () => {
    setOpeningSelectorVisible(false)
  }

  const handleResetGame = () => {
    // Only ask for confirmation if game is in progress
    const shouldConfirm = gameFinished || confirm('Are you sure you want to reset the game and clear all saved data?')

    if (shouldConfirm) {
      // Clear localStorage
      localStorage.removeItem('chess-game-pgn')
      localStorage.removeItem('chess-current-move-index')
      localStorage.removeItem('chess-language')
      localStorage.removeItem('chess-user-color')
      localStorage.removeItem('chess-board-orientation')
      localStorage.removeItem('chess-auto-move')
      localStorage.removeItem('chess-fen-visible')
      localStorage.removeItem('chess-help-visible')
      localStorage.removeItem('chess-game-finished')
      localStorage.removeItem('chess-best-moves-visible')

      // Reset game state
      game.reset()
      setFen(game.fen())
      setCurrentMoveIndex(-1)
      setEvaluation(0)
      setBestMove('')
      setIsThinking(false)
      setMateIn(null)
      setGameFinished(false)

      // Reset UI state
      setShowColorModal(true)
      setUserColor(null)
      setBoardOrientation('white')
      setAutoMove(true)
      setFenVisible(false)
      setHelpVisible(false)
      setLogMessage('')
      setBestMovesVisible(true)

      console.log('Game reset successfully')
    }
  }


  const getCapturedPieces = (color: string) => {
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

  // Get the sum of values of captured pieces
  const pieceValues = {
    'p': 1,
    'n': 3,
    'b': 3,
    'r': 5,
    'q': 9,
    'k': 0 // King is not counted in value
  }

  const boardOrientationPoints = getCapturedPieces(boardOrientation).reduce((sum, piece) => {
    const pieceType = piece[0] // Get the type of the piece (e.g., 'p', 'n', etc.)
    return sum + (pieceValues[pieceType as keyof typeof pieceValues] || 0)
  }, 0)

  const opponentPoints = getCapturedPieces(boardOrientation === 'white' ? 'black' : 'white').reduce((sum, piece) => {
    const pieceType = piece[0] // Get the type of the piece (e.g., 'p', 'n', etc.)
    return sum + (pieceValues[pieceType as keyof typeof pieceValues] || 0)
  }, 0)

  const highest = boardOrientationPoints > opponentPoints ? boardOrientationPoints : opponentPoints

  const points = {
    sopra: boardOrientationPoints,
    sotto: opponentPoints,
  }

  const surplus = boardOrientationPoints - opponentPoints;
  const at = useAccessToken();

  if (!at) return <GoogleLogin />

  return (
    <>
      <ColorSelectionModal
        isOpen={showColorModal}
        onColorSelect={handleColorSelection}
        language={language}
      />

      <PgnFileLoader
        onLoadPgn={handleLoadPgn}
        language={language}
        isOpen={pgnFileLoaderVisible}
        onClose={handleClosePgnFileLoader}
      />

      <OpeningSelector
        onLoadOpening={handleLoadPgn}
        language={language}
        isOpen={openingSelectorVisible}
        onClose={handleCloseOpeningSelector}
      />

      <div className="layout-container">

        <div className="nav-content">
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
            bestMovesVisible={bestMovesVisible}
            setBestMovesVisible={setBestMovesVisible}
            onButtonHover={handleButtonHover}
            onButtonLeave={handleButtonLeave}
            buttonTexts={buttonTexts}
            pgnFileLoaderVisible={pgnFileLoaderVisible}
            setPgnFileLoaderVisible={setPgnFileLoaderVisible}
            openingSelectorVisible={openingSelectorVisible}
            setOpeningSelectorVisible={setOpeningSelectorVisible}
            onResetGame={handleResetGame}
            elo={elo}
          />
        </div>

        <div style={{ marginTop: '20px' }}><LoggedUser /></div>

        <div className="app-container">
          <div className="main-content">

            <div style={{ padding: '10px', fontWeight: 'bold', textAlign: 'center' }}>
              Game Status: {gameFinished ? 'FINISHED' : 'IN PROGRESS'}
            </div>

            <LogMessage message={logMessage} language={language} isVisible={helpVisible} />

            <CapturedPieces
              capturedPieces={getCapturedPieces(boardOrientation === 'white' ? 'black' : 'white')}
              game={game}
              position="top"
              color={boardOrientation === 'white' ? 'black' : 'white'}
              amount={points.sotto}
              highest={highest}
              surplus={surplus}
            />

            <ChessboardContainer
              bestMove={bestMovesVisible ? bestMove : ''}
              bestMoves={bestMovesVisible ? bestMoves : []}
              fen={fen}
              onPieceDrop={onPieceDrop}
              boardOrientation={boardOrientation}
            />

            <CapturedPieces
              capturedPieces={getCapturedPieces(boardOrientation)}
              game={game}
              position="bottom"
              color={boardOrientation}
              amount={points.sopra}
              highest={highest}
              surplus={surplus}
            />

            <EvaluationBar evaluation={evaluation} mateIn={mateIn}
              winnerColor={surplus > 0 ? boardOrientation : surplus < 0 ? (boardOrientation === 'white' ? 'black' : 'white') : null}
            />
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
      </div >
    </>
  )
}

export default App