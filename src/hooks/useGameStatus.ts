import { useState, useEffect } from 'react'

export const useGameStatus = () => {
    const [gameFinished, setGameFinished] = useState<boolean>(() => {
        const savedGameStatus = localStorage.getItem('chess-game-finished')
        return savedGameStatus ? JSON.parse(savedGameStatus) : false
    })

    useEffect(() => {
        localStorage.setItem('chess-game-finished', JSON.stringify(gameFinished))
    }, [gameFinished])

    return { gameFinished, setGameFinished }
}
