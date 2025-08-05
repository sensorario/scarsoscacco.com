import './EvaluationBar.css'

interface EvaluationBarProps {
    evaluation: number
    mateIn?: number | null
    boardOrientation: 'white' | 'black'
}

export default function EvaluationBar({ evaluation, mateIn, boardOrientation }: EvaluationBarProps) {
    const evalNum = evaluation || 50

    // Evaluation is already in 0-100 range
    // 0 = black advantage, 50 = equal, 100 = white advantage
    let whitePercentage = Math.max(0, Math.min(100, evalNum))

    // Format evaluation for display
    let displayEval: string
    if (mateIn !== null && mateIn !== undefined) {
        // Display mate information
        displayEval = mateIn > 0 ? `M${Math.abs(mateIn)}` : `M${Math.abs(mateIn)}`
    } else {
        // Format regular evaluation (convert back to traditional format)
        displayEval = evalNum === 50 ? '0.00' :
            evalNum > 50 ? `+${((evalNum - 50) / 10).toFixed(2)}` :
                `${((evalNum - 50) / 10).toFixed(2)}`
    }

    if (displayEval === 'M0') {
        if (boardOrientation === 'white') { whitePercentage = 100 } else { whitePercentage = 0 }
    }

    return (
        <div className="evaluation-bar">
            <div className="evaluation-header">
                {displayEval !== 'M0' && <span className="evaluation-value">{displayEval}</span>}
                <div className="evaluation-bar-container">
                    <div
                        className="evaluation-white"
                        style={{ width: `${whitePercentage}%` }}
                    />
                    <div
                        className="evaluation-black"
                        style={{ width: `${100 - whitePercentage}%` }}
                    />
                </div>
            </div>
        </div>
    )
}
