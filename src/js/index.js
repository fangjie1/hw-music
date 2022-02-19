import './icon'
import { Swiper} from './swiper.js'

class Player {
  constructor(node){
    this.root = typeof node === 'string' ? document.querySelector(node) : node
    this.$ = selector => this.root.querySelector(selector)
    this.$$ = selector => this.root.querySelectorAll(selector)
    this.songList = []
    this.currentIndex = 0
    this.audio = new Audio()

    this.start()
    this.bind()
  }
  start(){
    fetch('https://jirengu.github.io/data-mock/huawei-music/music-list.json').then(res=>  res.json())
    .then(data=>{
      this.songList=data
      console.log(this.songList);
      this.audio.src = this.songList[this.currentIndex].url
      this.loadSong()
    })
  }
  bind(){
    let self=this
    this.$('.btn-play-pause').onclick=function(){
      if(this.classList.contains('playing')){
        self.audio.pause()
        this.classList.remove('playing')
        this.classList.add('pause')
        this.querySelector('use').setAttribute('xlink:href', '#icon-play')
      } else if (this.classList.contains('pause')){
        self.audio.play()
        this.classList.remove('pause')
        this.classList.add('playing')
        this.querySelector('use').setAttribute('xlink:href', '#icon-pause')
      }
    }
    this.$('.btn-pre').onclick=function(){
      self.playPretSong()
    }
    this.$('.btn-next').onclick = function () {
      self.playNextSong()
    }
 
    let swiper = new Swiper(this.$('.panels'))
    swiper.on('swiperLeft', function () {
      this.classList.add('panels1')
    })

    swiper.on('swiperRight', function () {
      this.classList.remove('panels1')
    })
  }
  // 上一首
  playPretSong() {
    this.currentIndex = this.currentIndex - 1 < 0 ? this.songList.length - 1 : this.currentIndex - 1 
    this.audio.src = this.songList[this.currentIndex].url
    this.loadSong()
    this.audio.oncanplaythrough = () => this.audio.play()
  }
  // 下一首
  playNextSong () {
    this.currentIndex = this.currentIndex + 1 > this.songList.length - 1 ? 0 : this.currentIndex + 1 
    this.audio.src = this.songList[this.currentIndex].url
    this.loadSong()
    this.audio.oncanplaythrough = () => this.audio.play()
  } 
  // 渲染当前歌曲页面
  loadSong () {
    let songObj = this.songList[this.currentIndex]
    this.$('.header h1').innerText = songObj.title
    this.$('.header p').innerText = songObj.author + '-' + songObj.albumn
    this.audio.src = songObj.url
    this.loadLyric()
  }
  // 加载歌词
  loadLyric () {
    fetch(this.songList[this.currentIndex].lyric)
      .then(res => res.json())
  }


}
new Player('#player')