const remote = require('electron').remote;
const dialog = remote.dialog;
const {app, nativeImage} = require('electron').remote;
const path = require('path')
const fs = require('fs')
const {ipcRenderer} = require('electron')
const ytdl = require('ytdl-core')
let imgid = 0;

const desktopPath = app.getPath('desktop');
let filePaths = fs.readdirSync(desktopPath);


function exapp() {
    var p = this.getAttribute('exepath');
    console.log(p);
    p = p.replaceAll("\\", "/");
    var k = `\"${p}\"`
    console.log(k)
    window.openApp(k);
}

function closeEvent(){
    var window = remote.getCurrentWindow();
    window.close();
}

function addIcon(){
        dialog.showOpenDialog().then(function(fileName){
            console.log(fileName);
            app.getFileIcon(fileName.filePaths[0]).then(
                (fileIcon) =>{
                    let div = document.createElement ('div');
                    let img = document.createElement ('img');
                    img.setAttribute ('src', fileIcon.toDataURL ());
                    imgid++;
                    img.id = "icon" + imgid;
                    let size = fileIcon.getSize ();
                    img.setAttribute ('width', size.width);
                    img.setAttribute ('height', size.height);
                    div.appendChild (img);
                    div.appendChild (document.createTextNode (" " + path.basename (fileName.filePaths[0])));
                    img.setAttribute('exepath', fileName.filePaths[0]);
                    document.getElementById("mainsection").appendChild(div);
                }
            )
        });
    


    
}



function test(){
    ipcRenderer.send('editmode');
}

ipcRenderer.on('editmodeon', (evt,) => {
    console.log("editmodeon")
  })

  let gMouseDownX = 0;
let gMouseDownY = 0;
let gMouseDownOffsetX = 0;
let gMouseDownOffsetY = 0;

function addListeners() {
    for(var i = 1; i <= imgid; ++i){
        console.log('icon' + i)
    document.getElementById('icon' + i).addEventListener('mousedown', mouseDown, false);
    }
    window.addEventListener('mouseup', mouseUp, false);
    document.getElementsByClassName('wrapper')[0].addEventListener('mousedown',mouseDown,false);
}

function removeListeners(){
    for(var i = 1; i <= imgid; ++i){
        document.getElementById('icon' + i).removeEventListener('mousedown', mouseDown,false);
        document.getElementById('icon' + i).addEventListener('click',exapp);
    }
    document.getElementsByClassName('wrapper')[0].removeEventListener('mousedown',mouseDown,false);
}

function mouseUp() {
    window.removeEventListener('mousemove', divMove, true);
}

function mouseDown(e) {
    
    gMouseDownX = e.clientX;
    gMouseDownY = e.clientY;

    var div = document.getElementById(e.target.id);

    //The following block gets the X offset (the difference between where it starts and where it was clicked)
    let leftPart = "";
    if(!div.style.left)
        leftPart+="0px";    //In case this was not defined as 0px explicitly.
    else
        leftPart = div.style.left;
    let leftPos = leftPart.indexOf("px");
    let leftNumString = leftPart.slice(0, leftPos); // Get the X value of the object.
    gMouseDownOffsetX = gMouseDownX - parseInt(leftNumString,10);

    //The following block gets the Y offset (the difference between where it starts and where it was clicked)
    let topPart = "";
    if(!div.style.top)
        topPart+="0px";     //In case this was not defined as 0px explicitly.
    else
        topPart = div.style.top;
    let topPos = topPart.indexOf("px");
    let topNumString = topPart.slice(0, topPos);    // Get the Y value of the object.
    gMouseDownOffsetY = gMouseDownY - parseInt(topNumString,10);



    window.addEventListener('mousemove', divMove, true);
    window.myParam = e.target.id
}



function divMove(e){
    console.log(e.currentTarget.myParam)
    var div = document.getElementById(e.currentTarget.myParam);
    div.style.position = 'absolute';
    let topAmount = e.clientY;
    div.style.top = topAmount + 'px';
    let leftAmount = e.clientX;
    div.style.left = leftAmount + 'px';
    

    
}

function al(){
    addListeners();
}

function rl(){
    removeListeners();
}


var wrapper, 
musicImg, 
musicName,
playPauseBtn,
prevBtn, 
nextBtn,
mainAudio,
progressArea, 
progressBar,
musicList,
moreMusicBtn,
closemoreMusic;

const savePath = path.join("save");
const saveFileName = path.join(savePath, "playlist");


let allMusic = JSON.parse(fs.readFileSync(saveFileName).toString());
console.log(allMusic)

let musicIndex = 1;
isMusicPaused = true;

function addMusic(){
  let musicplayer = `<div class="wrapper" id="wrapper" style="position:absolute">
  <div class="top-bar">
    <span>Now Playing</span>
  </div>
  <div class="img-area">
    <img src="" alt="">
  </div>
  <div class="song-details">
    <p class="name"></p>
    <p class="artist"></p>
  </div>
  <div class="progress-area">
    <div class="progress-bar">
      <audio id="main-audio" src=""></audio>
    </div>
    <div class="song-timer">
      <span class="current-time">0:00</span>
      <span class="max-duration">0:00</span>
    </div>
  </div>
  <div class="controls">
    <div id="repeat-plist" class="" title="Playlist looped">r</div>
    <div id="prev" class="">s</div>
    <div class="play-pause">
      <div class=" play">▶</div>
    </div>
    <div id="next" class="">s</div>
    <div id="more-music" class="">q</div>
  </div>
  <div class="music-list">
    <div class="header">
      <div class="row">
        <div class= "list ">q</div>
        <span>Music list</span>
      </div>
      <div id="close" class="">c</div>
    </div>
    <ul>
      <!-- here li list are coming from js -->
    </ul>
    <input type="text" id="MusicLink" name="MusicLink"><div onclick="musicadd()">추가</div>
  </div>
</div>`
 

document.getElementById("mainsection").insertAdjacentHTML("beforeend", musicplayer);

wrapper = document.querySelector(".wrapper"),
musicImg = wrapper.querySelector(".img-area img"),
musicName = wrapper.querySelector(".song-details .name"),
playPauseBtn = wrapper.querySelector(".play-pause"),
prevBtn = wrapper.querySelector("#prev"),
nextBtn = wrapper.querySelector("#next"),
mainAudio = wrapper.querySelector("#main-audio"),
progressArea = wrapper.querySelector(".progress-area"),
progressBar = progressArea.querySelector(".progress-bar"),
musicList = wrapper.querySelector(".music-list"),
moreMusicBtn = wrapper.querySelector("#more-music"),
closemoreMusic = musicList.querySelector("#close");

mainAudio.volume = 0.05;
  loadMusic(musicIndex);
  playingSong(); 



const ulTag = wrapper.querySelector("ul");
// let create li tags according to array length for list
for (let i = 0; i < allMusic.length; i++) {
  //let's pass the song name, artist from the array
  let liTag = `<li li-index="${i + 1}">
                <div class="row">
                  <span>${allMusic[i].name}</span>
                  <p>${allMusic[i].artist}</p>
                </div>
                <span id="${allMusic[i].src}" class="audio-duration">3:40</span>
                <audio class="${allMusic[i].src}" src="songs/${allMusic[i].src}.mp3"></audio>
              </li>`;
  ulTag.insertAdjacentHTML("beforeend", liTag); //inserting the li inside ul tag


  let liAudioDuartionTag = ulTag.querySelector(`#${allMusic[i].src}`);
  let liAudioTag = ulTag.querySelector(`.${allMusic[i].src}`);
  liAudioTag.addEventListener("loadeddata", ()=>{
    let duration = liAudioTag.duration;
    let totalMin = Math.floor(duration / 60);
    let totalSec = Math.floor(duration % 60);
    if(totalSec < 10){ //if sec is less than 10 then add 0 before it
      totalSec = `0${totalSec}`;
    };
    liAudioDuartionTag.innerText = `${totalMin}:${totalSec}`; //passing total duation of song
    liAudioDuartionTag.setAttribute("t-duration", `${totalMin}:${totalSec}`); //adding t-duration attribute with total duration value
  });

  
}



// play or pause button event
playPauseBtn.addEventListener("click", ()=>{
  const isMusicPlay = wrapper.classList.contains("paused");
  //if isPlayMusic is true then call pauseMusic else call playMusic
  isMusicPlay ? pauseMusic() : playMusic();
  playingSong();
});

//prev music button event
prevBtn.addEventListener("click", ()=>{
  prevMusic();
});

//next music button event
nextBtn.addEventListener("click", ()=>{
  nextMusic();
});

// update progress bar width according to music current time
mainAudio.addEventListener("timeupdate", (e)=>{
  const currentTime = e.target.currentTime; //getting playing song currentTime
  const duration = e.target.duration; //getting playing song total duration
  let progressWidth = (currentTime / duration) * 100;
  progressBar.style.width = `${progressWidth}%`;

  let musicCurrentTime = wrapper.querySelector(".current-time"),
  musicDuartion = wrapper.querySelector(".max-duration");
  mainAudio.addEventListener("loadeddata", ()=>{
    // update song total duration
    let mainAdDuration = mainAudio.duration;
    let totalMin = Math.floor(mainAdDuration / 60);
    let totalSec = Math.floor(mainAdDuration % 60);
    if(totalSec < 10){ //if sec is less than 10 then add 0 before it
      totalSec = `0${totalSec}`;
    }
    musicDuartion.innerText = `${totalMin}:${totalSec}`;
  });
  // update playing song current time
  let currentMin = Math.floor(currentTime / 60);
  let currentSec = Math.floor(currentTime % 60);
  if(currentSec < 10){ //if sec is less than 10 then add 0 before it
    currentSec = `0${currentSec}`;
  }
  musicCurrentTime.innerText = `${currentMin}:${currentSec}`;
});

// update playing song currentTime on according to the progress bar width
progressArea.addEventListener("click", (e)=>{
  let progressWidth = progressArea.clientWidth; //getting width of progress bar
  let clickedOffsetX = e.offsetX; //getting offset x value
  let songDuration = mainAudio.duration; //getting song total duration
  
  mainAudio.currentTime = (clickedOffsetX / progressWidth) * songDuration;
  playMusic(); //calling playMusic function
  playingSong();
});

//change loop, shuffle, repeat icon onclick
const repeatBtn = wrapper.querySelector("#repeat-plist");
repeatBtn.addEventListener("click", ()=>{
  let getText = repeatBtn.innerText; //getting this tag innerText
  switch(getText){
    case "repeat":
      repeatBtn.innerText = "repeat_one";
      repeatBtn.setAttribute("title", "Song looped");
      break;
    case "repeat_one":
      repeatBtn.innerText = "shuffle";
      repeatBtn.setAttribute("title", "Playback shuffled");
      break;
    case "shuffle":
      repeatBtn.innerText = "repeat";
      repeatBtn.setAttribute("title", "Playlist looped");
      break;
  }
});

//code for what to do after song ended
mainAudio.addEventListener("ended", ()=>{
  // we'll do according to the icon means if user has set icon to
  // loop song then we'll repeat the current song and will do accordingly
  let getText = repeatBtn.innerText; //getting this tag innerText
  switch(getText){
    case "repeat":
      nextMusic(); //calling nextMusic function
      break;
    case "repeat_one":
      mainAudio.currentTime = 0; //setting audio current time to 0
      loadMusic(musicIndex); //calling loadMusic function with argument, in the argument there is a index of current song
      playMusic(); //calling playMusic function
      break;
    case "shuffle":
      let randIndex = Math.floor((Math.random() * allMusic.length) + 1); //genereting random index/numb with max range of array length
      do{
        randIndex = Math.floor((Math.random() * allMusic.length) + 1);
      }while(musicIndex == randIndex); //this loop run until the next random number won't be the same of current musicIndex
      musicIndex = randIndex; //passing randomIndex to musicIndex
      loadMusic(musicIndex);
      playMusic();
      playingSong();
      break;
  }
});

//show music list onclick of music icon
moreMusicBtn.addEventListener("click", ()=>{
  musicList.classList.toggle("show");
});
closemoreMusic.addEventListener("click", ()=>{
  moreMusicBtn.click();
});


}

// -------------------





/*window.addEventListener("load", ()=>{
    mainAudio.volume = 0.05;
  loadMusic(musicIndex);
  playingSong(); 
});*/

function loadMusic(indexNumb){
  musicName.innerText = allMusic[indexNumb - 1].name;
  musicImg.src = `${allMusic[indexNumb-1].img}`;
  mainAudio.src = `songs/${allMusic[indexNumb - 1].src}.mp3`;
}

//play music function
function playMusic(){
  wrapper.classList.add("paused");
  playPauseBtn.querySelector("div").innerText = "⏸";
  mainAudio.play();
}

//pause music function
function pauseMusic(){
  wrapper.classList.remove("paused");
  playPauseBtn.querySelector("div").innerText = "▶";
  mainAudio.pause();
}

//prev music function
function prevMusic(){
  musicIndex--; //decrement of musicIndex by 1
  //if musicIndex is less than 1 then musicIndex will be the array length so the last music play
  musicIndex < 1 ? musicIndex = allMusic.length : musicIndex = musicIndex;
  loadMusic(musicIndex);
  playMusic();
  playingSong(); 
}

//next music function
function nextMusic(){
  musicIndex++; //increment of musicIndex by 1
  //if musicIndex is greater than array length then musicIndex will be 1 so the first music play
  musicIndex > allMusic.length ? musicIndex = 1 : musicIndex = musicIndex;
  loadMusic(musicIndex);
  playMusic();
  playingSong(); 
}





//play particular song from the list onclick of li tag
function playingSong(){
  const ulTag = wrapper.querySelector("ul");
  const allLiTag = ulTag.querySelectorAll("li");
  
  for (let j = 0; j < allLiTag.length; j++) {
    let audioTag = allLiTag[j].querySelector(".audio-duration");
    
    if(allLiTag[j].classList.contains("playing")){
      allLiTag[j].classList.remove("playing");
      let adDuration = audioTag.getAttribute("t-duration");
      audioTag.innerText = adDuration;
    }

    //if the li tag index is equal to the musicIndex then add playing class in it
    if(allLiTag[j].getAttribute("li-index") == musicIndex){
      allLiTag[j].classList.add("playing");
      audioTag.innerText = "Playing";
    }


    allLiTag[j].setAttribute("onclick", "clicked(this)");

  }

  fs.writeFileSync(saveFileName, JSON.stringify(allMusic));
}

//particular li clicked function
function clicked(element){
  console.log("click this");
  let getLiIndex = element.getAttribute("li-index");
  musicIndex = getLiIndex; //updating current song index with clicked li index
  loadMusic(musicIndex);
  playMusic();
  playingSong();
}

async function musicadd(){
  let musiclink = document.getElementById('MusicLink').value
  const dl = ytdl(musiclink,{filter:'audioonly'});
  var len = allMusic.length + 1
  const writeStream = fs.createWriteStream(`songs/music-${len}.mp3`)
  dl.pipe(writeStream);
  const musicinfo = await ytdl.getBasicInfo(musiclink);
  console.log(musicinfo.videoDetails.thumbnails)
  allMusic.push({
    name: musicinfo.videoDetails.title,
    img: musicinfo.videoDetails.thumbnails[4].url,
    src: `music-${len}`
  })


  let liTag = `<li li-index="${len}">
                <div class="row">
                  <span>${allMusic[len-1].name}</span>
                  <p>${allMusic[len-1].artist}</p>
                </div>
                <span id="${allMusic[len-1].src}" class="audio-duration">3:40</span>
                <audio class="${allMusic[len-1].src}" src="songs/${allMusic[len-1].src}.mp3"></audio>
              </li>`;
  ulTag.insertAdjacentHTML("beforeend", liTag); //inserting the li inside ul tag

  let liAudioDuartionTag = ulTag.querySelector(`#${allMusic[len-1].src}`);
  let liAudioTag = ulTag.querySelector(`.${allMusic[len-1].src}`);
  liAudioTag.addEventListener("loadeddata", ()=>{
    let duration = liAudioTag.duration;
    let totalMin = Math.floor(duration / 60);
    let totalSec = Math.floor(duration % 60);
    if(totalSec < 10){ //if sec is less than 10 then add 0 before it
      totalSec = `0${totalSec}`;
    };
    liAudioDuartionTag.innerText = `${totalMin}:${totalSec}`; //passing total duation of song
    liAudioDuartionTag.setAttribute("t-duration", `${totalMin}:${totalSec}`); //adding t-duration attribute with total duration value
  });
  playingSong();
}

