import React from 'react'
import "../styles/Message.css"

export default function Message({item, user}) {

    const emojiMap = {
        ":)": "1F642", ":(": "1F641", ":o": "1F62E", ":D": "1F600", "<3": "2764", ":aubergine:": "1F346", ":peach:": "1F351"
    }

    const convertEmojis = (text) => {
        let re = new RegExp(/(:[o)(D]|<3|:([a-zA-Z]+):)/, 'g')
        let match
        while (match = re.exec(text)) {
            const code = emojiMap[match[1]]
            if (code) {
                let emojiString = String.fromCodePoint(parseInt(code, 16))
                text = text.replace(match[1], emojiString)
            }
        }
        return text
    }

    const getTextStyle = () => {
        let textStyle = ""
        if (item && user) {
            if (item.socketId === user.socketId || item.username === user.username) {
                textStyle = " bold"
            }
        }
        return textStyle
    }

    const getSpacing = () => {
        return " " + item.type + "Spacing"
    }

    const getYouText = () => {
        if (item.username === user.username && item.type === "users") {
            return " (You)"
        }
        return ""
    }

    return (
        <div className={"entireMessage" + getSpacing()}>
            <div className={"msgInfo"}>
                <p className={"name" + getTextStyle()} style={{color: item.color}}>{item.username + getYouText()}</p>
                {item.type === "message" && <p className={"timestamp text"}>at {item.timestamp}</p>}
            </div>
            {item.type === "message" && <p className={"text"} id={"messageItem"}>{convertEmojis(item.msg)}</p>}
        </div>
    )
}
