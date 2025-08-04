import './PgnFileLoader.css'
import { useState, useRef } from 'react'

interface PgnFileLoaderProps {
  onLoadPgn: (pgn: string) => void
  language: 'it' | 'en'
  isOpen: boolean
  onClose: () => void
}

export default function PgnFileLoader({ onLoadPgn, language, isOpen, onClose }: PgnFileLoaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const texts = {
    it: {
      title: 'Carica PGN da File',
      selectFile: 'Seleziona File PGN',
      selectedFile: 'File selezionato:',
      loadButton: 'Carica Partita',
      cancelButton: 'Annulla',
      dragDrop: 'Trascina un file PGN qui o clicca per selezionare'
    },
    en: {
      title: 'Load PGN from File',
      selectFile: 'Select PGN File',
      selectedFile: 'Selected file:',
      loadButton: 'Load Game',
      cancelButton: 'Cancel',
      dragDrop: 'Drag and drop a PGN file here or click to select'
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.name.toLowerCase().endsWith('.pgn')) {
      setSelectedFile(file)
    } else {
      alert('Please select a valid PGN file.')
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.name.toLowerCase().endsWith('.pgn')) {
      setSelectedFile(file)
    } else {
      alert('Please select a valid PGN file.')
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleLoadFile = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    try {
      const text = await selectedFile.text()
      onLoadPgn(text)
      setSelectedFile(null)
      onClose()
    } catch (error) {
      console.error('Error reading file:', error)
      alert('Error reading file. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="pgn-file-modal-overlay">
      <div className="pgn-file-modal-content">
        <h3>{texts[language].title}</h3>
        
        <div 
          className="file-drop-zone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="drop-zone-content">
            <span className="file-icon">📁</span>
            <p>{texts[language].dragDrop}</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pgn"
          onChange={handleFileSelect}
          className="file-input-hidden"
        />

        {selectedFile && (
          <div className="selected-file">
            <p>{texts[language].selectedFile}</p>
            <span className="file-name">{selectedFile.name}</span>
          </div>
        )}

        <div className="pgn-file-buttons">
          <button
            onClick={handleLoadFile}
            disabled={!selectedFile || isLoading}
            className="pgn-file-button load-button"
          >
            {isLoading ? '...' : texts[language].loadButton}
          </button>
          <button
            onClick={handleCancel}
            className="pgn-file-button cancel-button"
            disabled={isLoading}
          >
            {texts[language].cancelButton}
          </button>
        </div>
      </div>
    </div>
  )
}
