import './EvaluationBar.css'

interface EvaluationBarProps {
    evaluation: string
}

export default function EvaluationBar({ evaluation }: EvaluationBarProps) {
    const evalNum = parseFloat(evaluation) || 0
    let whitePercentage

    if (evalNum >= 5) {
        whitePercentage = 100
    } else if (evalNum <= -5) {
        whitePercentage = 0
    } else {
        whitePercentage = 50 + (evalNum * 10)
    }

    return (
        <div className="evaluation-bar">
            <div className="evaluation-header">
                <span className="evaluation-value">{evaluation || '0'}</span>
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
