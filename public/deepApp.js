document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const formJoin = document.querySelector('.form-join');
    const formMessage = document.querySelector('.form-message');
    const chatDisplay = document.querySelector('.chat-display');
    const userList = document.querySelector('.user-list');
    const roomList = document.querySelector('.room-list');
    const activity = document.querySelector('.activity');
    const currentRoom = document.getElementById('current-room');
    const userCount = document.querySelector('.user-count');
    const roomSelect = document.getElementById('room');
    const customRoomInput = document.getElementById('custom-room');
    const roomSelection = document.querySelector('.room-selection');
    const chatInterface = document.querySelector('.chat-interface');

    // Socket.io connection
    const socket = io();


    // Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.getElementById('menu-icon');
    const navList = document.querySelector('.nav_list');
    
    menuIcon.addEventListener('click', function() {
        navList.classList.toggle('active');
        menuIcon.classList.toggle('bx-x');
    });
    
    // Close menu when clicking on links
    document.querySelectorAll('.nav_list a').forEach(link => {
        link.addEventListener('click', () => {
            navList.classList.remove('active');
            menuIcon.classList.remove('bx-x');
        });
    });
    
    // Window resize handler
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navList.classList.remove('active');
            menuIcon.classList.remove('bx-x');
        }
    });
    
    // Rest of your existing JavaScript...
});
    // Room selection change handler
    roomSelect.addEventListener('change', function(e) {
        if (e.target.value === 'custom') {
            customRoomInput.style.display = 'block';
            customRoomInput.setAttribute('required', '');
        } else {
            customRoomInput.style.display = 'none';
            customRoomInput.removeAttribute('required');
        }
    });

    // Join room form submission
    formJoin.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('name');
        const name = nameInput.value.trim();
        let room;
        
        if (roomSelect.value === 'custom') {
            room = customRoomInput.value.trim().toLowerCase();
        } else {
            room = roomSelect.value.trim().toLowerCase();
        }
        
        if (name && room) {
            // Show chat interface
            roomSelection.style.display = 'none';
            chatInterface.style.display = 'block';
            
            // Join the room
            socket.emit('joinRoom', { name, room });
            
            // Update UI
            currentRoom.textContent = roomSelect.options[roomSelect.selectedIndex].text;
            
            // Add welcome message
            const welcomeMsg = {
                name: 'CulChat Bot',
                text: `Welcome to the ${roomSelect.options[roomSelect.selectedIndex].text}, ${name}! Start chatting about your culinary adventures.`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            displayMessage(welcomeMsg);
            
            // Add cooking tip
            setTimeout(() => {
                const tipMsg = {
                    name: 'CulChat Bot',
                    text: getRandomCookingTip(),
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                displayMessage(tipMsg);
            }, 3000);
        }
    });

    // Message form submission
    formMessage.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const messageInput = document.getElementById('message');
        const message = messageInput.value.trim();
        
        if (message) {
            // Emit message to server
            socket.emit('chatMessage', message);
            
            // Clear input
            messageInput.value = '';
            messageInput.focus();
        }
    });

    // Typing indicator
    const messageInput = document.getElementById('message');
    messageInput.addEventListener('keypress', function() {
        socket.emit('activity', socket.name);
    });

    // Listen for messages from server
    socket.on('message', (data) => {
        displayMessage(data);
        // Scroll to bottom of chat
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
        activity.textContent = '';
    });

    // Listen for activity from server
    socket.on('activity', (name) => {
        activity.textContent = `${name} is typing...`;
        
        // Clear after 3 seconds
        setTimeout(() => {
            activity.textContent = '';
        }, 3000);
    });

    // Listen for user list updates
    socket.on('userList', ({ users, room }) => {
        displayUsers(users);
        userCount.textContent = `${users.length} ${users.length === 1 ? 'chef' : 'chefs'} cooking here`;
    });

    // Display message in chat
    function displayMessage(data) {
        const li = document.createElement('li');
        li.classList.add('message');
        
        // Special styling for bot messages
        if (data.name === 'CulChat Bot') {
            li.classList.add('bot-message');
            li.innerHTML = `
                <div class="message-info">
                    <span class="message-sender">${data.name}</span>
                    <span class="message-time">${data.time}</span>
                </div>
                <div class="message-text bot-text">${data.text}</div>
            `;
        } else {
            li.innerHTML = `
                <div class="message-info">
                    <span class="message-sender">${data.name}</span>
                    <span class="message-time">${data.time}</span>
                </div>
                <div class="message-text">${data.text}</div>
            `;
        }
        
        chatDisplay.appendChild(li);
    }

    // Display users in room
    function displayUsers(users) {
        userList.innerHTML = `
            <h4>Culinary Companions:</h4>
            <ul>
                ${users.map(user => `<li>👨‍🍳 ${user.name}</li>`).join('')}
            </ul>
        `;
    }

    // Random cooking tips for bot messages
    function getRandomCookingTip() {
        const tips = [
            "Tip: Always taste your food while cooking to adjust seasoning as needed.",
            "Did you know? Letting meat rest after cooking allows juices to redistribute.",
            "Pro tip: Use a microplane for finely grated garlic, ginger, or citrus zest.",
            "Kitchen hack: Place a damp paper towel under your cutting board to prevent slipping.",
            "Remember: Sharp knives are safer than dull ones - they require less force.",
            "Baking tip: Bring ingredients to room temperature for more even mixing.",
            "Secret: Add a pinch of salt to sweet dishes to enhance their flavor.",
            "Technique: 'Mise en place' (having everything in place) makes cooking smoother.",
            "Healthy tip: Steam vegetables instead of boiling to retain more nutrients.",
            "Flavor boost: Toast spices before using to intensify their aroma."
        ];
        return tips[Math.floor(Math.random() * tips.length)];
    }
});

// Add to deepApp.js
document.getElementById('menu-icon').addEventListener('click', function() {
    document.querySelector('.nav_list').classList.toggle('active');
});

// Initialize Swiper when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const swiper = new Swiper('.mySwiper', {
        loop: true,
        autoplay: {
            delay: 6000,
            disableOnInteraction: false,
        },
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        speed: 1000,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
});