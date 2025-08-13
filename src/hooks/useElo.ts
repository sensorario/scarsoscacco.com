import { useState, useEffect } from 'react'

export const useElo = () => {
    const [elo, setElo] = useState<number>(() => {
        const savedElo = localStorage.getItem('chess-elo')
        return savedElo ? parseInt(savedElo) : 100
    })

    useEffect(() => {
        localStorage.setItem('chess-elo', elo.toString())
    }, [elo])

    return { elo, setElo }
}
