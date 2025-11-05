// ✅ Import Supabase module directly
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ✅ Initialize client
const supabase = createClient(
  "https://ifxubrjpqsufxkjsomin.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmeHVicmpwcXN1ZnhranNvbWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTgwNDUsImV4cCI6MjA3NjQ3NDA0NX0.4sXs9-JIJEwk7tnYaB8nIHQnlPYKIvzShqpWQFgqX2U"
);

// ✅ Navbar logic
const authLink = document.getElementById("authLink");
const regLink = document.getElementById("regLink");

window.toggleMenu = function () {
  const nav = document.getElementById("primaryNav");
  const isOpen = nav.classList.toggle("open");
  document.querySelector(".menu-btn").setAttribute("aria-expanded", isOpen);
};

async function updateNavbar() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    const session = data.session;

    if (session) {
      authLink.textContent = "Logout";
      authLink.removeAttribute("href");

      const newAuthLink = authLink.cloneNode(true);
      authLink.parentNode.replaceChild(newAuthLink, authLink);

      newAuthLink.addEventListener("click", async (e) => {
        e.preventDefault();
        await supabase.auth.signOut();
        window.location.reload();
      });

      regLink.textContent = "Profile";
      regLink.href = "/profile";
    } else {
      authLink.textContent = "Login";
      authLink.href = "/login";

      regLink.textContent = "Register";
      regLink.href = "/register";
    }
  } catch (err) {
    console.error("Navbar update failed:", err.message);
  }
}

updateNavbar();
