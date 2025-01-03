const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

// Register 
document.getElementById('registerLink')?.addEventListener('click', () => {
    const registerForm = `
    <h1>Register</h1>
    <form id="registerForm">
        <input type="text" id="username" placerholder="Username" required>
        <input type="password" id="password" placeholder="Password" required>
        <button type="submit">Register</button>
        </form>
        <p>Already have an account? <a href="#" id="loginLink">Login</a></p>`;
        document.querySelector('.container').innerHTML = registerForm;
});

document.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (e.target.id === 'loginForm') {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        console.log('Logging in with:', { username, password });
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            window.location.href = 'todos.html';
        } else {
            alert('Invalid credentials');
        }
    } else if (e.target.id === 'registerForm') {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (response.status === 201) {
            alert('Registration successful! Please Login.');
            window.location.reload();
        } else {
            alert('Error registering user');
        }
    }
})

// Login 
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }), 
    });
    const data = await response.json();
    if (data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = 'todos.html';
    } else {
        alert('Invalid credentials');
    }
});

// Fetch To-Dos
const token = localStorage.getItem('token');
if (token) {
    fetch('http://localhost:3000/public/todos.html', {
        headers: {'Authorization': `Bearer ${token}` },
    })
    .then(response => response.json())
    .then(data => {
        const todoList = document.getElementById('todoList');
        data.forEach(todo => {
            const li = document.createElement('li');
            li.textContent = todo.task;
            todoList.appendChild(li);  
        });
    })
    .catch(err => console.error('Error fetching to-dos', err));
} else {
    window.location.href = 'index.html'; // Redirect to login if no token
}

// Add To-Dos
document.getElementById('todoForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const task = document.getElementById('task').value;
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/todos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify({ task }),
    });
    if (response.status === 201) {
       const newTodo = await response.json(); // Assuming backend returns the new to-do
       const todoList = document.getElementById('todoList');
       const li = document.createElement('li');
       li.textContent = newTodo.task;
       todoList.appendChild(li);
       document.getElementById('task').value = ''; // Clear the input field
    } else {
        alert('Error adding to-do'); 
    }
});