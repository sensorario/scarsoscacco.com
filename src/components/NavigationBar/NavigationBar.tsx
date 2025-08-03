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
}

export default function NavigationBar({
    language,
    setLanguage,
    boardOrientation,
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
    buttonTexts
}: NavigationBarProps) {
    const messages = {
        it: {
            rotateBoard: 'Ruota la scacchiera per cambiare prospettiva',
            autoMove: 'Attiva/disattiva le mosse automatiche del computer',
            makeBestMove: 'Esegui la mossa migliore suggerita dal computer',
            fenToggle: 'Mostra/nascondi la notazione FEN della posizione',
            helpToggle: 'Mostra/nascondi i messaggi di aiuto'
        },
        en: {
            rotateBoard: 'Rotate the chessboard to change perspective',
            autoMove: 'Enable/disable automatic computer moves',
            makeBestMove: 'Execute the best move suggested by the computer',
            fenToggle: 'Show/hide the FEN notation of the position',
            helpToggle: 'Show/hide help messages'
        }
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
                    >
                        {buttonTexts[language].rotateBoard}
                    </button>
                    <button
                        onClick={() => setAutoMove(prev => !prev)}
                        className={`nav-button action-button ${autoMove ? 'active' : ''}`}
                        onMouseEnter={() => onButtonHover(messages[language].autoMove)}
                        onMouseLeave={onButtonLeave}
                    >
                        {buttonTexts[language].autoMove}
                    </button>
                    <button
                        onClick={makeBestMove}
                        className={`nav-button action-button ${bestMove ? 'active' : ''}`}
                        disabled={!bestMove || isThinking}
                        onMouseEnter={() => onButtonHover(messages[language].makeBestMove)}
                        onMouseLeave={onButtonLeave}
                    >
                        <span className={isThinking ? 'thinking-icon' : ''}>
                            {buttonTexts[language].makeBestMove}
                        </span>
                    </button>
                    <button
                        onClick={() => setFenVisible(prev => !prev)}
                        className={`nav-button action-button ${fenVisible ? 'active' : ''}`}
                        title={fenVisible ? "Hide FEN" : "Show FEN"}
                        onMouseEnter={() => onButtonHover(messages[language].fenToggle)}
                        onMouseLeave={onButtonLeave}
                    >
                        {fenVisible ? '◉' : '○'}
                    </button>
                    <button
                        onClick={() => setHelpVisible(prev => !prev)}
                        className={`nav-button action-button ${helpVisible ? 'active' : ''}`}
                        title={helpVisible ? "Hide Help" : "Show Help"}
                        onMouseEnter={() => onButtonHover(messages[language].helpToggle)}
                        onMouseLeave={onButtonLeave}
                    >
                        ?
                    </button>
                </div>
            </div>
        </div>
    )
}
