const socket = io();

//Elements
const $form = document.querySelector('#message-form');
const $formInput = $form.querySelector('input');
const $formButton = $form.querySelector('input[type="submit"]');
const $locationButton = document.querySelector('#location');
const $messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML;

//options
const {username, room} = Qs.parse(location.search,{
    ignoreQueryPrefix:true
})

const autoscroll = () =>{
// New message element
const $newMessage = $messages.lastElementChild

// Height of the new message
const newMessageStyles = getComputedStyle($newMessage)
const newMessageMargin = parseInt(newMessageStyles.marginBottom)
const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

//visible height
const visibleHeight = $messages.offsetHeight;

// Height of message Container
const containerHeight = $messages.scrollHeight;


//How far have i scrolled?
const scrollOffset = $messages.scrollTop + visibleHeight ;

if(containerHeight - newMessageHeight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight;
}

}


socket.on('message',(text)=>{
    const html = Mustache.render(messageTemplate,{
        username:text.username,
        text:text.msg,
        createdAt:moment(text.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on('locationMessage',(text)=>{
    console.log('loc'+text.username)
    const html = Mustache.render(locMessageTemplate,{
        username:text.username,
        text :text.url,
        createdAt:moment(text.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML('beforeend',html);
    //autoscroll();
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sideBarTemplate,{
        room,
        users
    });
    document.querySelector('#side-bar').innerHTML = html;
   
})


$form
.addEventListener('submit',(e)=>{
    const messageValue = e.target.elements.message.value;
    $formButton.disabled = true;

    socket.emit('sendMessage',messageValue,(error)=>{
        if(error){
            console.log(error);
        }
        console.log('Delivered')
        $formButton.disabled = false;
        $formInput.value = '';
        $formInput.focus();
    });
    e.preventDefault();
})


$locationButton
.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation not supported!')
    }

    $locationButton.disabled = true;
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('share-location',{
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        },(message)=>{
            $locationButton.disabled =false;
            console.log(message)
           
        })
    })
    
})

socket.emit('join',{ username, room },(error)=>{
    if(error){
        alert(error);
        location.href = '/';

    }
})