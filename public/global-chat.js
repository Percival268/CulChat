document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const formJoin = document.querySelector('.form-join');
    const formMessage = document.querySelector('.form-message');
    const chatDisplay = document.querySelector('.chat-display');
    const userList = document.querySelector('.user-list');
    const activity = document.querySelector('.activity');
    const userCount = document.querySelector('.user-count');
    const chatInterface = document.querySelector('.chat-interface');

    // Socket.io connection
    const socket = io();

    // Join room form submission
    formJoin.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('name');
        const name = nameInput.value.trim();
        const room = "Global Community"; // Fixed room name
        
        if (name) {
            // Show chat interface
            formJoin.style.display = 'none';
            chatInterface.style.display = 'block';
            
            // Join the room
            socket.emit('joinRoom', { name, room });
            
            // Add welcome message
            const welcomeMsg = {
                name: 'CulChat Bot',
                text: `Welcome to the Global Community, ${name}! Start chatting with food lovers worldwide.`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            displayMessage(welcomeMsg);
        }
    });

    // Message form submission
    formMessage.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const messageInput = document.getElementById('message');
        const message = messageInput.value.trim();
        
        if (message) {
            socket.emit('chatMessage', message);
            messageInput.value = '';
            messageInput.focus();
        }
    });

    // Typing indicator
    const messageInput = document.getElementById('message');
    messageInput.addEventListener('keypress', function() {
        socket.emit('activity', socket.name);
    });

    // Socket.io listeners
    socket.on('message', (data) => {
        displayMessage(data);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
        activity.textContent = '';
    });

    socket.on('activity', (name) => {
        activity.textContent = `${name} is typing...`;
        setTimeout(() => {
            activity.textContent = '';
        }, 3000);
    });

    socket.on('userList', ({ users }) => {
        displayUsers(users);
        userCount.textContent = `${users.length} ${users.length === 1 ? 'chef' : 'chefs'} cooking here`;
    });

    // Add connection status indicators
socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('connect_error', (err) => {
    console.error('Connection error:', err);
});

// Modify your message display function to be more robust
function displayMessage(data) {
    try {
        const li = document.createElement('li');
        li.classList.add('message');
        
        const time = data.time || new Date().toLocaleTimeString();
        const name = data.name || 'Anonymous';
        const text = data.text || '';
        
        li.innerHTML = `
            <div class="message-info">
                <span class="message-sender">${name}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-text">${text}</div>
        `;
        
        const chatDisplay = document.querySelector('.chat-display');
        if (chatDisplay) {
            chatDisplay.appendChild(li);
            chatDisplay.scrollTop = chatDisplay.scrollHeight;
        } else {
            console.error('Chat display element not found');
        }
    } catch (err) {
        console.error('Error displaying message:', err);
    }
}

    function displayUsers(users) {
        userList.innerHTML = `
            <h4>Culinary Companions:</h4>
            <ul>
                ${users.map(user => `<li>👨‍🍳 ${user.name}</li>`).join('')}
            </ul>
        `;
    }
});