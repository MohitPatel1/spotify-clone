import { fetchRequest } from "../api";
import { ENDPOINT, getItemFromLocalStorage, LOADED_TRACKS, logout, SECTIONTYPE, setItemInLocalStorage } from "../common";

const audio = new Audio();

const onProfileClick = (event) => {
	event.stopPropagation();
	const profileMenu = document.querySelector("#profile-menu");
	profileMenu.classList.toggle("hidden");
	if (!profileMenu.classList.contains("hidden")) {
		profileMenu.querySelector("li#logout").addEventListener("click", logout);
	}
}

// Loading Content

const loadUserProfile = async () => {
	const defaultImage = document.querySelector("#default-image");
	const profileButton = document.querySelector("#user-profile-btn");
	const displayNameElement = document.querySelector("#display-name");

	const { display_name: displayName, images, images: [{ url }] } = await fetchRequest(ENDPOINT.userInfo); //[0]{url}
	displayNameElement.textContent = displayName;
	if (images?.length) {
		defaultImage.innerHTML = `<img src="${url}" class="w-8 h-8 rounded-full bg-gray">`
	}
	profileButton.addEventListener("click", onProfileClick)
}

const loadPlaylist = async (endpoint, elementId) => {
	const { playlists: { items } } = await fetchRequest(endpoint);
	const playlistItemsSection = document.querySelector(`#${elementId}`);
	for (let { name, description, images: [{ url }], id } of items) {
		const playlistItem = document.createElement("section");
		playlistItem.id = id;
		playlistItem.className = "rounded p-4 hover:cursor-pointer bg-black-secondary hover:bg-light-black";
		playlistItem.setAttribute("data-type", "playlist")
		playlistItem.addEventListener("click", () => onPlaylistClicked(id));
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
	const coverContent = document.querySelector("#cover-content");
	const date = new Date();
	const hours = date.getHours();
	const timePeriod = (hours > 5 && hours <= 11) ? "Morning" : (hours > 11 && hours <= 17) ? "After Noon" : (hours > 17 && hours <= 22) ? "Evening" : (hours > 22 && hours <= 24 || hours >= 0 && hours < 5) ? "Night" : "Day" ;
	coverContent.innerHTML = `<h1 class="text-6xl">Good ${timePeriod}</h1>`
	coverContent
	const pageContent = document.querySelector("#page-content");
	const playlistMap = new Map([["featured", "featured-playlist-items"], ["top playlists", "top-playlist-items"]])
	let innerHTML = "";
	for (let [type, id] of playlistMap) {
		innerHTML += `<article class="p-4">
        <h1 class="text-2xl mb-4 font-bold capitalize">${type}</h1>
        <section id="${id}" class="featured-songs grid gap-2 grid-cols-auto-fill-cards"></section>
    </article>`
	}
	pageContent.innerHTML = innerHTML;
}

const formatTime = (duration_ms) => {
	let duration_sec = duration_ms / 1000;
	let min = Math.floor(duration_sec / 60);
	let sec = Math.round(duration_sec % 60);
	let duration = ((min < 10 ? "0" : "") + min + ":" + (sec < 10 ? "0" : "") + sec);
	return duration
}

const onTrackSelection = (id, event) => {
	document.querySelectorAll("#tracks .track").forEach(trackItem => {
		if (trackItem.id === id) {
			trackItem.classList.add("bg-gray", "selected");
		} else {
			trackItem.classList.remove("bg-gray", "selected");
		}
	})
}

// const timeLine = document.querySelector("")

const updateIconsForPlayMode = (id) => {
	const playButton = document.querySelector("#play");
	playButton.querySelector("span").textContent = "pause_circle";
	const playButtonFromTracks = document.querySelector(`#play-track-${id}`);
	if (playButtonFromTracks) {
		playButtonFromTracks.textContent = "pause";
	}
}

const updateIconsForPauseMode = (id) => {
	const playButton = document.querySelector("#play");
	playButton.querySelector("span").textContent = "play_circle";
	const playButtonFromTracks = document.querySelector(`#play-track-${id}`);
	if (playButtonFromTracks) {
		playButtonFromTracks.textContent = "play_arrow";
	}
}

const onAudioMetadataLoaded = () => {
	const totalSongDuration = document.querySelector("#total-song-duration");
	totalSongDuration.textContent = `0:${audio.duration.toFixed(0)}`;
}

const togglePlay = () => {
	if (audio.src) {
		if (audio.paused) {
			audio.play();
		}
		else {
			audio.pause();
		}
	}
}

const findCurrentTrack = () => {
	const audioControl = document.querySelector("#audio-control");
	const trackId = audioControl.getAttribute("data-track-id");
	if (trackId) {
		const loadedTracks = getItemFromLocalStorage(LOADED_TRACKS);
		const currentTrackIndex = loadedTracks?.findIndex(trk => trk.id === trackId);
		return { currentTrackIndex, tracks: loadedTracks };
	}
	return null;
}

const playNextTrack = () => {
	const { currentTrackIndex = -1, tracks = null } = findCurrentTrack();
	if (currentTrackIndex < tracks.length - 1) {
		playTrack(null, tracks[currentTrackIndex + 1]);
	}
}
const playPrevTrack = () => {
	const { currentTrackIndex = -1, tracks = null } = findCurrentTrack();
	if (currentTrackIndex > 0) {
		playTrack(null, tracks[currentTrackIndex - 1]);
	}
}

const playTrack = (event, { image, artistNames, name, previewUrl, duration, id }) => {
	if (event?.stopPropagation) {
		event.stopPropagation();
	}
	if (audio.src === previewUrl) {
		togglePlay();
	} else {
		const nowPlayingSongImage = document.querySelector("#now-playing-image");
		const songTitle = document.querySelector("#now-playing-song");
		const artists = document.querySelector("#now-playing-artists");
		const audioControl = document.querySelector("#audio-control");
		const songInfo = document.querySelector("#song-info");

		nowPlayingSongImage.src = image.url;
		songTitle.textContent = name;
		artists.textContent = artistNames;
		audioControl.setAttribute("data-track-id", id);
		audio.src = previewUrl;
		audio.play();
		songInfo.classList.remove("invisible");
	}
}

const loadPlaylistTracks = ({ tracks }) => {
	let trackSections = document.querySelector("#tracks");
	let trackNo = 1;
	const loadedTracks = [];
	for (let trackItem of tracks.items.filter(item => item.track.preview_url)) {
		let { id, artists, name, album, duration_ms, preview_url: previewUrl } = trackItem.track;
		let track = document.createElement("section");
		track.id = id;
		track.className = "track p-1 grid grid-cols-[50px_1fr_1fr_50px] items-center justify-items-start gap-4 text-secondary rounded-md hover:bg-light-black";
		let image = album.images.find(img => img.height === 64);
		let duration = formatTime(duration_ms)
		let artistNames = `${Array.from(artists, artist => artist.name).join(", ")}`
		track.innerHTML = `
        <p class="relative w-full flex items-center justify-center justify-self-center"><span class="track-no">${trackNo++}</span></p>
        <section class="grid grid-cols-[50px_1fr] place-items-center gap-2">
            <img class="h-10 w-10" src="${image.url}" alt="${name}" />
            <article class="flex flex-col gap-1 justify-center">
                <h2 class="song-title text-primary text-lg line-clamp-1">${name}</h2>
                <p class="text-xs line-clamp-1">${artistNames}</p>
            </article>
        </section>
        <p class="line-clamp-1 text-sm">${album.name}</p>
        <p class="text-sm">${duration}</p>
        </section>
        `;
		track.addEventListener("click", (event) => onTrackSelection(id, event));

		const playButton = document.createElement("button");
		playButton.id = `play-track-${id}`;
		playButton.className = `play w-full absolute left-0 text-lg invisible material-symbols-outlined`
		playButton.textContent = "play_arrow";
		playButton.addEventListener("click", (event) => playTrack(event, { image, artistNames, name, previewUrl, duration, id }))
		track.querySelector("p").appendChild(playButton);
		trackSections.appendChild(track);

		loadedTracks.push({ id, artistNames, name, album, duration, previewUrl, image });
	}
	setItemInLocalStorage(LOADED_TRACKS, loadedTracks);
}

const fillContentForPlaylist = async (playlistId) => {
	const playlist = await fetchRequest(`${ENDPOINT.playlist}/${playlistId}`);
	const playlistItem = document.querySelector("#page-content");
	const coverElement = document.querySelector("#cover-content");
	console.log(coverElement)
	const { name, images, description } = playlist;
	coverElement.innerHTML = `
	<img class="object-contain h-36 w-36" src="${images[0].url}" alt="cover image" />
			<section>
				<h2 id="playlist-name" class="text-4xl">${name}</h2>
				<p id="playlist-details">${description}</p>
			</section>`
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

const onPlaylistClicked = (id) => {
	const section = { type: SECTIONTYPE.PLAYLIST, playlist: id }
	history.pushState(section, "", `playlist/${id}`);
	loadSection(section);
}

const loadSection = (section) => {
	if (section.type === SECTIONTYPE.DASHBOARD) {
		fillContentForDashboard();
		loadPlaylists();
	}
	else if (section.type === SECTIONTYPE.PLAYLIST) {
		fillContentForPlaylist(section.playlist)
	}
}

const loadUserPlaylists = async () => {
	const playlists = await fetchRequest(ENDPOINT.userPlaylist);
	console.log(playlists)
	const userPlaylistSection = document.querySelector("#user-playlists > ul");
	userPlaylistSection.innerHTML = "";
	for(let {name , id} of playlists.items){
		const li = document.createElement("li");
		li.textContent = name;
		li.classList = "cursor-pointer hover:text-primary";
		li.addEventListener("click" , () => onPlaylistClicked(id));
		userPlaylistSection.append(li);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const volume = document.querySelector("#volume");
	const playButton = document.querySelector("#play");
	const audioControl = document.querySelector("#audio-control");
	const totalSongDurationCompleted = document.querySelector("#song-duration-completed");
	const songProgress = document.querySelector("#progress");
	const timeline = document.querySelector("#timeline");
	const next = document.querySelector("#next");
	const prev = document.querySelector("#previous");
	let progressInterval;
	loadUserProfile();
	loadUserPlaylists();
	const section = { type: SECTIONTYPE.DASHBOARD };
	history.pushState(section, "", "");
	loadSection(section);
	// const section = { type: SECTIONTYPE.PLAYLIST, playlist: "37i9dQZF1DWY1kDGbdPb81" };
	// history.pushState(section, "", `dashboard/playlist/${section.playlist}`);
	// fillContentForPlaylist(section.playlist)
	document.addEventListener("click", () => {
		const profileMenu = document.querySelector("#profile-menu");
		if (!profileMenu.classList.contains("hidden")) {
			profileMenu.classList.add("hidden");
		}
	})
	
	document.querySelector(".content").addEventListener("scroll", (event) => {
		const { scrollTop } = event.target;
		const header = document.querySelector(".header");
		const coverElement = document.querySelector("#cover-content");
		const coverHeight = coverElement.offsetHeight;
		const coverOpacity = 100 - (scrollTop >= coverHeight ? 100 : ((scrollTop/coverHeight)*100));
		const headerOpacity = scrollTop >= header.offsetHeight ? 100 : ((scrollTop / header.offsetHeight)*100);
		coverElement.style.opacity = `${coverOpacity}%`
		header.style.background = `rgba(0 0 0 / ${headerOpacity}%)`;
		
		if (history.state.type === SECTIONTYPE.PLAYLIST) {
			const playlistHeader = document.querySelector("#playlist-header");
			if (coverOpacity <= 35) {
				playlistHeader.classList.add("sticky", "bg-black-secondary", "px-8")
				playlistHeader.classList.remove("mx-8");
				playlistHeader.style.top = `${header.offsetHeight}px`;
			}
			else {
				playlistHeader.classList.remove("sticky", "bg-black-secondary", "px-8")
				playlistHeader.classList.add("mx-8");
				playlistHeader.style.top = `revert`;
			}
		}
	});

	audio.addEventListener("play", () => {
		const selectedTrackId = audioControl.getAttribute("data-track-id");
		const tracks = document.querySelector("#tracks");
		const playingTrack = tracks.querySelector("section.playing");
		const selectedTrack = tracks?.querySelector(`[id="${selectedTrackId}"]`);
		if (playingTrack?.id !== selectedTrack?.id) {
			playingTrack?.classList.remove("playing");
		}
		selectedTrack?.classList.add("playing");

		progressInterval = setInterval(() => {
			if (audio.paused) {
				return
			}
			totalSongDurationCompleted.textContent = formatTime(audio.currentTime * 1000);
			songProgress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
		}, 100);
		updateIconsForPlayMode(selectedTrackId);
	})

	audio.addEventListener("pause", () => {
		if (progressInterval) {
			clearInterval(progressInterval);
		}
		const selectedTrackId = audioControl.getAttribute("data-track-id");
		updateIconsForPauseMode(selectedTrackId);
	})

	audio.addEventListener("loadedmetadata", onAudioMetadataLoaded);
	playButton.addEventListener("click", togglePlay);

	volume.addEventListener("change", () => {
		audio.volume = volume.value / 100;
	});

	timeline.addEventListener("click", (event) => {
		const timelineWidth = window.getComputedStyle(timeline).width;
		const timeToSeek = (event.offsetX / parseInt(timelineWidth)) * audio.duration;
		audio.currentTime = timeToSeek;
		songProgress.style.width = `${(timeToSeek / timelineWidth) * 100}%`;
	}, false);

	next.addEventListener("click", playNextTrack);
	prev.addEventListener("click", playPrevTrack);

	window.addEventListener("popstate", (event) => {
		loadSection(event.state)
	})
})

