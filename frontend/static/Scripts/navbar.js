window.toggleMenu = function () {
  const nav = document.getElementById("primaryNav");
  const isOpen = nav.classList.toggle("open");
  document.querySelector(".menu-btn").setAttribute("aria-expanded", isOpen);
};

async function updateNavbar() {
  const authLink = document.getElementById("authLink");
  const regLink = document.getElementById("regLink");

  if (!authLink || !regLink) {
    console.warn("Navbar elements not found");
    return;
  }

  try {
    const response = await fetch("/auth/session", {
      credentials: "include",
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    const user = await response.json();
    console.log("Session user:", user);

    if (user && user.email) {
      authLink.textContent = "Logout";
      authLink.href = "/logout";

      regLink.textContent = "Profile";
      regLink.href = "/profile";

      if (user.is_admin === true) {
        const adminLink = document.createElement("a");
        adminLink.href = "/admin";
        adminLink.className = "nav-link";
        adminLink.textContent = "Admin";
        adminLink.style.color = "#ff6b6b";
        adminLink.style.fontWeight = "bold";
        regLink.parentNode.insertBefore(adminLink, regLink.nextSibling);
      }
    } else {
      authLink.textContent = "Login";
      authLink.href = "/login";
      regLink.textContent = "Register";
      regLink.href = "/register";
    }
  } catch (err) {
    console.error("Navbar update failed:", err.message);
    authLink.textContent = "Login";
    authLink.href = "/login";
    regLink.textContent = "Register";
    regLink.href = "/register";
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", updateNavbar);
} else {
  updateNavbar();
}

const params = new URLSearchParams(window.location.search);
if (params.get("logout_success") === "true") {
  const message = document.createElement("div");
  message.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;
  message.textContent = "✓ Logged out successfully";
  document.body.appendChild(message);

  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  setTimeout(() => {
    message.style.animation = "slideIn 0.3s ease-out reverse";
    setTimeout(() => message.remove(), 300);
  }, 3000);

  const url = new URL(window.location);
  url.searchParams.delete("logout_success");
  window.history.replaceState({}, document.title, url);
}
