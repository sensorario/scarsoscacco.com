import './ColorSelectionModal.css'

interface ColorSelectionModalProps {
    isOpen: boolean
    onColorSelect: (color: 'white' | 'black' | 'auto') => void
    language: 'it' | 'en'
}

export default function ColorSelectionModal({ isOpen, onColorSelect, language }: ColorSelectionModalProps) {
    if (!isOpen) return null

    const texts = {
        it: {
            title: 'Scegli la modalità di gioco',
            description: 'Seleziona come vuoi giocare:',
            playAsWhite: 'Gioca con il Bianco',
            playAsBlack: 'Gioca con il Nero',
            watchComputer: 'Computer vs Computer'
        },
        en: {
            title: 'Choose Game Mode',
            description: 'Select how you want to play:',
            playAsWhite: 'Play as White',
            playAsBlack: 'Play as Black',
            watchComputer: 'Computer vs Computer'
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{texts[language].title}</h2>
                <p>{texts[language].description}</p>
                <div className="color-buttons">
                    <button
                        className="color-button white-button"
                        onClick={() => onColorSelect('white')}
                    >
                        <span className="piece-icon">♕</span>
                        <span>{texts[language].playAsWhite}</span>
                    </button>
                    <button
                        className="color-button black-button"
                        onClick={() => onColorSelect('black')}
                    >
                        <span className="piece-icon">♛</span>
                        <span>{texts[language].playAsBlack}</span>
                    </button>
                    <button
                        className="color-button auto-button"
                        onClick={() => onColorSelect('auto')}
                    >
                        <span className="piece-icon">⚔</span>
                        <span>{texts[language].watchComputer}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
