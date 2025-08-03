import './ColorSelectionModal.css'

interface ColorSelectionModalProps {
    isOpen: boolean
    onColorSelect: (color: 'white' | 'black') => void
}

export default function ColorSelectionModal({ isOpen, onColorSelect }: ColorSelectionModalProps) {
    if (!isOpen) return null

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Choose Your Color</h2>
                <p>Select which color pieces you want to play with:</p>
                <div className="color-buttons">
                    <button
                        className="color-button white-button"
                        onClick={() => onColorSelect('white')}
                    >
                        <span className="piece-icon">♕</span>
                        <span>Play as White</span>
                    </button>
                    <button
                        className="color-button black-button"
                        onClick={() => onColorSelect('black')}
                    >
                        <span className="piece-icon">♛</span>
                        <span>Play as Black</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
