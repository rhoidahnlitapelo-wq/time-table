// Change this value if the backend is deployed to a public URL.
const API_URL = "http://localhost:3000/api/timetable";

const form = document.querySelector("#timetable-form");
const recordsBody = document.querySelector("#records-body");
const statusMessage = document.querySelector("#status");
const formTitle = document.querySelector("#form-title");
const saveButton = document.querySelector("#save-button");
const cancelButton = document.querySelector("#cancel-button");
const refreshButton = document.querySelector("#refresh-button");

let editingId = null;

function showStatus(message, type = "success") {
  statusMessage.textContent = message;
  statusMessage.className = type;
}

function getFormData() {
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries());
}

function resetForm() {
  editingId = null;
  form.reset();
  formTitle.textContent = "Add a timetable record";
  saveButton.textContent = "Add record";
  cancelButton.hidden = true;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "The request failed.");
  }
  return data;
}

async function loadRecords() {
  recordsBody.replaceChildren();
  const loadingRow = document.createElement("tr");
  const loadingCell = document.createElement("td");
  loadingCell.colSpan = 6;
  loadingCell.textContent = "Loading records…";
  loadingRow.append(loadingCell);
  recordsBody.append(loadingRow);

  try {
    const records = await requestJson(API_URL);
    recordsBody.replaceChildren();

    if (records.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 6;
      cell.textContent = "No records yet. Use the form above to add one.";
      row.append(cell);
      recordsBody.append(row);
      return;
    }

    for (const record of records) {
      const row = document.createElement("tr");
      const values = [
        record.id,
        `${record.course_code} — ${record.course_name}`,
        record.day_of_week,
        `${record.start_time}–${record.end_time}`,
        record.goal
      ];

      for (const value of values) {
        const cell = document.createElement("td");
        // textContent prevents user-entered text from being interpreted as HTML.
        cell.textContent = value;
        row.append(cell);
      }

      const actionsCell = document.createElement("td");
      const editButton = document.createElement("button");
      editButton.className = "small secondary";
      editButton.textContent = "Edit";
      editButton.type = "button";
      editButton.addEventListener("click", () => startEditing(record));

      const deleteButton = document.createElement("button");
      deleteButton.className = "small danger";
      deleteButton.textContent = "Delete";
      deleteButton.type = "button";
      deleteButton.addEventListener("click", () => deleteRecord(record.id));

      actionsCell.append(editButton, deleteButton);
      row.append(actionsCell);
      recordsBody.append(row);
    }
  } catch (error) {
    recordsBody.replaceChildren();
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.textContent = "Could not load records. Check that the backend is running.";
    row.append(cell);
    recordsBody.append(row);
    showStatus(error.message, "error");
  }
}

function startEditing(record) {
  editingId = record.id;
  for (const field of [
    "course_code", "course_name", "day_of_week",
    "start_time", "end_time", "goal"
  ]) {
    form.elements[field].value = record[field];
  }
  formTitle.textContent = `Edit record #${record.id}`;
  saveButton.textContent = "Save changes";
  cancelButton.hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteRecord(id) {
  if (!window.confirm(`Delete timetable record #${id}? This cannot be undone.`)) {
    return;
  }

  try {
    const result = await requestJson(`${API_URL}/${id}`, { method: "DELETE" });
    if (editingId === id) resetForm();
    showStatus(result.message);
    await loadRecords();
  } catch (error) {
    showStatus(error.message, "error");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = getFormData();
  if (data.start_time >= data.end_time) {
    showStatus("End time must be later than start time.", "error");
    return;
  }

  try {
    if (editingId === null) {
      const result = await requestJson(API_URL, {
        method: "POST",
        body: JSON.stringify(data)
      });
      showStatus(result.message);
    } else {
      const result = await requestJson(`${API_URL}/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
      showStatus(result.message);
    }

    resetForm();
    await loadRecords();
  } catch (error) {
    showStatus(error.message, "error");
  }
});

cancelButton.addEventListener("click", resetForm);
refreshButton.addEventListener("click", loadRecords);

// Load saved records when the page opens.
loadRecords();
