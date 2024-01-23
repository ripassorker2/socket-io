require("dotenv").config();
const port = process.env.PORT || 7000;

const io = require("socket.io")(port, {
    cors: {
        origin: "http://localhost:3000",
    },
});

let users = [];

console.log(port);

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({userId, socketId});
};

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};
const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
    // when user connects

    socket.on("addUser", (userId) => {
        if (userId) {
            addUser(userId, socket.id);
            io.emit("getUsers", users);
        }
    });

    // get messages and send messages

    socket.on("sendMessage", ({senderId, reveiverId, message}) => {
        const user = getUser(reveiverId);
        if (user) {
            io.to(user.socketId).emit("getMessage", {
                senderId,
                message,
            });
        }
    });

    // when user disconnect
    socket.on("disconnect", () => {
        removeUser(socket.id);
        console.log("a user has been removed", socket.id);
        io.emit("getUsers", users);
    });
});
