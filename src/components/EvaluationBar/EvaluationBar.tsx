import './EvaluationBar.css'

interface EvaluationBarProps {
    evaluation: number
}

export default function EvaluationBar({ evaluation }: EvaluationBarProps) {
    const evalNum = evaluation || 50

    // Evaluation is already in 0-100 range
    // 0 = black advantage, 50 = equal, 100 = white advantage
    const whitePercentage = Math.max(0, Math.min(100, evalNum))

    // Format evaluation for display (convert back to traditional format)
    const displayEval = evalNum === 50 ? '0.00' :
        evalNum > 50 ? `+${((evalNum - 50) / 10).toFixed(2)}` :
            `${((evalNum - 50) / 10).toFixed(2)}`

    return (
        <div className="evaluation-bar">
            <div className="evaluation-header">
                <span className="evaluation-value">{displayEval}</span>
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
