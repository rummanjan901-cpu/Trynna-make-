/**
 * CORE DASHBOARD LOGIC
 * Integrates Auth, AI Services, and UI Interactions
 */

// --- 1. STATE MANAGEMENT ---
let currentQuiz = [];
let currentQuestionIndex = 0;
let todos = JSON.parse(localStorage.getItem('study_todos')) || [];

// --- 2. INITIALIZATION & AUTH ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    renderTodos();
});

function initApp() {
    // Firebase Auth Observer (using the logic from previous steps)
    observeAuthState((user) => {
        const emailDisplay = document.getElementById('userEmail');
        if (user) {
            if (emailDisplay) emailDisplay.innerText = user.email;
        } else {
            window.location.href = 'login.html'; // Redirect if session lost
        }
    });
}

async function handleLogout() {
    await logout();
    window.location.href = 'login.html';
}

// --- 3. SUMMARIZATION LOGIC ---
async function handleSummarize() {
    const textArea = document.getElementById('summaryText');
    const fileInput = document.querySelector('#summaryCard input[type="file"]');
    let textToProcess = textArea.value;

    showLoading(true);

    // Image handling
    if (fileInput.files.length > 0) {
        textToProcess = await extractTextFromImage(fileInput.files[0]);
    }

    if (!textToProcess) return alert("Please provide text or an image.");

    const summary = await summarizeText(textToProcess);
    showModal("Summary Result", summary, true); // true enables download button
    showLoading(false);
}

// PDF Download Simulation (Standard Text File Download)
function downloadAsPDF(content) {
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "summary.txt";
    document.body.appendChild(element);
    element.click();
}

// --- 4. QUIZ LOGIC ---
async function handleGenerateQuiz() {
    const text = document.getElementById('quizText').value;
    if (!text) return alert("Enter text for the quiz.");

    showLoading(true);
    currentQuiz = await generateQuiz(text);
    currentQuestionIndex = 0;
    showLoading(false);
    
    displayQuestion();
}

function displayQuestion() {
    const q = currentQuiz[currentQuestionIndex];
    let html = `
        <div class="space-y-4">
            <p class="font-bold text-lg">${q.question}</p>
            <div class="grid gap-2">
                ${q.options.map(opt => `
                    <button onclick="checkAnswer('${opt}', '${q.answer}')" 
                        class="quiz-opt w-full text-left p-3 border rounded-xl hover:bg-indigo-50 transition-colors">
                        ${opt}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    showModal(`Question ${currentQuestionIndex + 1}/3`, html);
}

function checkAnswer(selected, correct) {
    const buttons = document.querySelectorAll('.quiz-opt');
    buttons.forEach(btn => {
        if (btn.innerText === correct) btn.classList.add('bg-green-200', 'border-green-500');
        if (btn.innerText === selected && selected !== correct) btn.classList.add('bg-red-200', 'border-red-500');
        btn.disabled = true;
    });

    if (selected === correct) {
        setTimeout(nextQuestion, 1200); // Auto-next if correct
    } else {
        const footer = document.querySelector('#modal footer') || document.createElement('div');
        footer.innerHTML = `<button onclick="nextQuestion()" class="mt-4 w-full bg-indigo-600 text-white py-2 rounded-xl">Next Question</button>`;
        document.getElementById('modalBody').appendChild(footer);
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuiz.length) {
        displayQuestion();
    } else {
        showModal("Quiz Finished", "Great job! You've completed the assessment.");
    }
}

// --- 5. TO-DO LIST LOGIC ---
function addTodo() {
    const input = document.getElementById('todoInput');
    if (!input.value.trim()) return;

    const newTask = {
        id: Date.now(),
        text: input.value,
        done: false
    };

    todos.push(newTask);
    saveAndRender();
    input.value = '';
}

function toggleTodo(id) {
    todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('study_todos', JSON.stringify(todos));
    renderTodos();
}

function renderTodos() {
    const list = document.getElementById('todoList');
    list.innerHTML = todos.map(t => `
        <li class="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-white/50">
            <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTodo(${t.id})" class="w-4 h-4 accent-indigo-600">
            <span class="text-sm ${t.done ? 'line-through text-gray-400' : 'text-gray-700'}">${t.text}</span>
            <button onclick="deleteTodo(${t.id})" class="ml-auto text-gray-300 hover:text-red-500">✕</button>
        </li>
    `).join('');
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveAndRender();
}

// --- 6. CHAT & UI CONTROLS ---
async function handleChat() {
    const input = document.getElementById('chatInput');
    const msg = input.value;
    if (!msg) return;

    appendChatMessage('user', msg);
    input.value = '';

    const response = await getAIResponse(msg);
    appendChatMessage('ai', response);
}

function appendChatMessage(sender, text) {
    const body = document.getElementById('chatBody');
    const div = document.createElement('div');
    div.className = sender === 'ai' ? 'bubble ai' : 'bubble user';
    div.innerText = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function showModal(title, content, isDownloadable = false) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerHTML = content;
    
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';

    if (isDownloadable) {
        const btn = document.createElement('button');
        btn.className = "w-full mt-4 bg-blue-100 text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-200";
        btn.innerText = "📥 Download PDF";
        btn.onclick = () => downloadAsPDF(content);
        document.getElementById('modalBody').appendChild(btn);
    }
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function showLoading(state) {
    // Add a simple overlay or change button text
    const buttons = document.querySelectorAll('button');
    buttons.forEach(b => b.style.opacity = state ? '0.5' : '1');
    buttons.forEach(b => b.disabled = state);
}
