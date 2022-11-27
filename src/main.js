import './style.css'

document.addEventListener("DOMContentLoaded",() => {
  if(localStorage.getItem("accessToken")){
    window.location.href = "dashboard"
  }
  else{
    window.location.href = "login"
  }
})
