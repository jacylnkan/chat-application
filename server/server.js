var app = require('express')()
var http = require('http').createServer(app)
var io = require('socket.io')(http)
var rug = require('random-username-generator');

const PORT = 5000
const MAX_LENGTH = 200

let users = []
let messages = []

const changeMessageColors = (id, newColor) => {
    for (let i=0; i < messages.length; i++) {
        if (messages[i].socketId === id) {
            messages[i].color = newColor
        }
    }
}

const changeMessageUsernames = (id, newUsername) => {
    for (let i=0; i < messages.length; i++) {
        if (messages[i].socketId === id) {
            messages[i].username = newUsername
        }
    }
}

const generateUsername = () => {
    rug.setSeperator('')
    return rug.generate().toLowerCase()
}

const getColorCode = (color) => {
    return "#" + color
}

const getUserInfo = (id) => {
    let user = users.filter((u) => {
        return u.socketId === id
    })
    return user[0]
}

const getTime = () => {
    let d = new Date()
    let hour = stringifyHour(d.getUTCHours())
    let minute = stringifyTime(d.getUTCMinutes())
    return hour + ":" + minute
}

const pushMessage = (array, newItem) => {
    array = [...array.slice(0,MAX_LENGTH+1), newItem]
    return array
}

const pushConnectedUser = (color, itemChanged, socket, username) => {
    let user = {type:"users", username: username, color: color, socketId: socket.id}
    users.push(user)

    socket.emit('new user', {user: user, itemChanged: itemChanged})

    // give all clients updated online users and messages
    io.emit('updated users', users)
    io.emit('updated messages', messages)
}

const removeUser = (id) => {
    users = users.filter((user) => {
        return user.socketId !== id
    })
}

const stringifyHour = (hour) => {
    if (hour < 6) {
        hour = hour + 24
    }
    hour = hour - 7
    return stringifyTime(hour)
}

const stringifyTime = (time) => {
    if (time < 10) {
        return "0" + time.toString()
    }
    return time.toString()
}

const usernameUnique = (proposedUsername) => {
    const sameUsernames = users.filter(u => {
        return u.username === proposedUsername
    })
    return sameUsernames.length <= 0;
}

const validColorCode = (colorCode) => {
    colorCode = colorCode.toUpperCase()
    if (colorCode === "#43464f" || colorCode === "#33363b") return false
    return /^#[0-9A-F]{6}$/i.test(colorCode)
}

io.on('connection', (socket) => {
    console.log('a user connected!')

    socket.emit("user connected")

    // on new chat message, push new message to messages array and emit to all clients
    socket.on('chat message', ({msg}) => {
        const timestamp = getTime()

        if (messages.length >= 1) {
            const prevTimestamp = messages[messages.length-1].timestamp
            const prevSocketId = messages[messages.length-1].socketId

            if (socket.id === prevSocketId && timestamp === prevTimestamp) {
                messages[messages.length-1].msg = messages[messages.length-1].msg + "\n" + msg
                io.emit('updated messages', messages)
                return true
            }
        }

        let user = getUserInfo(socket.id)
        let newMessage = {type: "message", username: user.username, timestamp: timestamp, msg: msg, color: user.color, socketId: socket.id}
        messages = pushMessage(messages, newMessage)
        io.emit('updated messages', messages)
    })

    socket.on('change color', (color) => {
        const newColor = getColorCode(color)
        if (!validColorCode(newColor)) {
            socket.emit('invalid color', newColor)
            return false
        }
        let oldUser = getUserInfo(socket.id)
        removeUser(socket.id)
        changeMessageColors(socket.id, newColor)

        pushConnectedUser(newColor, "Color", socket, oldUser.username)
    })

    socket.on('change username', (newUsername) => {
        if (!usernameUnique(newUsername)) {
            socket.emit('username taken', newUsername)
            return false
        }
        let oldUser = getUserInfo(socket.id)
        let changedUser = {type: "users", username: newUsername, color: oldUser.color, socketId: socket.id}
        removeUser(socket.id)
        users.push(changedUser)
        changeMessageUsernames(socket.id, newUsername)

        socket.emit('new user', {user: changedUser, itemChanged: "Name"})

        io.emit('updated users', users)
        io.emit('updated messages', messages)
    })

    // on disconnect, remove user associated with this socket
    socket.on('disconnect', () => {
        console.log('user disconnected!')
        removeUser(socket.id)
        socket.broadcast.emit('updated users', users)
    })

    socket.on('existing user', ({username, color}) => {
        let itemChanged = "existing"
        if (!usernameUnique(username)) {
            username = generateUsername()
            itemChanged = "existing username"
            color = "black"
        }
        pushConnectedUser(color, itemChanged, socket, username)
    })

    socket.on('new user', () => {
        const username = generateUsername()
        const color = "white"
        pushConnectedUser(color, "new", socket, username)
    })
})

http.listen(PORT, () => {
    console.log('listening on ' + PORT);
});
