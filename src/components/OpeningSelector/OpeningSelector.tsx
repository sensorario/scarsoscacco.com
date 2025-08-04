import './OpeningSelector.css'
import { useState } from 'react'

interface OpeningSelectorProps {
  onLoadOpening: (pgn: string) => void
  language: 'it' | 'en'
  isOpen: boolean
  onClose: () => void
}

export default function OpeningSelector({ onLoadOpening, language, isOpen, onClose }: OpeningSelectorProps) {
  const [selectedOpening, setSelectedOpening] = useState<string>('')

  const texts = {
    it: {
      title: 'Seleziona Apertura',
      loadButton: 'Carica Apertura',
      cancelButton: 'Annulla',
      selectOpening: 'Seleziona un\'apertura...'
    },
    en: {
      title: 'Select Opening',
      loadButton: 'Load Opening',
      cancelButton: 'Cancel',
      selectOpening: 'Select an opening...'
    }
  }

  const openings = [
    { name: 'Italian Game', pgn: '1. e4 e5 2. Nf3 Nc6 3. Bc4' },
    { name: 'Ruy Lopez', pgn: '1. e4 e5 2. Nf3 Nc6 3. Bb5' },
    { name: 'Sicilian Defense', pgn: '1. e4 c5' },
    { name: 'French Defense', pgn: '1. e4 e6' },
    { name: 'Caro-Kann Defense', pgn: '1. e4 c6' },
    { name: 'Queen\'s Gambit', pgn: '1. d4 d5 2. c4' },
    { name: 'King\'s Indian Defense', pgn: '1. d4 Nf6 2. c4 g6' },
    { name: 'English Opening', pgn: '1. c4' },
    { name: 'Nimzo-Indian Defense', pgn: '1. d4 Nf6 2. c4 e6 3. Nc3 Bb4' },
    { name: 'Alekhine Defense', pgn: '1. e4 Nf6' },
    { name: 'Scandinavian Defense', pgn: '1. e4 d5' },
    { name: 'Pirc Defense', pgn: '1. e4 d6' },
    { name: 'Catalan Opening', pgn: '1. d4 Nf6 2. c4 e6 3. g3' },
    { name: 'London System', pgn: '1. d4 d5 2. Bf4' },
    { name: 'Vienna Game', pgn: '1. e4 e5 2. Nc3' },
  ]

  const handleLoadOpening = () => {
    if (selectedOpening) {
      onLoadOpening(selectedOpening)
      setSelectedOpening('')
      onClose()
    }
  }

  const handleCancel = () => {
    setSelectedOpening('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="opening-modal-overlay">
      <div className="opening-modal-content">
        <h3>{texts[language].title}</h3>
        
        <div className="opening-list">
          {openings.map((opening, index) => (
            <div 
              key={index}
              className={`opening-item ${selectedOpening === opening.pgn ? 'selected' : ''}`}
              onClick={() => setSelectedOpening(opening.pgn)}
            >
              <span className="opening-name">{opening.name}</span>
              <span className="opening-moves">{opening.pgn}</span>
            </div>
          ))}
        </div>

        <div className="opening-buttons">
          <button
            onClick={handleLoadOpening}
            disabled={!selectedOpening}
            className="opening-button load-button"
          >
            {texts[language].loadButton}
          </button>
          <button
            onClick={handleCancel}
            className="opening-button cancel-button"
          >
            {texts[language].cancelButton}
          </button>
        </div>
      </div>
    </div>
  )
}
