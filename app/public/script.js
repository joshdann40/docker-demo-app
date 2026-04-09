const form = document.getElementById("user-form");
const usersList = document.getElementById("users-list");
const formMessage = document.getElementById("form-message");
const refreshButton = document.getElementById("refresh-button");
const statusPill = document.getElementById("status-pill");

function renderUsers(users) {
  if (!users.length) {
    usersList.innerHTML =
      '<p class="empty-state">No profiles saved yet. Create one to get started.</p>';
    return;
  }

  usersList.innerHTML = users
    .map((user) => {
      const ageText = user.age ? `${user.age} years old` : "Age not provided";
      return `
        <article class="user-card">
          <h3>${user.name}</h3>
          <p>${user.email}</p>
          <p>${ageText}</p>
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
  } catch (error) {
    statusPill.textContent = "Unavailable";
    statusPill.classList.add("error");
    statusPill.classList.remove("connected");
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
    usersList.innerHTML =
      '<p class="empty-state">Unable to load profiles. Check the server and database.</p>';
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formMessage.textContent = "Saving profile...";

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
    formMessage.textContent = "Profile saved successfully.";
    await loadUsers();
    await loadHealth();
  } catch (error) {
    formMessage.textContent = error.message;
  }
});

refreshButton.addEventListener("click", async () => {
  await loadUsers();
  await loadHealth();
});

loadHealth();
loadUsers();
