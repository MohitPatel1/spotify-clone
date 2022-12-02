import { fetchRequest } from "../api";
import { ENDPOINT, logout, SECTIONTYPE } from "../common";

const onProfileClick = (event) => {
    event.stopPropagation();
    const profileMenu = document.querySelector("#profile-menu");
    profileMenu.classList.toggle("hidden"); 
    if(!profileMenu.classList.contains("hidden")){
        console.log("on profile click");
        profileMenu.querySelector("li#logout").addEventListener("click", logout);
    }
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
        playlistItem.addEventListener("click", (event)=>onPlaylistClicked(event,id));
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
    const pageContent = document.querySelector("#page-content");
    const playlistMap = new Map([["featured","featured-playlist-items"],["top playlists", "top-playlist-items"]])
    let innerHTML = "";
    for(let [type , id] of playlistMap){
        innerHTML += `<article class="p-4">
        <h1 class="text-2xl mb-4 font-bold capitalize">${type}</h1>
        <section id="${id}" class="featured-songs grid gap-2 grid-cols-auto-fill-cards"></section>
    </article>`
    }
    pageContent.innerHTML=innerHTML;
}

const loadPlaylistTracks = ({tracks}) => {
    let trackSection = document.querySelector("#tracks");
    for(let trackItem of tracks.items){
        console.log(trackItem);
        console.log(trackItem.track);
        let {id , artists , name , album, duration_ms} = trackItem.track;
        let image = album.images.find(img => img.height === 64);
        trackSection.innerHTML += `<section class="track p-1 grid grid-cols-[50px_2fr_1fr_50px] items-center justify-items-start gap-4 text-secondary rounded-md hover:bg-light-black">
        <p class="justify-self-center">1</p>
        <section class="grid grid-cols-2 gap-2">
            <img class="h-8 w-8" src="${image.url}" alt="${name}" />
            <article class="flex flex-col gap-1">
                <h2 class="text-primary text-xl ">${name}</h2>
                <p class="text-sm">${Array.from(artists, artist=> artist.name).join(", ")}</p>
            </article>
        </section>
        <p>${album.name}</p>
        <p>${duration_ms}</p>
        </section>
        `;
    }
}

const fillContentForPlaylist = async (playlistId) => {
    const playlist = await fetchRequest(`${ENDPOINT.playlist}/${playlistId}`);
    console.log(playlist);
    const playlistItem = document.querySelector("#page-content");
    playlistItem.innerHTML = `<header class="px-8">
    <nav>
        <ul class="grid grid-cols-[50px_2fr_1fr_50px] gap-4 text-secondary ">
            <li class="justify-self-center">#</li>
            <li>Title</li>
            <li>Album</li>
            <li>⏱</li>
        </ul>
    </nav>
</header>
<section id="tracks" class="px-8">
</section>`

    loadPlaylistTracks(playlist)
    console.log(playlist);
}


const onPlaylistClicked = (event,id) => {
    console.log(event.target);
    const section = {type: SECTIONTYPE.PLAYLIST, playlist: id}
    console.log(section);
    history.pushState(section, "",`playlist/${id}`);
    loadSection(section);
}

const loadSection = (section) => {
    if(section.type === SECTIONTYPE.DASHBOARD){
        fillContentForDashboard();
        loadPlaylists();
    }
    else if(section.type === SECTIONTYPE.PLAYLIST){
        console.log(section.playlist);
        fillContentForPlaylist(section.playlist)
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadUserProfile();
    const section = {type: SECTIONTYPE.DASHBOARD};
    console.log(section);
    history.pushState(section, "","");
    loadSection(section);
    document.addEventListener("click" , () => {
        const profileMenu = document.querySelector("#profile-menu");
        if(!profileMenu.classList.contains("hidden")){
            console.log("on document click");
            profileMenu.classList.add("hidden");
        }
    })

    document.querySelector(".content").addEventListener("scroll",(event) => {
        const{scrollTop} = event.target;
        const header = document.querySelector(".header");
        if(scrollTop >= header.offsetTop + header.offsetHeight){
            header.classList.add("bg-black-secondary");
            header.classList.remove("bg-transparent");
        }
        else {
            header.classList.add("bg-transparent");
            header.classList.remove("bg-black-secondary");
        }
    });

    window.addEventListener("popstate", (event) => {
        loadSection(event.state)
    })
})