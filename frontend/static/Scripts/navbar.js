// Toggle mobile menu
window.toggleMenu = function () {
  const nav = document.getElementById("primaryNav");
  const isOpen = nav.classList.toggle("open");
  document.querySelector(".menu-btn").setAttribute("aria-expanded", isOpen);
};

// Navbar link updates based on server-side templating
document.addEventListener("DOMContentLoaded", () => {
  const authLink = document.getElementById("authLink");
  const regLink = document.getElementById("regLink");

  // Server decides if user is logged in (EJS passes user)
  const isLoggedIn = document.body.getAttribute("data-auth") === "true";

  if (isLoggedIn) {
    // Logout button
    authLink.textContent = "Logout";
    authLink.href = "/logout";

    // Show profile link
    regLink.textContent = "Profile";
    regLink.href = "/profile";
  } else {
    // Normal login/register
    authLink.textContent = "Login";
    authLink.href = "/login";

    regLink.textContent = "Register";
    regLink.href = "/register";
  }
});
