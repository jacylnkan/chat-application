import React from 'react'
import "../styles/Header.css"

export default function Header({text="Text Goes Here", type}) {
    return (
        <div className={"header-container" + " " + type}>{text}</div>
    )
}
