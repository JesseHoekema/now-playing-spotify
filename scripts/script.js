const clientId = '83769403dc4a4d278496b839eef05ab4';
const clientSecret = '02b626960c884681966fa2bf39b002f3';
const redirectUri = 'https://projects.jessehoekema.com/now-playing-spotify/';
let accessToken = '';
let progress = 0;
let duration = 0;
let intervalId;

const loginSection = document.getElementById('login-section');
const playerSection = document.getElementById('player-section');
const logoutbtn = document.getElementById("logout");
const gradient = 'linear-gradient(109.6deg, rgb(255, 230, 109) 11.2%, rgb(87, 232, 107) 100.2%)';



document.getElementById('login-button').addEventListener('click', () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=https://projects.jessehoekema.com/now-playing-spotify/&scope=user-read-currently-playing`;
    window.location.href = authUrl;
});

async function getAccessToken(code) {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`
    });

    const data = await response.json();
    accessToken = data.access_token;
    localStorage.setItem('spotify_access_token', accessToken);
    logoutbtn.style.display = "block"

    // Na het verkrijgen van de toegangscode, verberg login sectie en toon speler sectie
    loginSection.style.display = 'none';
    playerSection.style.display = 'block';

    // Haal nu de huidige afspeelstatus op
    await getNowPlaying();
    intervalId = setInterval(updateProgressBar, 1000);
    setInterval(getNowPlaying, 10000);
}

async function getNowPlaying() {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) return;

    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
    logoutbtn.style.display = "block"

    if (response.status === 204) {
        console.log('No content');
        return;
    }

    const data = await response.json();
    if (data && data.item) {
        const track = data.item;
        progress = data.progress_ms;
        duration = track.duration_ms;

        const albumImage = track.album.images[0].url;
        const albumImgElement = document.getElementById('album-image');
        albumImgElement.src = albumImage;

        // Hier wordt de albumhoes ingesteld als achtergrondafbeelding van de body
        document.body.style.backgroundImage = `url(${albumImage})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.getElementById('song-title').textContent = track.name;
        document.getElementById('artist-name').textContent = track.artists[0].name;
        // change favicon and title to song
        document.title = track.name +' -' + track.artists[0].name;
        const favicon = document.querySelector('link[rel="shortcut icon"]') || document.createElement('link');
        favicon.href = albumImage;
        favicon.rel = 'shortcut icon';
        favicon.class = 'rounded-favicon'
        document.head.appendChild(favicon);
        updateProgressBar();
    }
}

function updateProgressBar() {
    const progressBar = document.getElementById('progress');
    const currentTime = document.getElementById('current-time');
    const totalTime = document.getElementById('total-time');

    progressBar.style.width = `${(progress / duration) * 100}%`;
    currentTime.textContent = formatTime(progress);
    totalTime.textContent = formatTime(duration);

    if (progress < duration) {
        progress += 1000;
    } else {
        clearInterval(intervalId);
    }
}

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function getCodeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('code');
}

function logout() {
    localStorage.removeItem('spotify_access_token');
    loginSection.style.display = 'block'; // Laat de loginsectie weer zien
    playerSection.style.display = 'none'; // Verberg de spelerssectie
    logoutbtn.style.display = "none"
    document.body.style.background = gradient;
}




window.onload = async () => {
    const code = getCodeFromUrl();
    if (code) {
        await getAccessToken(code);
        window.history.pushState("", "", redirectUri);
    } else {
        const storedToken = localStorage.getItem('spotify_access_token');
        if (storedToken) {
            // Gebruiker is al ingelogd
            loginSection.style.display = 'none';
            playerSection.style.display = 'block';
            await getNowPlaying();
            intervalId = setInterval(updateProgressBar, 1000);
            setInterval(getNowPlaying, 1000);
        } else {
            // Gebruiker is niet ingelogd, toon login sectie
            loginSection.style.display = 'block';
            playerSection.style.display = 'none';
        }
    }
};
