import { ACCESS_TOKEN , TOKEN_TYPE, EXPIRES_IN} from "../common";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const ACCESS_TOKEN_KEY = import.meta.env.VITE_APP_URL;
const scopes = "user-top-read user-follow-read playlist-read-private user-library-read";
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
    localStorage.setItem("ACCESS_TOKEN" , accessToken);
    localStorage.setItem("TOKEN_TYPE" , tokenType);
    localStorage.setItem("EXPIRES_IN" , expiresIn);
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