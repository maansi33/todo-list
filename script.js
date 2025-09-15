// ---------------- ELEMENTS ----------------
const homePage = document.getElementById("home-page");
const startBtn = document.getElementById("start-btn");
const appContainer = document.querySelector(".todo-container");
const input = document.getElementById("todo-input");
const dueDateInput = document.getElementById("due-date");
const priorityInput = document.getElementById("priority");
const categoryInput = document.getElementById("category");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("categories-container");
const searchInput = document.getElementById("search-input");
const filterAll = document.getElementById("filter-all");
const filterActive = document.getElementById("filter-active");
const filterCompleted = document.getElementById("filter-completed");
const calendarBtn = document.getElementById("calendar-btn");
const calendarContainer = document.getElementById("calendar-container");
const darkModeToggle = document.getElementById("dark-mode-toggle");

// ---------------- HOME PAGE ----------------
startBtn.addEventListener("click", () => {
    homePage.classList.add("hidden");
    appContainer.classList.remove("hidden");
});

// ---------------- DARK MODE ----------------
darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});

// ---------------- TASKS ----------------
let tasks = [];
function saveTasks() { localStorage.setItem("tasks", JSON.stringify(tasks)); }
function loadTasks() { tasks = JSON.parse(localStorage.getItem("tasks")) || []; renderCategories(); updateDashboard(); }
function updateDashboard() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    document.getElementById("total-tasks").textContent = total;
    document.getElementById("completed-tasks").textContent = completed;
    document.getElementById("pending-tasks").textContent = pending;
}

// ---------------- CREATE TASK ----------------
function createTaskElement(task) {
    const li = document.createElement("li");
    li.dataset.category = task.category;
    li.className = task.completed ? "completed" : "";
    li.innerHTML = `
        <span class="text">${task.text}</span>
        <span class="priority-tag priority-${task.priority.toLowerCase()}">${task.priority}</span>
        <span class="due-date">${task.dueDate ? "Deadline: "+task.dueDate : ""}</span>
        <button>Delete</button>
    `;
    li.querySelector("span.text").addEventListener("click", () => {
        task.completed = !task.completed;
        li.classList.toggle("completed");
        saveTasks();
        updateDashboard();
    });
    li.querySelector("button").addEventListener("click", () => {
        tasks = tasks.filter(t => t !== task);
        saveTasks();
        renderCategories();
        updateDashboard();
    });
    return li;
}

// ---------------- CATEGORIES ----------------
function renderCategories() {
    const container = document.getElementById("categories-container");
    container.innerHTML = "";
    const categories = ["General","Work","School","Social","Travel","Groceries"];
    categories.forEach(cat => {
        const catDiv = document.createElement("div");
        catDiv.className = "category";
        catDiv.innerHTML = `<h2>${cat}</h2><ul></ul>`;
        const ul = catDiv.querySelector("ul");
        tasks.filter(t => t.category===cat).forEach(t => ul.appendChild(createTaskElement(t)));
        container.appendChild(catDiv);
    });
}

// ---------------- ADD TASK ----------------
addBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if(!text) return;
    const task = {
        text, dueDate: dueDateInput.value, priority: priorityInput.value,
        category: categoryInput.value, completed: false
    };
    tasks.push(task);
    saveTasks();
    renderCategories();
    updateDashboard();
    input.value=""; dueDateInput.value="";
});
searchInput.addEventListener("input", () => {
    renderCategories();
    const query = searchInput.value.toLowerCase();
    document.querySelectorAll(".category ul li").forEach(li => {
        li.style.display = li.querySelector(".text").textContent.toLowerCase().includes(query) ? "flex":"none";
    });
});

// ---------------- FILTERS ----------------
filterAll.addEventListener("click", () => document.querySelectorAll(".category ul li").forEach(li => li.style.display="flex"));
filterActive.addEventListener("click", () => document.querySelectorAll(".category ul li").forEach(li => li.style.display = li.classList.contains("completed") ? "none" : "flex"));
filterCompleted.addEventListener("click", () => document.querySelectorAll(".category ul li").forEach(li => li.style.display = li.classList.contains("completed") ? "flex" : "none"));

// ---------------- CALENDAR ----------------
const calendarModal = document.getElementById("calendar-modal");
const closeCalendarBtn = calendarModal.querySelector(".close-btn");

// Show calendar modal
calendarBtn.addEventListener("click", () => calendarModal.classList.add("active"));
// Close modal
closeCalendarBtn.addEventListener("click", () => calendarModal.classList.remove("active"));

// Calendar rendering
let currentDate = new Date();
const monthYear = document.getElementById("calendar-month-year");
const tbody = document.querySelector("#calendar-table tbody");
tasks.forEach(t => {
    let show = false;
    const taskDate = new Date(t.dueDate);
    const cellDate = new Date(date.getFullYear(), date.getMonth(), d);

    if(t.recurrence === "None") {
        show = t.dueDate === dateStr;
    } else if(t.recurrence === "Daily") {
        show = cellDate >= taskDate;
    } else if(t.recurrence === "Every 2 Days") {
        const diff = Math.floor((cellDate - taskDate) / (1000*60*60*24));
        show = diff >= 0 && diff % 2 === 0;
    } else if(t.recurrence === "Weekly") {
        const diff = Math.floor((cellDate - taskDate) / (1000*60*60*24));
        show = diff >= 0 && diff % 7 === 0;
    } else if(t.recurrence === "Monthly") {
        show = cellDate.getDate() === taskDate.getDate() && cellDate >= taskDate;
    }

    if(show) {
        const taskDiv = document.createElement("div");
        taskDiv.textContent = t.text;
        taskDiv.classList.add("task");
        taskDiv.classList.add(`priority-${t.priority.toLowerCase()}`);
        cell.appendChild(taskDiv);
    }
});

function renderCalendar(date){
    tbody.innerHTML = "";
    const year = date.getFullYear();
    const month = date.getMonth();
    monthYear.textContent = `${date.toLocaleString('default',{month:'long'})} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month+1,0).getDate();
    let row = document.createElement("tr");

    // empty cells before first day
    for(let i=0;i<firstDay;i++) row.appendChild(document.createElement("td"));

    for(let d=1; d<=daysInMonth; d++){
        if(row.children.length===7){ tbody.appendChild(row); row=document.createElement("tr"); }
        const cell = document.createElement("td");
        cell.textContent = d;

        // highlight today
        const today = new Date();
        if(d===today.getDate() && month===today.getMonth() && year===today.getFullYear()) cell.classList.add("today");

        // show tasks for this date
	const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
	tasks.filter(t => t.dueDate===dateStr).forEach(t => {
   	 const taskDiv = document.createElement("div");
   	 taskDiv.textContent = t.text;
   	 taskDiv.classList.add("task");

    	// add priority class
   	 taskDiv.classList.add(`priority-${t.priority.toLowerCase()}`);

   	 cell.appendChild(taskDiv);
	});


        row.appendChild(cell);
    }
    tbody.appendChild(row);
}

// Navigate months
document.getElementById("prev-month").addEventListener("click", ()=>{
    currentDate.setMonth(currentDate.getMonth()-1);
    renderCalendar(currentDate);
});
document.getElementById("next-month").addEventListener("click", ()=>{
    currentDate.setMonth(currentDate.getMonth()+1);
    renderCalendar(currentDate);
});

renderCalendar(currentDate);

// ---------------- INIT ----------------
loadTasks();
