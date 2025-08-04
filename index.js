let draggingCard = null;
let offsetX = 0;
let offsetY = 0;
const placeholder = document.createElement("div");
placeholder.classList.add("placeholder");

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".card").forEach((card) => {
    makeCardDraggable(card);
    makeCardEditable(card);
  });
});

function addNewTask() {
  const input = document.getElementById("new-task-input");
  const text = input.value.trim();
  if (!text) return;

  const newCard = document.createElement("div");
  newCard.className = "card";
  newCard.textContent = text;
  newCard.setAttribute("draggable", "false");

  makeCardDraggable(newCard);
  setupCardEvents(newCard);

  const todoColumn = document.querySelectorAll(".column")[0]; // first column = TODO
  todoColumn.appendChild(newCard);

  input.value = "";
}

function makeCardDraggable(card) {
  let clickTimer = null;

  card.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return; // ✅ Only allow left click to drag

    // Prevent drag if double-click
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      return;
    }

    clickTimer = setTimeout(() => {
      clickTimer = null;

      draggingCard = card;

      const rect = card.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      card.classList.add("dragging");
      card.style.width = `${rect.width}px`;
      card.style.height = `${rect.height}px`;
      document.body.appendChild(card);

      moveAt(e.pageX, e.pageY);

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }, 200); // delay just enough to let dblclick cancel it
  });

  card.addEventListener("dragstart", (e) => e.preventDefault());
}

function moveAt(pageX, pageY) {
  draggingCard.style.left = pageX - offsetX + "px";
  draggingCard.style.top = pageY - offsetY + "px";
}

function onMouseMove(e) {
  moveAt(e.pageX, e.pageY);

  const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
  if (!elemBelow) return;

  const column = elemBelow.closest("[data-column]");
  if (!column) return;

  const cards = [...column.querySelectorAll(".card")];
  let inserted = false;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const rect = card.getBoundingClientRect();
    if (e.clientY < rect.top + rect.height / 2) {
      if (placeholder.parentNode !== column) column.appendChild(placeholder);
      column.insertBefore(placeholder, card);
      inserted = true;
      break;
    }
  }

  if (!inserted) {
    if (placeholder.parentNode !== column) column.appendChild(placeholder);
    column.appendChild(placeholder);
  }
}
function onMouseUp() {
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);

  if (!draggingCard) return;

  draggingCard.classList.remove("dragging");
  draggingCard.style = "";

  if (placeholder.parentNode) {
    placeholder.parentNode.insertBefore(draggingCard, placeholder);
    placeholder.remove();
  } else {
    draggingCard.remove();
  }

  draggingCard = null;
}

/// Create custom context menu with two options
const customMenu = document.createElement("div");
customMenu.classList.add("custom-context-menu");
// customMenu.style.position = "absolute";
// customMenu.style.background = "#fff";
// customMenu.style.border = "1px solid #ccc";
// customMenu.style.padding = "4px 0";
// customMenu.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
// customMenu.style.display = "none";
// customMenu.style.zIndex = 1000;
// customMenu.style.minWidth = "120px";
// customMenu.style.fontFamily = "Arial, sans-serif";

// Create Edit option
const editOption = document.createElement("div");
editOption.textContent = "Edit Task";
editOption.style.padding = "8px 12px";
editOption.style.cursor = "pointer";
editOption.style.borderBottom = "1px solid #ddd";
editOption.addEventListener(
  "mouseenter",
  () => (editOption.style.backgroundColor = "#eee")
);
editOption.addEventListener(
  "mouseleave",
  () => (editOption.style.backgroundColor = "")
);

// Create Delete option
const deleteOption = document.createElement("div");
deleteOption.textContent = "Delete Task";
deleteOption.style.padding = "8px 12px";
deleteOption.style.cursor = "pointer";
deleteOption.addEventListener(
  "mouseenter",
  () => (deleteOption.style.backgroundColor = "#eee")
);
deleteOption.addEventListener(
  "mouseleave",
  () => (deleteOption.style.backgroundColor = "")
);

// Append options to menu
customMenu.appendChild(editOption);
customMenu.appendChild(deleteOption);
document.body.appendChild(customMenu);

let currentCard = null;

// Hide menu on click anywhere else
document.addEventListener("click", () => {
  customMenu.style.display = "none";
  currentCard = null;
});

function setupCardEvents(card) {
  // Remove double-click editing - no longer needed
  // card.addEventListener('dblclick', ...)

  card.addEventListener("contextmenu", (e) => {
    e.preventDefault();

    currentCard = card;

    customMenu.style.top = `${e.pageY}px`;
    customMenu.style.left = `${e.pageX}px`;
    customMenu.style.display = "block";
  });
}

// Edit option handler
editOption.addEventListener("click", () => {
  if (!currentCard) return;

  const input = document.getElementById("new-task-input");
  input.value = currentCard.textContent.trim();
  currentCard.remove();

  customMenu.style.display = "none";
  currentCard = null;
});

// Delete option handler
deleteOption.addEventListener("click", () => {
  if (!currentCard) return;

  currentCard.remove();

  customMenu.style.display = "none";
  currentCard = null;
});

const toggleBtn = document.getElementById("theme-toggle");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  toggleBtn.textContent = document.body.classList.contains("dark-theme")
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";
});
