// ReelMagic AI - Frontend Prototype

let pageHistory = ["home"];
let projects = JSON.parse(localStorage.getItem("rm_projects") || "[]");
let galleryItems = [];
let currentUser = localStorage.getItem("rm_demo_user") || "";
let toastTimer;

function showPage(pageId) {
  const target = document.getElementById(pageId);
  if (!target) return;

  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  target.classList.add("active");

  if (pageHistory[pageHistory.length - 1] !== pageId) {
    pageHistory.push(pageId);
  }

  document.getElementById("mainNav").classList.remove("open");

  if (pageId === "projects") renderProjects();
  if (pageId === "gallery") renderGallery();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goBack() {
  if (pageHistory.length > 1) pageHistory.pop();
  const previous = pageHistory[pageHistory.length - 1] || "home";

  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  document.getElementById(previous).classList.add("active");

  if (previous === "projects") renderProjects();
  if (previous === "gallery") renderGallery();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleMenu() {
  document.getElementById("mainNav").classList.toggle("open");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Demo credits: 50 per browser day.
// This is not secure server-side credit management.
function getToday() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
}

function loadCredits() {
  const today = getToday();
  const savedDate = localStorage.getItem("rm_credit_date");

  if (savedDate !== today) {
    localStorage.setItem("rm_credit_date", today);
    localStorage.setItem("rm_credits", "50");
  }

  updateCredits();
}

function updateCredits() {
  const credits = Number(localStorage.getItem("rm_credits") || 50);
  document.getElementById("creditCount").textContent = credits;
}

function useDemoCredit(amount = 1) {
  const credits = Number(localStorage.getItem("rm_credits") || 50);

  if (credits < amount) {
    showToast("Your demo credits are finished. Try again tomorrow.");
    return false;
  }

  localStorage.setItem("rm_credits", String(credits - amount));
  updateCredits();
  return true;
}

// File previews
function previewFile(input, previewId) {
  const file = input.files && input.files[0];
  if (!file) return;

  const preview = document.getElementById(previewId);
  const isVideo = file.type.startsWith("video/");

  if (preview.tagName === "VIDEO" && !isVideo) {
    showToast("Please select a video file.");
    input.value = "";
    return;
  }

  if (preview.tagName === "IMG" && !file.type.startsWith("image/")) {
    showToast("Please select an image file.");
    input.value = "";
    return;
  }

  const url = URL.createObjectURL(file);
  preview.src = url;
  preview.hidden = false;

  addGalleryItem(file, url);
  showToast("File selected successfully.");
}

function previewImages(input, previewId) {
  const container = document.getElementById(previewId);
  container.innerHTML = "";

  Array.from(input.files || []).forEach(file => {
    if (!file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    const image = document.createElement("img");
    image.src = url;
    image.alt = "Uploaded photo preview";
    container.appendChild(image);

    addGalleryItem(file, url);
  });

  if (input.files.length) showToast("Photos added successfully.");
}

function addGalleryItem(file, url) {
  galleryItems.push({
    name: file.name,
    type: file.type,
    url
  });
}

function saveProject(type, prompt) {
  const project = {
    id: Date.now(),
    type,
    prompt: prompt || "No description added",
    date: new Date().toLocaleString()
  };

  projects.unshift(project);
  localStorage.setItem("rm_projects", JSON.stringify(projects));
  return project;
}

function createDemoProject(type, promptId) {
  const prompt = document.getElementById(promptId).value.trim();

  if (!prompt) {
    showToast("Please write a short description first.");
    document.getElementById(promptId).focus();
    return;
  }

  if (!useDemoCredit(1)) return;

  saveProject(type, prompt);
  showToast("Demo project prepared! AI generation is not connected yet.");
}

function saveMusicProject() {
  const title = document.getElementById("musicTitle").value.trim();
  const lyrics = document.getElementById("lyrics").value.trim();

  if (!lyrics) {
    showToast("Please write your music idea or lyrics.");
    return;
  }

  saveProject("Music Studio", (title || "Untitled music project") + ": " + lyrics);
  showToast("Music project saved in this browser.");
}

function renderProjects() {
  const list = document.getElementById("projectList");
  list.innerHTML = "";

  if (!projects.length) {
    list.innerHTML = '<p class="empty-state">No projects yet. Start creating something!</p>';
    return;
  }

  projects.forEach(project => {
    const item = document.createElement("article");
    item.className = "project-item";

    const details = document.createElement("div");
    const heading = document.createElement("b");
    heading.textContent = project.type;

    const description = document.createElement("p");
    description.textContent = project.prompt.slice(0, 130);

    const date = document.createElement("p");
    date.textContent = project.date;

    details.append(heading, description, date);

    const remove = document.createElement("button");
    remove.className = "outline-btn";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => deleteProject(project.id));

    item.append(details, remove);
    list.appendChild(item);
  });
}

function deleteProject(id) {
  projects = projects.filter(project => project.id !== id);
  localStorage.setItem("rm_projects", JSON.stringify(projects));
  renderProjects();
  showToast("Project removed.");
}

function renderGallery() {
  const gallery = document.getElementById("galleryList");
  gallery.innerHTML = "";

  if (!galleryItems.length) {
    gallery.innerHTML = '<p class="empty-state">Your selected media previews will appear here.</p>';
    return;
  }

  galleryItems.forEach(file => {
    const wrapper = document.createElement("div");
    const name = document.createElement("p");
    name.className = "hint";
    name.textContent = file.name;

    if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = file.url;
      img.alt = file.name;
      wrapper.append(img, name);
    } else if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.src = file.url;
      video.controls = true;
      video.className = "media-preview";
      wrapper.append(video, name);
    }

    gallery.appendChild(wrapper);
  });
}

// Demo account: never stores passwords.
function demoSignup() {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  if (!name || !email || !password) {
    showToast("Please fill in all the fields.");
    return;
  }

  if (!email.includes("@") || password.length < 6) {
    showToast("Enter a valid email and a password with 6+ characters.");
    return;
  }

  currentUser = email;
  localStorage.setItem("rm_demo_user", email);
  showToast("Demo account created. Real account security is not enabled.");
  showPage("home");
}

function demoLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showToast("Please enter your email and password.");
    return;
  }

  currentUser = email;
  localStorage.setItem("rm_demo_user", email);
  showToast("Demo login successful.");
  showPage("home");
}

function demoForgot() {
  const email = document.getElementById("forgotEmail").value.trim();

  if (!email || !email.includes("@")) {
    showToast("Please enter a valid email address.");
    return;
  }

  showToast("Demo only: connect secure email reset service for real password recovery.");
}

function demoLogout() {
  currentUser = "";
  localStorage.removeItem("rm_demo_user");
  showToast("You have logged out of the demo.");
  showPage("home");
}

function demoPayment() {
  showToast("Demo only. No payment has been taken.");
}

function toggleTheme() {
  document.body.classList.toggle("light");
  localStorage.setItem(
    "rm_theme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
}

// Start the app
document.addEventListener("DOMContentLoaded", () => {
  loadCredits();

  if (localStorage.getItem("rm_theme") === "light") {
    document.body.classList.add("light");
  }

  renderProjects();
});