import { isAuthenticated } from "./api";


const PUBLIC_AUTH_PAGES = ["signin.html", "signup.html"];


const EXEMPT_PAGES = ["404.html"];

function currentPage() {
  
  const path = window.location.pathname;
  if (path === "/" || path === "") return "index.html";
  const last = path.split("/").pop();
  return last || "index.html";
}

export function guardPage() {
  const page = currentPage();

  if (EXEMPT_PAGES.includes(page)) return;

  if (PUBLIC_AUTH_PAGES.includes(page)) {
    
    if (isAuthenticated()) {
      window.location.replace("index.html");
    }
    return;
  }


  if (!isAuthenticated()) {
    window.location.replace("signin.html");
  }
}
