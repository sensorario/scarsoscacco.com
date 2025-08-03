import './LogMessage.css'

interface LogMessageProps {
    message: string
    language: 'it' | 'en'
    isVisible: boolean
}

export default function LogMessage({ message, language, isVisible }: LogMessageProps) {
    if (!isVisible) return null

    return (
        <div className="log-message">
            <div className="log-content">
                {message || (language === 'it' ? 'Passa il mouse sui pulsanti per vedere la descrizione' : 'Hover over buttons to see description')}
            </div>
        </div>
    )
}
