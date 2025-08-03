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
    buttonTexts
}: NavigationBarProps) {
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
                    >
                        {buttonTexts[language].rotateBoard}
                    </button>
                    <button
                        onClick={() => setAutoMove(prev => !prev)}
                        className={`nav-button action-button ${autoMove ? 'active' : ''}`}
                    >
                        {buttonTexts[language].autoMove}
                    </button>
                    <button
                        onClick={makeBestMove}
                        className={`nav-button action-button ${bestMove ? 'active' : ''}`}
                        disabled={!bestMove || isThinking}
                    >
                        <span className={isThinking ? 'thinking-icon' : ''}>
                            {buttonTexts[language].makeBestMove}
                        </span>
                    </button>
                    <button
                        onClick={() => setFenVisible(prev => !prev)}
                        className={`nav-button action-button ${fenVisible ? 'active' : ''}`}
                        title={fenVisible ? "Hide FEN" : "Show FEN"}
                    >
                        {fenVisible ? '◉' : '○'}
                    </button>
                </div>
            </div>
        </div>
    )
}
