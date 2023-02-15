/**
 * 1. Render songs
 * 2. Scroll top
 * 3. play/ pause
 * 4. cd rotate 
 * 5. next / prev
 * 6. ramdom
 * 7. next/ repeat when ended
 * 8. active song
 * 9. Scroll active song into view
 * 10. play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('audio');
const playBtn = $('.btn-toggle-play');
const playSong = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const ramdomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const indexSong = $('.song');
const playList = $('.playlist');

const PLAY_STORAGE_KEY = 'HUNG_DOAN';

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRamdom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAY_STORAGE_KEY)) || {},
    songs: [
        /** 
         setConfig = function(key, value) {
             this.config[key] = value;
             localStorage.setItem(PLAY_STORAGE_KEY, JSON.stringify(this.config));
            },
            */ 
        {
            name: 'song1',
            singer: 'cs1',
            path: '../assets/music/song1.mp3',
            image: '../assets/img/song1.jpeg'
        },
        {
            name: 'song2',
            singer: 'cs2',
            path: '../assets/music/song2.mp3',
            image: '../assets/img/song2.jpeg'
        },
        {
            name: 'song3',
            singer: 'cs3',
            path: '../assets/music/song3.mp3',
            image: '../assets/img/song3.jpeg'
        },
        {
            name: 'song4',
            singer: 'cs4',
            path: '../assets/music/song4.mp3',
            image: '../assets/img/song4.jpeg'
        },
        {
            name: 'song5',
            singer: 'cs5',
            path: '../assets/music/song5.mp3',
            image: '../assets/img/song5.jpeg'
        }

    ],
    render: function () {
        const htmls = this.songs.map((song, index) => {
          return `
                            <div class="song ${index === this.currentIndex ? "active" : ""}" data-index="${index}">
                                <div class="thumb"
                                    style="background-image: url('${song.image}')">
                                </div>
                                <div class="body">
                                    <h3 class="title">${song.name}</h3>
                                    <p class="author">${song.singer}</p>
                                </div>
                                <div class="option">
                                    <i class="fas fa-ellipsis-h"></i>
                                </div>
                            </div>
                        `;
        });
        $('.playlist').innerHTML = htmls.join('')
    },
    handleEvent: function () {
        const cd = $('.cd');
        const cdWidth = cd.offsetWidth;

        // Xử lý cd quay và dừng
        const cdThumbAnimate = cdThumb.animate([
            {
                transform: 'rotate(360deg)'
            }
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()
        // xử lý phóng to / thu nhỏ

        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newcdWidth = cdWidth - scrollTop;
            cd.style.width = newcdWidth > 0 ? newcdWidth + 'px' : 0;
            cd.style.opacity = newcdWidth / cdWidth;
        };
        // xử lý click pause
        playBtn.onclick = function () {
            if (app.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        // active song

        // khi song play
        audio.onplay = function () {
            app.isPlaying = true;
            playSong.classList.add('playing');
            cdThumbAnimate.play();
            app.render();
        }

        // khi song pause
        audio.onpause = function () {
            app.isPlaying = false;
            playSong.classList.remove('playing');
            cdThumbAnimate.pause();
            app.render();
            app.scrollToActiveSong();

        }

        // Khi tiến độ thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
            app.scrollToActiveSong();
        }
        // khi  tua song
        progress.onchange = function (e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }
        // khi next song
        nextBtn.onclick = function(){
            if(app.isRamdom){
                app.ramdomSong();
            }else{
                app.nextSong();
            }
            audio.play();
        }
        // khi back song
        prevBtn.onclick = function(){
            if(app.isRamdom){
                app.ramdomSong();
            }else{
                app.backSong();
            }
            audio.play();
        }
        // khi song ngẫu nhiên
        ramdomBtn.onclick = function () {
            app.isRamdom = !app.isRamdom;
            ramdomBtn.classList.toggle('active', app.isRamdom);
            
        }
        // khi lặp một bài
        repeatBtn.onclick = function(){
            app.isRepeat = !app.isRepeat;
            repeatBtn.classList.toggle('active', app.isRepeat);
            
        }
        // xử lý phát tiếp khi ended
        audio.onended = function(){
            if(app.isRepeat){
                audio.play();
            }else{
                nextBtn.click()
                
            }
        }
        playList.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)');
            if(songNode|| e.target.closest('.option')){
                if (songNode){
                    app.currentIndex = Number(songNode.getAttribute('data-index'));
                    app.loadCurrentSong();
                    app.render();
                    audio.play();
                }
                if(e.target.closest('.option')){

                }
            }
        }
    },
        defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            },
        })
    },
        loadCurrentSong: function () {

        heading.textContent = this.currentSong.name;
        audio.src = this.currentSong.path;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
       
    },
        loadConfig: function () {
            this.isRamdom = this.config.isRamdom;
            this.isRepeat = this.config.isRepeat;

    },
        nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
        backSong: function () {
            this.currentIndex--;
            if (this.currentIndex < 0) {
                this.currentIndex = this.songs.length - 1;
            }
        this.loadCurrentSong();
        },
        ramdomSong: function () {
            do{
             var newIndexRamdom = Math.floor(Math.random() * this.songs.length)
            }while(newIndexRamdom === this.currentIndex)
            this.currentIndex   = newIndexRamdom
            this.loadCurrentSong();
        },
        repeatSong: function () {

        },
        scrollToActiveSong: function () {
            setTimeout(()=> {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                    
                })
            }, 500)
        },
    start: function () {
        // gán cấu hình từ config vào app
        this.loadConfig();
        // định nghĩa các thuộc tính Object
        this.defineProperties();
        // lắng nghe xử lý các sự kiện dom
        this.handleEvent();
        // load bai bat
        this.loadCurrentSong();
        // render playList
        this.render();
        // hiển thị trạng thái ban đầu app
    },
}
app.start();