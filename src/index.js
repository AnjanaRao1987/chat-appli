const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');

const { generateMessage,generateLocationMessage } = require('./utils/message');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirPath = path.join(__dirname,'../public');
app.use(express.static(publicDirPath))


io.on('connection',(socket)=>{


    socket.on('join',({username,room},callback)=>{
        console.log("join")
        console.log(username)
        console.log(room)
        const {user,error} = addUser({
            id: socket.id,
            username, room
        });
        console.log(user)
        socket.join(user.room);
        if(error){
            return callback(error)
        }
        

        //socket.emit, io.emit, socket.broadcast.emit
        //io.to.emit, soclet.broadcast.to.emit

        socket.emit('message',generateMessage('Admin',`Welcome!`));
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`));
        callback();
    })


    socket.on('sendMessage',(value,callback)=>{
        const filter = new Filter();
        const user = getUser(socket.id);
        if(filter.isProfane(value)){
            return callback('Profane');
        }
        io.to(user.room).emit('message',generateMessage(user.username,value));
        callback()
    })

    socket.on('disconnect',( )=>{
        const user = removeUser(socket.id);
        if (user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`));
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('share-location',(location,callback)=>{
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback('Location Shared')
    })


})



server.listen(port,()=>{
    console.log(`Application is up and running in port ${port} `)
})