import './SideNavigation.css'
import { useState } from 'react'

export default function SideNavigation({ setLanguage }: { setLanguage: (lang: 'it' | 'en') => void }) {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)

    const menuItems = [
        {
            id: 'languages',
            title: 'Languages',
            submenu: [
                { label: 'English', handler: () => { setLanguage('en') } },
                { label: 'Italiano', handler: () => { setLanguage('it') } }
            ]
        },
    ]

    return (
        <div className="side-navigation">
            <div className="side-navigation-menu">
                <div className="first side-navigation-item">scarsoscacco.com</div>
                {menuItems.map(item => (
                    <div
                        key={item.id}
                        className="side-navigation-item"
                        onMouseEnter={() => setHoveredItem(item.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        {item.title}
                        {hoveredItem === item.id && (
                            <div className="side-navigation-submenu">
                                {item.submenu.map((subItem, index) => (
                                    <div key={index} className="side-navigation-subitem" onClick={() => {
                                        subItem.handler()
                                        setHoveredItem(null)
                                    }}>
                                        {subItem.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}