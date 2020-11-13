import React from 'react'
import "../styles/ChatContainer.css"
import ChatList from "./ChatList";

export default function ChatContainer({children, header, listItems, onlineUsers, type, user}) {
    return (
        <div className={"chatContainer " + type}>
            {header && children}
            <ChatList listItems={listItems} onlineUsers={onlineUsers} type={type} user={user}/>
            {!header && children}
        </div>
    )
}
