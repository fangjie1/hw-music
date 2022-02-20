import './icon'
import { Swiper } from './swiper.js'

class Player {
  constructor(node) {
    this.root = typeof node === 'string' ? document.querySelector(node) : node
    this.$ = (selector) => this.root.querySelector(selector)
    this.$$ = (selector) => this.root.querySelectorAll(selector)
    this.songList = []
    this.currentIndex = 0
    this.audio = new Audio()
    this.lyricsArr = []
    this.lyricIndex = 0
    this.start()
    this.bind()
  }
  // 获取歌曲数据
  start() {
    fetch('https://jirengu.github.io/data-mock/huawei-music/music-list.json')
      .then((res) => res.json())
      .then((data) => {
        this.songList = data
        this.audio.src = this.songList[this.currentIndex].url
        this.audio.onloadedmetadata = () =>
          (this.$('.time-end').innerText = this.formateTime(
            this.audio.duration,
          ))
        this.loadSong()
      })
  }
  bind() {
    let self = this
    this.$('.btn-play-pause').onclick = function () {
      if (this.classList.contains('playing')) {
        self.audio.pause()
        this.classList.remove('playing')
        this.classList.add('pause')
        this.querySelector('use').setAttribute('xlink:href', '#icon-play')
      } else if (this.classList.contains('pause')) {
        self.audio.play()
        this.classList.remove('pause')
        this.classList.add('playing')
        this.querySelector('use').setAttribute('xlink:href', '#icon-pause')
      }
    }
    this.$('.btn-pre').onclick = function () {
      self.playPretSong()
    }
    this.$('.btn-next').onclick = function () {
      self.playNextSong()
    }
    this.audio.ontimeupdate = function () {
      self.locateLyric()
      self.setProgressBar()
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
    this.currentIndex =
      this.currentIndex - 1 < 0
        ? this.songList.length - 1
        : this.currentIndex - 1
    this.audio.src = this.songList[this.currentIndex].url
    this.loadSong()
    this.audio.oncanplaythrough = () => this.audio.play()
  }
  // 下一首
  playNextSong() {
    this.currentIndex =
      this.currentIndex + 1 > this.songList.length - 1
        ? 0
        : this.currentIndex + 1
    this.audio.src = this.songList[this.currentIndex].url
    this.loadSong()
    this.audio.oncanplaythrough = () => this.audio.play()
  }
  // 渲染当前歌曲页面
  loadSong() {
    let songObj = this.songList[this.currentIndex]
    this.$('.header h1').innerText = songObj.title
    this.$('.header p').innerText = songObj.author + '-' + songObj.albumn
    this.audio.src = songObj.url
    this.loadLyric()
  }
  // 加载歌词
  loadLyric() {
    fetch(this.songList[this.currentIndex].lyric)
      .then((res) => res.json())
      .then((data) => {
        this.setLyrics(data.lrc.lyric)
        this.locateLyric()
      })
  }
  // 处理歌词
  setLyrics(lyrics) {
    let fragment = document.createDocumentFragment()
    let lyricsArr = []
    this.lyricsArr = lyricsArr
    lyrics
      .split(/\n/)
      .filter((str) => str.match(/\[.+?\]/))
      .forEach((line) => {
        let str = line.replace(/\[.+?\]/g, '')
        line.match(/\[.+?\]/g).forEach((t) => {
          t = t.replace(/[\[\]]/g, '')
          let milliseconds =
            parseInt(t.slice(0, 2)) * 60 * 1000 +
            parseInt(t.slice(3, 5)) * 1000 +
            parseInt(t.slice(6))
          lyricsArr.push([milliseconds, str])
        })
      })
    lyricsArr
      .filter((line) => line[1].trim() !== '')
      .sort((v1, v2) => {
        if (v1[0] < v2[0]) {
          return -1
        } else {
          return 1
        }
      })
      .forEach((line) => {
        let node = document.createElement('p')
        node.setAttribute('data-time', line[0])
        node.innerText = line[1]
        fragment.appendChild(node)
      })
    this.$('.panel-lyrics .container').innerHTML = ''
    this.$('.panel-lyrics .container').appendChild(fragment)
  }
  // 获取当前歌词的DOM
  locateLyric() {
    console.log(this.lyricsArr)
    let currentTime = this.audio.currentTime * 1000
    let nextLineTime = this.lyricsArr[this.lyricIndex][0]
    if (
      currentTime > nextLineTime &&
      this.lyricIndex < this.lyricsArr.length - 1
    ) {
      let node = this.$(
        '[data-time="' + this.lyricsArr[this.lyricIndex][0] + '"]',
      )
      if (node) this.setLineToCanter(node)
      this.$$('.panel-effect .lyrics p')[0].innerText = this.lyricsArr[
        this.lyricIndex
      ][1]
      this.$$('.panel-effect .lyrics p')[1].innerText = this.lyricsArr[
        this.lyricIndex + 1
      ][1]
      this.lyricIndex++
    }
  }
  // 歌词滚动
  setLineToCanter(node) {
    let offset = node.offsetTop - this.$('.panels .container').offsetHeight / 2
    offset = offset > 0 ? offset : 0
    this.$('.panels .container').style.transform = `translateY(${-offset}px)`
    this.$$('.container p').forEach((node) => {
      node.classList.remove('current')
    })
  }
  setProgressBar() {
    let percent = (this.audio.currentTime * 100) / this.audio.duration + '%'
    this.$('.bar .progress').style.width = percent
    this.$('.time-start').innerText = this.formateTime(this.audio.currentTime)
  }
  formateTime(secondsTotal) {
    let minutes = parseInt(secondsTotal / 60)
    minutes = minutes >= 10 ? '' + minutes : '0' + minutes
    let seconds = parseInt(secondsTotal % 60)
    seconds = seconds >= 10 ? '' + seconds : '0' + seconds
    return minutes + ':' + seconds
  }
}
new Player('#player')
