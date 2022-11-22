const CLIENT_ID = "3d4a1588791f4403a22fb0d1eae7bf06"
const scopes = "user-top-read user-follow-read playlist-read-private user-library-read";
const REDIRECT_URI = "http://localhost:3000/login/login.html";
const ACCESS_TOKEN_KEY = "accessToken";
const APP_URL = "http://localhost:3000"

const authorizeUser = () => {
    const url = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=${scopes}&show_dialog=true`;
    window.open(url,"login","width=800,height=600");
}

document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("login-to-spotify");
    loginButton.addEventListener("click", authorizeUser);
})

window.setItemsInLocastorage = ({accessToken , tokenType , expiresIn}) => {
    localStorage.setItem("accessToken" , accessToken);
    localStorage.setItem("tokenType" , tokenType);
    localStorage.setItem("expiresIn" , expiresIn);
    window.location.href = `${APP_URL}/dashboard/dashboard.html` 
}

window.addEventListener("load", () => {
    const accessToken =  localStorage.getItem(ACCESS_TOKEN_KEY);
    if(accessToken){
        window.location.href = `${APP_URL}/dashboard/dashboard.html`
    }

   if (window.opener !== null && !window.opener.closed) {
    window.focus();
    if (window.location.href.includes("error")) {
        window.close();
    }
    const {hash} = window.location;
    const searchParams = new URLSearchParams(hash);
    const accessToken = searchParams.get("#access_token");

    // '#access_token=BQALYWce4TeSqEgHSYdbt22PnYT8HZWBcGy8-Ny1IFahLFOAV6Np8q94ny1JEgz4PwvSzN72PUMzToWg3S-vt4S82DU8iZhZAK7Bf8XTvBHPq5PpUJsFrJUEptryxHLaCnwSFCpHZIImhXPg-NdsfUZNaTU5Q0cYA7IhFRr5dOTdUJK787uQLzgw7bTwk-V1WHWuOcNoFstBDhPguQ6XaYNZLFaDrnVFTw&token_type=Bearer&expires_in=3600'

    const tokenType = searchParams.get("token_type");
    const expiresIn = searchParams.get("expires_in");
    if(accessToken){
        window.close();
        window.opener.setItemsInLocastorage({accessToken, tokenType, expiresIn});
    }else{
        window.close;
    }
   }
})