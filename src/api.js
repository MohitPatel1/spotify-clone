const BASE_API_URL = import.meta.env.VITE_REDIRECT_URI;

const getAccessToken = () => {

}

const fetchRequest = (endpoint) => {
    const url = `${BASE_API_URL}/${endpoint}`;
    fetch(url,{
        headers
    })   
}


