import './SavedGamesModal.css'
import { useState } from 'react'

interface SavedGame {
    id: string
    pgn: string
    date: string
    result: string
    userColor: string | null
    finalElo: number
}

interface SavedGamesModalProps {
    isOpen: boolean
    onClose: () => void
    onLoadGame: (pgn: string) => void
    language: 'it' | 'en'
}

export default function SavedGamesModal({ isOpen, onClose, onLoadGame, language }: SavedGamesModalProps) {
    if (!isOpen) return null

    const savedGames: SavedGame[] = JSON.parse(localStorage.getItem('chess-completed-games') || '[]')
    const [currentPage, setCurrentPage] = useState(0)
    const itemsPerPage = 1
    const totalPages = Math.ceil(savedGames.length / itemsPerPage)
    const currentGame = savedGames[currentPage]

    const texts = {
        it: {
            title: 'Partite Salvate',
            noGames: 'Nessuna partita salvata',
            date: 'Data',
            result: 'Risultato',
            color: 'Colore',
            elo: 'ELO',
            load: 'Carica',
            close: 'Chiudi',
            delete: 'Elimina',
            previous: 'Precedente',
            next: 'Successivo',
            pageInfo: 'Pagina {current} di {total}'
        },
        en: {
            title: 'Saved Games',
            noGames: 'No saved games',
            date: 'Date',
            result: 'Result',
            color: 'Color',
            elo: 'ELO',
            load: 'Load',
            close: 'Close',
            delete: 'Delete',
            previous: 'Previous',
            next: 'Next',
            pageInfo: 'Page {current} of {total}'
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString()
    }

    const handleDeleteGame = (gameId: string) => {
        const updatedGames = savedGames.filter(game => game.id !== gameId)
        localStorage.setItem('chess-completed-games', JSON.stringify(updatedGames))

        // Adjust current page if needed
        const newTotalPages = Math.ceil(updatedGames.length / itemsPerPage)
        if (currentPage >= newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages - 1)
        } else if (updatedGames.length === 0) {
            setCurrentPage(0)
        }

        // Force re-render by closing and reopening modal
        onClose()
        setTimeout(() => window.location.reload(), 100)
    }

    const goToPreviousPage = () => {
        setCurrentPage(prev => Math.max(0, prev - 1))
    }

    const goToNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content saved-games-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{texts[language].title}</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {savedGames.length === 0 ? (
                        <p>{texts[language].noGames}</p>
                    ) : (
                        <>
                            <div className="games-list">
                                {currentGame && (
                                    <div key={currentGame.id} className="game-item">
                                        <div className="game-info">
                                            <span className="game-date">{formatDate(currentGame.date)}</span>
                                            <span className="game-result">{currentGame.result}</span>
                                            <span className="game-color">{currentGame.userColor || 'auto'}</span>
                                            <span className="game-elo">ELO: {currentGame.finalElo}</span>
                                        </div>
                                        <div className="game-actions">
                                            <button
                                                className="load-button"
                                                onClick={() => {
                                                    onLoadGame(currentGame.pgn)
                                                    onClose()
                                                }}
                                            >
                                                {texts[language].load}
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDeleteGame(currentGame.id)}
                                            >
                                                {texts[language].delete}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        className="pagination-button"
                                        onClick={goToPreviousPage}
                                        disabled={currentPage === 0}
                                    >
                                        {texts[language].previous}
                                    </button>

                                    <span className="page-info">
                                        {texts[language].pageInfo
                                            .replace('{current}', (currentPage + 1).toString())
                                            .replace('{total}', totalPages.toString())}
                                    </span>

                                    <button
                                        className="pagination-button"
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages - 1}
                                    >
                                        {texts[language].next}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="close-button" onClick={onClose}>
                        {texts[language].close}
                    </button>
                </div>
            </div>
        </div>
    )
}
