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
            <div className="evaluation-bar-container">
                <div
                    className="evaluation-white"
                    style={{ width: `${whitePercentage}%` }}
                />
                <div
                    className="evaluation-black"
                    style={{ width: `${100 - whitePercentage}%` }}
                />
                <div
                    className="evaluation-text"
                    style={{
                        color: whitePercentage > 50 ? 'black' : 'white',
                        textShadow: whitePercentage > 50 ? '1px 1px 2px white' : '1px 1px 2px black'
                    }}
                >
                    {evaluation || '0'}
                </div>
            </div>
            <div className="evaluation-labels">
                <span>Black Advantage</span>
                <span>Equal</span>
                <span>White Advantage</span>
            </div>
        </div>
    )
}
