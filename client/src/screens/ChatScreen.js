import React, {useEffect, useState} from 'react'
import "../styles/ChatScreen.css"
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import io from "socket.io-client"
import Header from "../components/Header";
import ChatContainer from "../components/ChatContainer";
import MessageInput from "../components/MessageInput";

// const ENDPOINT = "136.159.5.25:5000/"
const ENDPOINT = "http://localhost:5000/"

const socket = io(ENDPOINT)

export default function ChatScreen() {

    const [user, setUser] = useState()
    const [onlineUsers, setOnlineUsers] = useState([])
    const [messages, setMessages] = useState([])

    const getCookieValue = (cookieName) => {
        const name = cookieName + "="
        const allCookies = document.cookie.split(';')
        for (let i=0; i < allCookies.length; i++) {
            const cookie = allCookies[i].trim()
            if (cookie.startsWith(name)) {
                return cookie.split("=")[1]
            }
        }
        return ""
    }

    const setCookie = (cookieName, cookieValue) => {
        document.cookie = cookieName + "=" + cookieValue + ";"
    }

    const showCommandError = (command) => {
        showErrorMessage(`Sorry, ${command} is not a valid command. Please try again.`, "Command Error")
    }

    const showErrorMessage = (message, title) => {
        NotificationManager.error(message, title, 5000)
    }

    const showInfoMessage = (message, title) => {
        NotificationManager.info(message, title, 5000)
    }

    const showSuccessMessage = (message, title) => {
        NotificationManager.success(message, title, 5000)
    }

    useEffect(() => {
        if (socket) {
            socket.on("invalid color", (newColor) => {
                newColor = newColor.split('#')[1]
                const message = `${newColor} is not a valid color code.`
                const title = "Error: Invalid Color Code"
                showErrorMessage(message, title)
            })

            socket.on("new user", ({user, itemChanged}) => {
                setUser(user)
                if (itemChanged === "new") {

                    showInfoMessage(`Welcome to the chat, ${user.username}.`, "Hi there!", 5000)
                    setCookie("username", user.username)
                    setCookie("color", user.color)

                } else if (itemChanged === "existing username") {

                    showInfoMessage(`Welcome to the chat, ${user.username}.`, "Hi there!", 5000)
                    setCookie("username", user.username)
                    setCookie("color", user.color)

                } else if (itemChanged === "existing") {

                    showInfoMessage(`Hello again, ${user.username}.`, "Welcome back!")

                } else {

                    showSuccessMessage(itemChanged + " successfully changed.", "Success!", 5000)

                    if (itemChanged === "Color") {
                        setCookie("color", user.color)
                    } else {
                        setCookie("username", user.username)
                    }
                }
            })

            socket.on("updated messages", (messages) => {
                setMessages(messages)
                const chat = document.getElementById("chat")
                chat.scrollTop = chat.scrollHeight
            })

            socket.on("updated users", (users) => {
                setOnlineUsers(users)
            })

            socket.on("user connected", () => {
                const username = getCookieValue("username")
                if (username !== "") {
                    const color = getCookieValue("color")
                    socket.emit("existing user", {username: username, color: color})
                } else {
                    socket.emit("new user")
                }
            })

            socket.on("username taken", (newUsername) => {
                const message = `${newUsername} has already been taken. Please pick a different username.`
                const title = "Error: Username Taken"
                showErrorMessage(message, title)
            })
        }
    }, [])

    return (
        <div className={"container"}>
            <Header text={"C H A T R O O M"} type={"main"}/>
            <div className={"mainContainer"}>
                <ChatContainer header={true} listItems={onlineUsers} onlineUsers={onlineUsers} type={"online"} user={user}>
                    <Header text={"Online"} type={"sub"}/>
                </ChatContainer>
                <ChatContainer listItems={messages} onlineUsers={onlineUsers} type={"chat"} user={user}>
                    <MessageInput showCommandError={showCommandError} socket={socket}/>
                </ChatContainer>
            </div>
            <NotificationContainer/>
        </div>
    )
}
