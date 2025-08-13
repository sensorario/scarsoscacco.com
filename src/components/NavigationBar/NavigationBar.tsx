import './NavigationBar.css'

interface NavigationBarProps {
    language: 'it' | 'en'
    setLanguage: (lang: 'it' | 'en') => void
    boardOrientation: 'white' | 'black'
    setBoardOrientation: (orientation: 'white' | 'black' | ((prev: 'white' | 'black') => 'white' | 'black')) => void
    autoMove: boolean
    setAutoMove: (autoMove: boolean | ((prev: boolean) => boolean)) => void
    makeBestMove: () => void
    bestMove: string
    isThinking: boolean
    fenVisible: boolean
    setFenVisible: (visible: boolean | ((prev: boolean) => boolean)) => void
    helpVisible: boolean
    setHelpVisible: (visible: boolean | ((prev: boolean) => boolean)) => void
    onButtonHover: (message: string) => void
    onButtonLeave: () => void
    buttonTexts: {
        it: { rotateBoard: string; makeBestMove: string; autoMove: string; italian: string; english: string }
        en: { rotateBoard: string; makeBestMove: string; autoMove: string; italian: string; english: string }
    }
    pgnFileLoaderVisible: boolean
    setPgnFileLoaderVisible: (visible: boolean | ((prev: boolean) => boolean)) => void
    onResetGame: () => void
    openingSelectorVisible: boolean
    setOpeningSelectorVisible: (visible: boolean | ((prev: boolean) => boolean)) => void
}

export default function NavigationBar({
    language,
    setLanguage,
    setBoardOrientation,
    autoMove,
    setAutoMove,
    makeBestMove,
    bestMove,
    isThinking,
    fenVisible,
    setFenVisible,
    helpVisible,
    setHelpVisible,
    onButtonHover,
    onButtonLeave,
    buttonTexts,
    setPgnFileLoaderVisible,
    onResetGame,
    setOpeningSelectorVisible
}: NavigationBarProps) {
    const messages = {
        it: {
            rotateBoard: 'Ruota la scacchiera per cambiare prospettiva',
            autoMove: 'Attiva/disattiva le mosse automatiche del computer',
            makeBestMove: 'Esegui la mossa migliore suggerita dal computer',
            fenToggle: 'Mostra/nascondi la notazione FEN della posizione',
            helpToggle: 'Mostra/nascondi i messaggi di aiuto',
            pgnFileLoaderToggle: 'Carica PGN da file',
            resetGame: 'Ricomincia una nuova partita',
            openingSelector: 'Seleziona apertura'
        },
        en: {
            rotateBoard: 'Rotate the chessboard to change perspective',
            autoMove: 'Enable/disable automatic computer moves',
            makeBestMove: 'Execute the best move suggested by the computer',
            fenToggle: 'Show/hide the FEN notation of the position',
            helpToggle: 'Show/hide help messages',
            pgnFileLoaderToggle: 'Load PGN from file',
            resetGame: 'Start a new game',
            openingSelector: 'Select opening'
        }
    }

    const getButtonText = (key: string) => {
        const texts = {
            it: {
                rotateBoard: '↻',
                autoMove: '⚡',
                makeBestMove: isThinking ? '⟳' : '▶',
                fenToggle: '◉',
                helpToggle: '?',
                pgnFileLoaderToggle: '📄',
                resetGame: '↺',
                openingSelector: '📚'
            },
            en: {
                rotateBoard: '↻',
                autoMove: '⚡',
                makeBestMove: isThinking ? '⟳' : '▶',
                fenToggle: '◉',
                helpToggle: '?',
                pgnFileLoaderToggle: '📄',
                resetGame: '↺',
                openingSelector: '📚'
            }
        }
        return texts[language][key as keyof typeof texts[typeof language]]
    }

    return (
        <div className="navigation-bar">
            <div className="navigation-controls">
                <div className="button-group">
                    <button
                        onClick={() => setLanguage('it')}
                        className={`nav-button language-button-it ${language === 'it' ? '' : 'inactive'}`}
                    >
                        {buttonTexts[language].italian}
                    </button>
                    <button
                        onClick={() => setLanguage('en')}
                        className={`nav-button language-button-en ${language === 'en' ? '' : 'inactive'}`}
                    >
                        {buttonTexts[language].english}
                    </button>
                </div>
                <div className="button-group">
                    <button
                        onClick={() => setBoardOrientation(prev => prev === 'white' ? 'black' : 'white')}
                        className="nav-button action-button"
                        onMouseEnter={() => onButtonHover(messages[language].rotateBoard)}
                        onMouseLeave={onButtonLeave}
                        title={messages[language].rotateBoard}
                    >rotate</button>
                    <button
                        onClick={() => setAutoMove(prev => !prev)}
                        className={`nav-button action-button ${autoMove ? 'active' : ''}`}
                        onMouseEnter={() => onButtonHover(messages[language].autoMove)}
                        onMouseLeave={onButtonLeave}
                        title={messages[language].autoMove}
                    >
                        {getButtonText('autoMove')}
                    </button>
                    <button
                        onClick={makeBestMove}
                        className={`nav-button action-button ${bestMove ? 'active' : ''}`}
                        disabled={!bestMove || isThinking}
                        onMouseEnter={() => onButtonHover(messages[language].makeBestMove)}
                        onMouseLeave={onButtonLeave}
                        title={messages[language].makeBestMove}
                    >
                        {getButtonText('makeBestMove')}
                    </button>
                    <button
                        onClick={() => setFenVisible(prev => !prev)}
                        className={`nav-button action-button ${fenVisible ? 'active' : ''}`}
                        onMouseEnter={() => onButtonHover(messages[language].fenToggle)}
                        onMouseLeave={onButtonLeave}
                        title={messages[language].fenToggle}
                    >
                        {getButtonText('fenToggle')}
                    </button>
                    <button
                        onClick={() => setHelpVisible(prev => !prev)}
                        className={`nav-button action-button ${helpVisible ? 'active' : ''}`}
                        onMouseEnter={() => onButtonHover(messages[language].helpToggle)}
                        onMouseLeave={onButtonLeave}
                        title={messages[language].helpToggle}
                    >
                        {getButtonText('helpToggle')}
                    </button>
                    <button
                        onClick={() => setPgnFileLoaderVisible(true)}
                        className="nav-button action-button"
                        onMouseEnter={() => onButtonHover(messages[language].pgnFileLoaderToggle)}
                        onMouseLeave={onButtonLeave}
                        title={messages[language].pgnFileLoaderToggle}
                    >
                        {getButtonText('pgnFileLoaderToggle')}
                    </button>
                    <button
                        onClick={onResetGame}
                        className="nav-button action-button"
                        onMouseEnter={() => onButtonHover(messages[language].resetGame)}
                        onMouseLeave={onButtonLeave}
                        title={messages[language].resetGame}
                    >
                        {getButtonText('resetGame')}
                    </button>
                    <button
                        onClick={() => setOpeningSelectorVisible(true)}
                        className="nav-button action-button"
                        onMouseEnter={() => onButtonHover(messages[language].openingSelector)}
                        onMouseLeave={onButtonLeave}
                        title={messages[language].openingSelector}
                    >
                        {getButtonText('openingSelector')}
                    </button>
                </div>
            </div>
        </div>
    )
}
