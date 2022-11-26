import { fetchRequest } from "../api";
import { ENDPOINT, logout } from "../common";

const onProfileClick = (event) => {
    event.stopPropagation();
    const profileMenu = document.querySelector("#profile-menu");
    profileMenu.classList.toggle("hidden"); 
    if(!profileMenu.classList.contains("hidden")){
        console.log("on profile click");
        profileMenu.querySelector("li#logout").addEventListener("click", logout);
    }
}

const onPlaylistClicked = (event) => {
    console.log(event.target);
}

// Loading Content

const loadUserProfile = async() => {
    const defaultImage = document.querySelector("#default-image");
    const profileButton = document.querySelector("#user-profile-btn");
    const displayNameElement = document.querySelector("#display-name");
    
    const { display_name: displayName ,images , images:[{url}]} = await fetchRequest(ENDPOINT.userInfo); //[0]{url}
    displayNameElement.textContent = displayName;
    if(images?.length){
        defaultImage.innerHTML = `<img src="${url}" class="w-8 h-8 rounded-full bg-gray">` 
    }
    profileButton.addEventListener("click", onProfileClick)
}

const loadPlaylist = async(endpoint, elementId) => {
    const {playlists:{items}} = await fetchRequest(endpoint);
    const playlistItemsSection = document.querySelector(`#${elementId}`);
    for (let {name, description, images:[{url}] ,id} of items){
        const playlistItem = document.createElement("section");
        playlistItem.id = id;
        playlistItem.className = "rounded p-4 hover:cursor-pointer bg-black-secondary hover:bg-light-black";
        playlistItem.setAttribute("data-type", "playlist")
        playlistItem.addEventListener("click", onPlaylistClicked)
        playlistItem.innerHTML = `<img src="${url}" alt="${name}" class="rounded mb-2 object-contain shadow">
        <h2 class="text-base mb-4 truncate">${name}</h2>
        <h3 class="text-sm text-secondary line-clamp-2">${description}</h3>`;

        playlistItemsSection.appendChild(playlistItem);
    }
}

const loadPlaylists = () => {
    loadPlaylist(ENDPOINT.featuredPlaylist, "featured-playlist-items");
    loadPlaylist(ENDPOINT.toplists, "top-playlist-items");
}

const fillContentForDashboard = () => {
    const playlistMap = new Map([["featured","featured-playlist-items"],["top playlists", "top-playlist-items"]])
    let innerHTML = "";
    for(let [type , id] of playlistMap){
        innerHTML += `<article class="p-4">
        <h1 class="text-2xl mb-4 font-bold capitalize">${type}</h1>
        <section id="${id}" class="featured-songs grid gap-2 grid-cols-auto-fill-cards"></section>
    </article>`
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadUserProfile();
    loadPlaylists();
    document.addEventListener("click" , () => {
        const profileMenu = document.querySelector("#profile-menu");
        if(!profileMenu.classList.contains("hidden")){
            console.log("on document click");
            profileMenu.classList.add("hidden");
        }
    })

})