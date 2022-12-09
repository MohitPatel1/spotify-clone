import { fetchRequest } from "../api";
import { ENDPOINT, logout, SECTIONTYPE } from "../common";

const audio = new Audio();
const volume  = document.querySelector("#volume");
const playButton = document.querySelector("#play");
const totalSongDuration = document.querySelector("#total-song-duration");
const totalSongDurationCompleted = document.querySelector("#song-duration-completed");
const songProgress = document.querySelector("#progress");
const timeline = document.querySelector("#timeline")
let progressInterval ;

const onProfileClick = (event) => {
    event.stopPropagation();
    const profileMenu = document.querySelector("#profile-menu");
    profileMenu.classList.toggle("hidden"); 
    if(!profileMenu.classList.contains("hidden")){
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

const formatTime = (duration_ms) => {
    let duration_sec = duration_ms/1000 ;
    let min = Math.floor(duration_sec / 60);
    let sec = Math.round(duration_sec % 60);
    let duration = ((min < 10 ? "0":"" ) + min + ":" + (sec < 10 ? "0":"") + sec);
    return duration
}

const onTrackSelection = (id, event) => {
    document.querySelectorAll("#tracks .track").forEach(trackItem => {
        if(trackItem.id === id){
            trackItem.classList.add("bg-gray" , "selected");
        }else{
            trackItem.classList.remove("bg-gray" , "selected");
        }
    })
}

// const timeLine = document.querySelector("")

const onAudioMetadataLoaded = () => {
    totalSongDuration.textContent = `0:${audio.duration.toFixed(0)}`;
    playButton.querySelector("span").textContent = "pause_circle"
}



const onPlayTrack = (event , {image,artistNames,name,previewUrl , duration, id}) => {
    // <section class="grid grid-cols-[auto_1fr]"> <!-- 50px -->
    //             <img src="" alt="title" class="h-12 w-12">
    //             <section class="flex flex-col justify-center">
    //                 <h2 id="now-playing-song" class="text-sm font-semibold text-primary">song title</h2>
    //                 <p id="now-playing-artists" class="text-xs">song artists</p>
    //             </section>
    //         </section>
    const nowPlayingSongImage = document.querySelector("#now-playing-image")
    nowPlayingSongImage.src = image.url;
    const songTitle = document.querySelector("#now-playing-song")
    songTitle.textContent = name;
    const artists = document.querySelector("#now-playing-artists")
    artists.textContent = artistNames;

    audio.src = previewUrl;
    audio.play();
    clearInterval(progressInterval);
    setInterval(() => {
        if(audio.paused){
            return
        } 
        totalSongDurationCompleted.textContent = formatTime(audio.currentTime * 1000);
        songProgress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    }, 100);
    audio.removeEventListener("loadedmetadata", onAudioMetadataLoaded);
    audio.addEventListener("loadedmetadata" , onAudioMetadataLoaded);

}

const loadPlaylistTracks = ({tracks}) => {
    let trackSections = document.querySelector("#tracks");
    let trackNo = 1 ;
    for(let trackItem of tracks.items){
        let {id , artists , name , album, duration_ms, preview_url : previewUrl} = trackItem.track;
        let track = document.createElement("section");
        track.id = id;
        track.className = "track p-1 grid grid-cols-[50px_1fr_1fr_50px] items-center justify-items-start gap-4 text-secondary rounded-md hover:bg-light-black";
        let image = album.images.find(img => img.height === 64);
        let duration = formatTime(duration_ms)
        let artistNames = `${Array.from(artists, artist=> artist.name).join(", ")}`
        track.innerHTML = `
        <p class="relative w-full flex items-center justify-center justify-self-center"><span class="track-no">${trackNo++}</span></p>
        <section class="grid grid-cols-[50px_1fr] place-items-center gap-2">
            <img class="h-10 w-10" src="${image.url}" alt="${name}" />
            <article class="flex flex-col gap-1 justify-center">
                <h2 class="text-primary text-lg line-clamp-1">${name}</h2>
                <p class="text-xs line-clamp-1">${artistNames}</p>
            </article>
        </section>
        <p class="line-clamp-1 text-sm">${album.name}</p>
        <p class="text-sm">${duration}</p>
        </section>
        `;
        track.addEventListener("click" , (event) => onTrackSelection(id , event)) ;

        const playButton = document.createElement("button");
        playButton.id = `play-track${id}`;
        playButton.className = `play w-full absolute left-0 text-lg invisible`
        playButton.textContent = "▶";
        playButton.addEventListener("click" , (event) => onPlayTrack(event, {image,artistNames,name,previewUrl , duration, id}))
        track.querySelector("p").appendChild(playButton);
        trackSections.appendChild(track);
    }
}

const fillContentForPlaylist = async (playlistId) => {
    const playlist = await fetchRequest(`${ENDPOINT.playlist}/${playlistId}`);
    const playlistItem = document.querySelector("#page-content");
    playlistItem.innerHTML = `
    <header id="playlist-header" class="mx-8 border-secondary border-b-[0.5px] z-10">
    <nav class="py-2">
        <ul class="grid grid-cols-[50px_1fr_1fr_50px] gap-4 text-secondary p-1">
            <li class="justify-self-center">#</li>
            <li>TITLE</li>
            <li>ALBUM</li>
            <li>⏱</li>
        </ul>
    </nav>
</header>
<section id="tracks" class="px-8 text-secondary mt-4">
</section>`

    loadPlaylistTracks(playlist)
}


const onPlaylistClicked = (event,id) => {
    const section = {type: SECTIONTYPE.PLAYLIST, playlist: id}
    history.pushState(section, "",`playlist/${id}`);
    loadSection(section);
}

const loadSection = (section) => {
    if(section.type === SECTIONTYPE.DASHBOARD){
        fillContentForDashboard();
        loadPlaylists();
    }
    else if(section.type === SECTIONTYPE.PLAYLIST){
        fillContentForPlaylist(section.playlist)
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadUserProfile();
    // const section = {type: SECTIONTYPE.DASHBOARD};
    const section = {type: SECTIONTYPE.PLAYLIST , playlist:"37i9dQZF1DX2LmjTY2eac5"}
    // history.pushState(section, "","");
    history.pushState(section, "",`dashboard/playlist/${section.playlist}`);
    // loadSection(section);
    fillContentForPlaylist(section.playlist)
    document.addEventListener("click" , () => {
        const profileMenu = document.querySelector("#profile-menu");
        if(!profileMenu.classList.contains("hidden")){
            profileMenu.classList.add("hidden");
        }
    })

    document.querySelector(".content").addEventListener("scroll",(event) => {
        const{scrollTop} = event.target;
        const header = document.querySelector(".header");

        if(scrollTop >= header.offsetHeight){
            header.classList.add("bg-black");
            header.classList.remove("bg-transparent");
        }
        else {
            header.classList.add("bg-transparent");
            header.classList.remove("bg-black");
        }
        
        if(history.state.type === SECTIONTYPE.PLAYLIST){
            const coverElement = document.querySelector("#cover-content");
            const playlistHeader = document.querySelector("#playlist-header");
            if(scrollTop >= (coverElement.offsetHeight - header.offsetHeight)){
                playlistHeader.classList.add("sticky", "bg-black-secondary" , "px-8") 
                playlistHeader.classList.remove("mx-8");
                playlistHeader.style.top = `${header.offsetHeight}px`;
            }
            else{
                playlistHeader.classList.remove("sticky", "bg-black-secondary" , "px-8") 
                playlistHeader.classList.add("mx-8");
                playlistHeader.style.top = `revert`;
            }
        }
    });

    window.addEventListener("popstate", (event) => {
        loadSection(event.state)
    })
})