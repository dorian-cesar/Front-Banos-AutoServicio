export function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }
  
  export function setToken(token, user) {
    if (typeof window === "undefined") return;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }