import React, {useState} from 'react'
import "../styles/MessageInput.css"

const USERNAME_CHANGE_COMMAND = "/name "
const COLOR_CHANGE_COMMAND = "/color "

export default function MessageInput({showCommandError, socket}) {

    const [inputFieldValue, setInputFieldValue] = useState('')
    const [currentMessage, setCurrentMessage] = useState('')

    const clearInputs = () => {
        setInputFieldValue('')
        setCurrentMessage('')
    }

    const handleChange = (e) => {
        setCurrentMessage(e.target.value)
        setInputFieldValue(e.target.value)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        clearInputs()

        if (currentMessage === '') {
            return
        }
        if (currentMessage.startsWith('/')) {
            if (currentMessage.startsWith(USERNAME_CHANGE_COMMAND)) {
                const newUsername = currentMessage.split(USERNAME_CHANGE_COMMAND)[1]
                socket.emit('change username', newUsername)
            } else if (currentMessage.startsWith(COLOR_CHANGE_COMMAND)) {
                const color = currentMessage.split(COLOR_CHANGE_COMMAND)[1]
                socket.emit('change color', color)
            } else {
                showCommandError(currentMessage.split(/[ ]/)[0])
            }
        } else {
            sendMessage()
        }
    }

    const sendMessage = () => {
        socket.emit('chat message', {msg: currentMessage})
    }

    return (
        <form className={"form"} onSubmit={handleSubmit}>
            <input type={"text"} className={"input"} placeholder={"Type in a message..."} onChange={handleChange} value={inputFieldValue}/>
        </form>
    )
}
