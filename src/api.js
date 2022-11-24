import { ACCESS_TOKEN, logout, TOKEN_TYPE } from "./common";

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

const getAccessToken = () => {

    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    const expiresIn = localStorage.getItem(ACCESS_TOKEN);
    const tokenType = localStorage.getItem(TOKEN_TYPE);
    if(Date.now() < expiresIn){
        return {accessToken , tokenType}
    }
    else{
        logout();
    }
}

const createAPIConfig = ({accessToken, tokenType} , method = "GET") => {
    return {
        headers: {
            Authorization: `${tokenType} ${accessToken}`
        },
        method
    }
}

const fetchRequest = (endpoint) => {
    const url = `${BASE_API_URL}/${endpoint}`;
    fetch(url,createAPIConfig(getAccessToken())) ;
}


