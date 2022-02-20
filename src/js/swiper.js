export class Swiper {
  constructor(node) {
    if (!node) throw new Error('需要传递需要绑定的DOM元素')
    this.root = typeof node === 'string' ? document.querySelector(node) : node
    this.eventHub = { swiperLeft: [], swiperRight: [] }
    this.bind()
  }
  bind() {
    let initX,
      newX,
      clock = null
    this.root.ontouchstart = (e) => {
      initX = e.changedTouches[0].pageX
    }
    this.root.ontouchmove = (e) => {
      if (clock) clearInterval(clock)
      clock = setTimeout(() => {
        newX = e.changedTouches[0].pageX
        if (newX - initX > 50) {
          this.eventHub['swiperRight'].forEach((fn) => fn.bind(this.root)())
        } else if (initX - newX > 50) {
          this.eventHub['swiperLeft'].forEach((fn) => fn.bind(this.root)())
        }
      }, 100)
    }
  }
  on(type, fn) {
    if (this.eventHub[type]) {
      this.eventHub[type].push(fn)
    }
  }
  off(type, fn) {
    let index = this.eventHub[type].indexOf(fn)
    if (index !== -1) {
      this.eventHub[type].splice(index, 1)
    }
  }
}
