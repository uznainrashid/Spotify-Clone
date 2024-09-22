console.log("hello javascript");
let currentsongs = new Audio();
let songs;
let currFolder;
function formatSeconds(seconds) {
    if (isNaN(seconds || seconds < 0)) {
        // throw new Error('Input must be a non-negative integer');
        return "00:00";
    }

    // Calculate minutes and seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format minutes and seconds as "MM:SS"
    const formattedminutes = String(minutes).padStart(2, '0')
    const formatremainingSeconds = String(remainingSeconds).padStart(2, '0')
    return `${formattedminutes}:${formatremainingSeconds}`;
}
async function getsong(folder) {
    currFolder = folder;

    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();

    console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    console.log(as)
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>uznain</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div>
                
      </li>`;

    }
       // attach an even listener to each song 
       Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {

            PlayMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());

        })

    })


    return songs
}
const PlayMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentsongs.src = `/${currFolder}/` + track;
    if (!pause) {
        currentsongs.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}
async function displayAlbum() {
    let a = await fetch(`http://127.0.0.1:3000/song`);
    let response = await a.text();
    let div = document.createElement("div");
    let cardContainer = document.querySelector(".cardContainer");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
   let array = Array.from(anchors)
   for (let i = 0; i < array.length; i++) {
    const e = array[i];
    
  
        if(e.href.includes("/song")){
            let folder = e.href.split("/").slice(-2)[0]
       
        // get the MetaData for the folder
        let a = await fetch(` http://127.0.0.1:3000/song/${folder}/info.json ` )
        let response = await  a.json();
        console.log(response)

        cardContainer.innerHTML = cardContainer.innerHTML + `  <div data-folder="${folder}" class="card ">
                        <div class="play">

                            <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24"
                                class="Svg-sc-ytk21e-0 bneLcE">
                                <path fill="black"
                                    d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                                </path>
                            </svg>
                        </div>

                        <img src="/song/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div> `
                }
    }
       // Load the Playlist whenever card is clicked
       Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getsong(`song/${item.currentTarget.dataset.folder}`);
            PlayMusic(songs[0])

        })
    })
}

async function main() {
    // GET the song of list 
    songs = await getsong("song/karan")
    PlayMusic(songs[0], true)
    displayAlbum()
    // console.log(songs);

 
    // Attach an event listener play , next and previous
    play.addEventListener("click", () => {
        if (currentsongs.paused) {
            currentsongs.play()
            play.src = "img/pause.svg"
        }
        else {
            currentsongs.pause()
            play.src = "img/play.svg"
        }
    })
    // add event listener for timeupdate 
    currentsongs.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = ` ${formatSeconds(currentsongs.currentTime)}  /
        ${formatSeconds(currentsongs.duration)}`
        document.querySelector(".circle").style.left = (currentsongs.currentTime / currentsongs.duration) * 100 + "%";

    })
    // add event listener to seekhbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentsongs.currentTime = ((currentsongs.duration) * percent) / 100;
    })
    // add hamburger to click the event listener
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })
    // add close button to click the event listener
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })
    // add event listener for previous
    previous.addEventListener("click", () => {
        console.log("previous clicked")

        let index = songs.indexOf(currentsongs.src.split("/").slice(-1)[0])
        if (index - 1 >= 0) {
            PlayMusic(songs[index - 1])
        }


    })
    // add event listener to nxt
    next.addEventListener("click", () => {
        console.log("next clicked")

        let index = songs.indexOf(currentsongs.src.split("/").slice(-1)[0])
        if (index + 1 < songs.length) {
            PlayMusic(songs[index + 1])
        }


    })
    // add event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting to volume", e.target.value, "/100");
        currentsongs.volume = parseInt(e.target.value) / 100;
        if (currentsongs.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replaceAll( "mute.svg", "volume.svg")

            
        }

    })
    // add event listener to mute the track 
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replaceAll("volume.svg", "mute.svg")
            currentsongs.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0 ; 

        }else{
            e.target.src = e.target.src.replaceAll( "mute.svg", "volume.svg")
            currentsongs.volume = .1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20;
        }

    })
   

}
main()

