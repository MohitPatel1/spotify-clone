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

const loadFeaturedPlaylist = async() => {
    const {playlists:{items}} = await fetchRequest(ENDPOINT.featuredPlaylist);
    const playlistItemsSection = document.querySelector("#featured-playlist-items");
    for (let {name, description, images:[{url}] ,id} of items){
        const playlistItem = document.createElement("section");
        playlistItem.id = id;
        playlistItem.className = "rounded p-4 border-solid border-2 hover:cursor-pointer";
        playlistItem.setAttribute("data-type", "playlist")
        playlistItem.addEventListener("click", onPlaylistClicked)
        playlistItem.innerHTML = `<img src="${url}" alt="${name}" class="rounded mb-2 object-contain shadow">
        <h2 class="text-sm">${name}</h2>
        <h3 class="text-xs">${description}</h3>`;

        playlistItemsSection.appendChild(playlistItem);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadUserProfile();
    loadFeaturedPlaylist();
    document.addEventListener("click" , () => {
        const profileMenu = document.querySelector("#profile-menu");
        if(!profileMenu.classList.contains("hidden")){
            console.log("on document click");
            profileMenu.classList.add("hidden");
        }
    })

})