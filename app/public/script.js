const form = document.getElementById("user-form");
const usersList = document.getElementById("users-list");
const formMessage = document.getElementById("form-message");
const refreshButton = document.getElementById("refresh-button");
const statusPill = document.getElementById("status-pill");
const profileCount = document.getElementById("profile-count");
const databaseLabel = document.getElementById("database-label");

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Recently added";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "Recently added";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function setMessage(text, type = "") {
  formMessage.textContent = text;
  formMessage.classList.remove("success", "error");

  if (type) {
    formMessage.classList.add(type);
  }
}

function renderUsers(users) {
  profileCount.textContent = String(users.length);

  if (!users.length) {
    usersList.innerHTML =
      '<p class="empty-state">No profiles saved yet. Create one to start building your user directory.</p>';
    return;
  }

  usersList.innerHTML = users
    .map((user) => {
      const ageText = user.age ? `${user.age} years old` : "Age not provided";
      const safeName = escapeHtml(user.name || "Unnamed User");
      const safeEmail = escapeHtml(user.email || "No email");
      const initials = safeName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("") || "UP";

      return `
        <article class="user-card">
          <span class="user-badge">${initials}</span>
          <h3>${safeName}</h3>
          <p class="user-meta">${safeEmail}</p>
          <p class="user-meta">${escapeHtml(ageText)}</p>
          <p class="user-time">Created ${formatDate(user.createdAt)}</p>
        </article>
      `;
    })
    .join("");
}

async function loadHealth() {
  try {
    const response = await fetch("/api/health");
    if (!response.ok) {
      throw new Error("Health check failed");
    }

    statusPill.textContent = "Connected";
    statusPill.classList.add("connected");
    statusPill.classList.remove("error");
    databaseLabel.textContent = "MongoDB Ready";
  } catch (error) {
    statusPill.textContent = "Unavailable";
    statusPill.classList.add("error");
    statusPill.classList.remove("connected");
    databaseLabel.textContent = "MongoDB Offline";
  }
}

async function loadUsers() {
  usersList.innerHTML = '<p class="empty-state">Loading profiles...</p>';

  try {
    const response = await fetch("/api/users");
    if (!response.ok) {
      throw new Error("Could not fetch users");
    }

    const users = await response.json();
    renderUsers(users);
  } catch (error) {
    profileCount.textContent = "0";
    usersList.innerHTML =
      '<p class="empty-state">Unable to load profiles. Check the server and database.</p>';
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("Saving profile...");

  const formData = new FormData(form);
  const payload = {
    name: formData.get("name"),
    email: formData.get("email"),
    age: formData.get("age")
  };

  try {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Unable to save profile");
    }

    form.reset();
    setMessage("Profile saved successfully.", "success");
    await loadUsers();
    await loadHealth();
  } catch (error) {
    setMessage(error.message, "error");
  }
});

refreshButton.addEventListener("click", async () => {
  await loadUsers();
  await loadHealth();
});

loadHealth();
loadUsers();
