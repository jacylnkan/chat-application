import React from 'react'
import "../styles/ChatList.css"
import Message from "./Message";

export default function ChatList({listItems, onlineUsers, type, user}) {

    return (
        <div className={"chatList " + type + "Box"} id={type}>
            <div className={"scrollContainer"}>
                {
                    typeof(listItems) !== typeof(2) && listItems.length > 0 && listItems.map(item => {
                        return <Message item={item} onlineUsers={onlineUsers} user={user}/>
                    })
                }
            </div>
        </div>
    )
}
