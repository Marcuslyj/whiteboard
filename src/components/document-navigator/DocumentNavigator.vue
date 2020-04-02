<template>
  <transition name="fade">
    <div class="wrapper" v-show="showNavigator" :class="{'zHide': zHide}" @mouseenter="enter" @mouseleave="out">
      <ul class="ul" ref="ul" @scroll="ulScroll">
        <li v-for="(page,index) in pages" :key="index" ref="page-item">
          <div class="pic-wrapper" :style="{height:picHeight}" :class="{'active': activeIndex===index}" @click="goPage(index+1)">
            <img class="pic" v-if="page.img" :src="page.img" />
          </div>
          <div class="num-text">{{`${index+1}/${numPages}`}}</div>
        </li>
      </ul>
    </div>
  </transition>
</template>

<script>
import { getViewport, getConvertImage } from '@common/tool/document'
import Vue from 'vue'
import { throttle } from 'throttle-debounce'

export default {
  name: '',
  //   pdfjs获取到的对象
  props: ['pdf'],
  data() {
    return {
      pdf_: this.pdf,
      pages: [],
      viewport: null,
      numPages: 1,
      picHeight: '0px',
      visibleCount: 1,
      rendered: {},
      waitToRender: null,
      activeIndex: 0,
      //
      itemHeight: 1,
      showNavigator: false,
      zHide: false,
    }
  },
  created() {
    let unwacher = this.$watch('pdf', function (pdf) {
      if (pdf) {
        this.pdf_ = pdf
        this.initPagesData()
        if (unwacher) unwacher()
      }
    }, { immediate: true })
  },
  mounted() {
    Vue.eventBus.$on('pageScroll', ({ from, to, target }) => {
      if (this.pdf_) {
        this.showNavigator = true
        clearTimeout(this.timerNavigator)
        this.timeoutHide()
        this.scroll({ from, to, target })
      } else {
        this.waitToRender = { from, to, target }
      }
    })
  },
  beforeDestroy() {
    Vue.eventBus.$off('pageScroll')
  },
  methods: {
    enter() {
      clearTimeout(this.timerNavigator)
      this.showNavigator = true
    },
    timeoutHide() {
      clearTimeout(this.timerNavigator)
      this.timerNavigator = setTimeout(() => {
        this.showNavigator = false
      }, 1500)
    },
    out() {
      this.timeoutHide()
    },
    async initPagesData() {
      this.viewport = await getViewport({
        // 指定宽度是stage的1/10
        width: this.$globalConf.board.width() / 10,
      })
      this.picHeight = `${this.viewport.height}px`
      this.numPages = this.pdf.numPages
      this.visibleCount = Math.ceil(this.$globalConf.board.height() / this.viewport.height)
      this.pages = Array.from({ length: this.pdf.numPages }, (v, i) => ({
        pageNum: i + 1,
        img: null,
      }))

      // display none 元素高度是0
      this.zHide = true
      this.$nextTick(() => {
        // 计算itemHeight
        this.itemHeight = this.$refs['page-item'][0].clientHeight
        this.zHide = false

        this.$refs['page-item'][0].style
        this.visibleCount = Math.ceil(this.$globalConf.board.height() / this.itemHeight)
        if (this.waitToRender) {
          this.scroll(this.waitToRender)
          this.waitToRender = null
        }
      })
    },
    scroll({ from, to, target }) {
      if (target) {
        this.activeIndex = target - 1
        // 滚动
        let { ul } = this.$refs
        if (ul) {
          let top = (target - 1) * this.itemHeight - this.$globalConf.board.height() * 0.5 + 0.5 * this.itemHeight
          ul.scrollTop = top
        }
      }

      let pages = this.getVisiblePages({ from, to, target })
      this.render({ from: pages.shift(), to: pages.pop() })
    },
    getVisiblePages({ from, to }) {
      // 实际页码，最小1
      let pages = []
      for (let i = from; i <= to; i++) {
        pages.push(i)
      }

      let flag = true
      while (flag) {
        if (pages.length < this.numPages && pages.length < this.visibleCount) {
          if (from > 1) {
            from--
            pages.unshift(from)
          }
          if (to < this.numPages) {
            to++
            pages.push(to)
          }
        } else {
          flag = false
        }
      }
      return pages
    },
    async render({ from, to }) {
      if (from <= to) {
        if (!this.rendered[from]) {
          this.rendered[from] = 1
          try {
            let imgUrl = await getConvertImage({
              pdf: this.pdf_,
              pageIndex: from,
              viewport: this.viewport,
              type: 'url',
            })
            this.pages[from - 1].img = imgUrl
          } catch (error) {
            this.rendered[from] = null
          }
        }
        from++
        this.render({ from, to })
      }
    },
    ulScroll: throttle(300, function () {
      if (this.itemHeight > 0) {
        let { scrollTop } = this.$refs.ul
        let from = Math.ceil(scrollTop / this.itemHeight)
        from = Math.max(from, 1)
        let to = from + this.visibleCount - 1
        to = Math.min(to, this.numPages)
        this.scroll({ from, to })
      }
    }),
    goPage(pageNum) {
      Vue.eventBus.$emit('goPage', pageNum)
    },
  },
}
</script>

<style lang="scss" scoped>
.zHide{
  z-index: -99;
  display: inline-block !important;
}
.wrapper{
  .ul{
    background: #fff;
    height: 100%;
    overflow: auto;
      .pic-wrapper{
        box-sizing: border-box;
        width: 100%;
        border: 1px solid #EEE;
        cursor: pointer;
        &.active{
          border-color: #2196f3;
          border-width: 2px;
        }
        &:not(.active):hover{
          border-color: #2196f3;
          // border-width: 2px;
        }
        .pic{
          box-sizing: border-box;
          width:100%;
          height:100%;
        }
    }
  }

  .num-text{
    text-align: center;
    font-size: .6vw;
  }
}

</style>
