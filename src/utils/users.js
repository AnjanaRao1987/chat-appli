const users = [];

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room}) =>{

        // clean user provided data
        username = username.trim().toLowerCase();
        room = room.trim().toLowerCase();
        if(!username || !room){
            return {
                error:'Please provide User name and Room'
            }
        }

        //check if that username already taken in a room
        const existingUser = users.find((ele)=>{
           return ele.username === username && ele.room === room
        })

        //Validate user name
        if(existingUser){
            return {
                error:'Username already taken in this room'
            }
        }

        // store user
        const user = {id,username,room};
        users.push(user);
        return {user};
}

const removeUser = (id) =>{
    const index = users.findIndex((user)=>user.id === id)

    if(index !== -1){
        return users.splice(index,1)[0]
    }
    
}

const getUser = (id) =>{
    return users.find((user)=>user.id === id)
}

const getUsersInRoom = (room) =>{
    return users.filter((user)=>user.room === room)
}

module.exports = {addUser, removeUser, getUser, getUsersInRoom};
