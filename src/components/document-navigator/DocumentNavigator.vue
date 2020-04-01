<template>
    <div class="wrapper">
      <ul class="ul">
        <li v-for="(page,index) in pages" :key="index">
          <div class="pic-wrapper" :style="{height:picHeight}">
            <img class="pic" v-if="page.img" :src="page.img"/>
          </div>
          <div class="num-text">{{`${index+1}/${numPages}`}}</div>
        </li>
      </ul>
    </div>
</template>

<script>
import { getViewport } from '@common/tool/document'
import Vue from 'vue'

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
    }
  },
  created() {
    this.unwacher = this.$watch('pdf', function (pdf) {
      if (pdf) {
        this.pdf_ = pdf
        this.initPagesData()
      }
    }, { immediate: true })
  },
  mounted() {
    Vue.eventBus.$on('pageScroll', ({ from, to, target }) => {
      console.log(from, to, target)
    })
  },
  methods: {
    async initPagesData() {
      this.unwacher()
      this.viewport = await getViewport({
        // 指定宽度是stage的1/10
        width: this.$globalConf.board.width() / 10,
      })
      this.picHeight = `${this.viewport.height}px`
      this.numPages = this.pdf.numPages
      this.pages = Array.from({ length: this.pdf.numPages }, (v, i) => ({
        pageNum: i + 1,
        img: null,
      }))
    },
    scroll() {

    },
    getVisiblePages() {

    },
  },
}
</script>

<style lang="scss" scoped>
  .ul{
    background: #fff;
    height: 100%;
    overflow: auto;
      .pic-wrapper{
        box-sizing: border-box;
        width: 100%;
        border: 1px solid #EEE;
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
</style>
