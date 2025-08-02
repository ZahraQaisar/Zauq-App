console.log("js here")
let currentNasheed = new Audio();
let currentFolder;
let nasheeds;

function secToMinSec(seconds) {
    if (isNaN(seconds || seconds < 0)) {
        return "Invalid input";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(remainingSeconds).padStart(2, '0')

    return `${formattedMinutes}:${formattedSeconds}`
}

async function getNasheeds(folder) {
    currentFolder = folder
    let a = await fetch(`http://127.0.0.1:5501/${folder}/`)

    let response = await a.text();
    // console.log(response)

    let div = document.createElement("div")
    div.innerHTML = response;

    let as = div.getElementsByTagName("a")
    nasheeds = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            nasheeds.push(element.href.split(`/${folder}/`)[1])
        }
    }
    // return nasheeds
    // showing all the nasheeds in the playlist
    let nasheedUL = document.querySelector(".nasheedList").getElementsByTagName("ul")[0]
    nasheedUL.innerHTML = ""
    for (const nasheed of nasheeds) {
        nasheedUL.innerHTML = nasheedUL.innerHTML + `<li><img class="musicside" src="images/music.png" alt="">
                                                            <div class="info" >
                                                                <div>${nasheed.replaceAll("%20", " ")}</div>
                                                                <div>Artist</div>
                                                            </div>
                                                            <div class="playnow">
                                                                <span>Play Now</span>
                                                                <img src="images/playside.png" alt="">
                                                            </div>
                                                    </li>`

    }

    // attaching an event listen to each nasheed
    Array.from(document.querySelector(".nasheedList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
}

const playMusic = (track, pause = false) => {
    // CHECK THIS LINE IF ERROR OI ADDED /
    currentNasheed.src = `${currentFolder}/` + track
    // console.log(currentNasheed.src)
    if (!pause) {
        currentNasheed.play()
        play.src = "images/pause.png"
    }
    document.querySelector(".nasheedinfo").innerHTML = track
    document.querySelector(".nasheedtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch('http://127.0.0.1:5501/nasheeds/');
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");

    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/nasheeds/")) {
            let folder = e.href.split("/").slice(-1)[0];

            let a = await fetch(`http://127.0.0.1:5501/nasheeds/${folder}/info.json`)

            let response = await a.json();
            console.log(response)

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                style="width: 40px; height: 40px; fill: rgb(17, 16, 16);">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                        <img src="nasheeds/${folder}/cover.png" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    // loading playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // console.log(item, item.currentTarget.dataset)
            nasheeds = await getNasheeds(`nasheeds/${item.currentTarget.dataset.folder}`)

        })
    })
}

async function main() {

    // getting the list of all nasheeds
    // nasheeds = await getNasheeds("nasheeds/mynasheeds2")
    await getNasheeds("nasheeds/mynasheeds")
    console.log(nasheeds)
    playMusic(nasheeds[0], true)

    // display all the albums on the page
    displayAlbums()

    // attaching an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentNasheed.paused) {
            currentNasheed.play()
            play.src = "images/pause.png"
        }
        else {
            currentNasheed.pause()
            play.src = "images/play-button.png"
        }
    })

    // listening to timeupdate event
    currentNasheed.addEventListener("timeupdate", () => {
        // console.log(currentNasheed.currentTime, currentNasheed.duration);
        document.querySelector(".nasheedtime").innerHTML = `${secToMinSec(currentNasheed.currentTime)} / ${secToMinSec(currentNasheed.duration)}`
        document.querySelector(".circle").style.left = (currentNasheed.currentTime / currentNasheed.duration) * 100 + "%";
    })

    //  adding an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100

        document.querySelector(".circle").style.left = percent + "%";
        currentNasheed.currentTime = ((currentNasheed.duration) * percent) / 100
    })

    //  adding an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    // adding an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    // adding an event listener to previous button
    previous.addEventListener("click", () => {
        console.log("Previous Clicked")
        // console.log(currentNasheed)
        let index = nasheeds.indexOf(currentNasheed.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(nasheeds[index - 1])
        }
    })

    // adding an event listener to next button
    next.addEventListener("click", () => {
        console.log("Next Clicked")
        // console.log(currentNasheed)
        let index = nasheeds.indexOf(currentNasheed.src.split("/").slice(-1)[0])
        if ((index + 1) < nasheeds.length) {
            playMusic(nasheeds[index + 1])
        }
    })

    // adding an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e, e.target, e.target.value)
        console.log("Setting volumn to:", e.target.value, " / 100")
        currentNasheed.volume = parseInt(e.target.value) / 100
    })

    // add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e =>
    {
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg") 
            currentNasheed.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg") 
            currentNasheed.volume = .1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    }
    )


}

main()