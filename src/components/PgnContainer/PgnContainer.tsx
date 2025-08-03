import { Chess } from 'chess.js'
import { useEffect, useRef } from 'react'
import './PgnContainer.css'

interface PgnContainerProps {
    game: Chess
    currentMoveIndex: number
    onMoveClick: (moveIndex: number | null) => void
    translateMove: (move: string) => string
}

export default function PgnContainer({
    game,
    currentMoveIndex,
    onMoveClick,
    translateMove
}: PgnContainerProps) {
    const movesRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (movesRef.current) {
            movesRef.current.scrollTop = movesRef.current.scrollHeight
        }
    }, [game.history().length])

    return (
        <div className='pgn-container'>
            <div className="pgn-moves" ref={movesRef}>
                {game.history().reduce((pairs: any[], move: string, index: number) => {
                    if (index % 2 === 0) {
                        pairs.push({
                            moveNumber: Math.floor(index / 2) + 1,
                            white: move,
                            whiteIndex: index,
                            black: null,
                            blackIndex: null
                        })
                    } else {
                        if (pairs.length > 0) {
                            pairs[pairs.length - 1].black = move
                            pairs[pairs.length - 1].blackIndex = index
                        }
                    }
                    return pairs
                }, []).map((pair, pairIndex) => (
                    <div key={pairIndex} className="pgn-move-pair">
                        <span className="pgn-move-number">
                            {pair.moveNumber}.
                        </span>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                onMoveClick(pair.whiteIndex)
                            }}
                            className={`pgn-move-link ${currentMoveIndex === pair.whiteIndex ? 'active' : 'inactive'}`}
                        >
                            {translateMove(pair.white)}
                        </a>
                        {pair.black && (
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    onMoveClick(pair.blackIndex)
                                }}
                                className={`pgn-move-link ${currentMoveIndex === pair.blackIndex ? 'active' : 'inactive'}`}
                            >
                                {translateMove(pair.black)}
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
