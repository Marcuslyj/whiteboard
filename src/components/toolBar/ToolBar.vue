<!--
Description
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2019-12-24 17:17:41
@version 1.0.0
-->
<template>
  <div class="toolbar">
    <!-- 工具条能否起作用的遮罩 -->
    <div
      class="mask"
      v-show="!enable"
    ></div>
    <div
      class="left part"
      v-if="isHome"
    >
      <span><i class="iconfont icon-add"></i></span>
      <span><i class="iconfont icon-boards"></i></span>
    </div>
    <div class="center">
      <ul class="group draw-tool">
        <li ref="pan-tool" @click.stop.prevent="clickPanTool">
          <i class="iconfont icon-shou"></i>
        </li>
        <li ref="select-tool" @click.stop.prevent="clickSelectTool">
          <i class="iconfont icon-select"></i>
        </li>
        <li ref="pencil-tool" @click.stop.prevent="clickPencilTool">
          <i class="iconfont icon-pen"></i>
          <div class="menu pencil" v-show="boxName === 'pencil'">
            <div class="preview-wrapper">
              <canvas id="preview-canvas"></canvas>
            </div>
            <div class="tool-control row">
              <div
                v-for="(pencilTool, index) in pencilToolArr"
                :Key="index"
                :class="{
                  'item-wrapper': true,
                  'active-item':
                    $globalConf.pencil.activePencilTool === pencilTool.name
                }"
                @click.stop.prevent="changePencilTool(pencilTool.name)"
              >
                <span><i :class="['iconfont', pencilTool.icon]"></i></span>
              </div>
            </div>
            <div class="color-control row">
              <div
                v-for="(color, index) in pencilColorArr"
                :key="index"
                :class="{
                  'item-wrapper': true,
                  'active-item': $globalConf.pencil.color === color
                }"
                @click.stop.prevent="changePencilColor(color)"
              >
                <span class="circle" :style="{ backgroundColor: color }"></span>
              </div>
            </div>
            <div class="width-control row">
              <div class="width-level">{{ $globalConf.pencil.lineWidth }}</div>
              <div
                v-for="(item, index) in widthArr"
                :key="index"
                :class="{
                  'item-wrapper': true,
                  'active-item': $globalConf.pencil.lineWidth === item.lineWidth
                }"
                @click.stop.prevent="changePencilWidth(item.lineWidth)"
              >
                <span
                  class="cirlce"
                  :style="{
                    width: `${item.width}vw`,
                    height: `${item.width}vw`,
                    'border-radius': `${item.width / 2}vw`,
                    backgroundColor: `${$globalConf.pencil.color}`
                  }"
                ></span>
              </div>
            </div>
          </div>
        </li>
        <li ref="eraser-tool" @click.stop.prevent="clickEraserTool">
          <i class="iconfont icon-eraser"></i>
          <div class="menu eraser" v-if="boxName === 'eraser'">
            <div class="row">
              <div
                v-for="(eraserTool, index) in eraserToolArr"
                :Key="index"
                :class="{
                  'item-wrapper': true,
                  'active-item':
                    $globalConf.eraser.activeEraserTool === eraserTool.name
                }"
                @click.stop.prevent="changeEraserTool(eraserTool.name)"
              >
                <span><i :class="['iconfont', eraserTool.icon]"></i></span>
              </div>
            </div>
            <div class="row width-control">
              <div class="width-level">{{ $globalConf.eraser.lineWidth }}</div>
              <div
                v-for="(item, index) in widthArr"
                :key="index"
                :class="{
                  'item-wrapper': true,
                  'active-item': $globalConf.eraser.lineWidth === item.lineWidth
                }"
                @click.stop.prevent="changeEraserWidth(item.lineWidth)"
              >
                <span
                  class="circle"
                  :style="{
                    width: `${item.width}vw`,
                    height: `${item.width}vw`,
                    'border-radius': `${item.width / 2}vw`
                  }"
                ></span>
              </div>
            </div>
          </div>
        </li>
        <li ref="text-tool" @click.stop="clickTextTool">
          <i class="iconfont icon-text"></i>
        </li>
      </ul>
      <ul class="group bussiness-tool">
        <li>
          <Upload
            :action="common.api.upload"
            accept="application/pdf"
            :format="['pdf']"
            :before-upload="beforeUpload"
            :on-success="uploadSuccess"
            :data="{ fbId: common.fbId.upload }"
            :show-upload-list="false"
          >
            <i class="iconfont icon-upload"></i>
          </Upload>
        </li>
        <li class="data-li"><i class="iconfont icon-download"></i></li>
        <li><i class="iconfont icon-file"></i></li>
        <li><i class="iconfont icon-clip"></i></li>
      </ul>
      <ul class="group other-tool">
        <li><i class="iconfont icon-houtui"></i></li>
        <li><i class="iconfont icon-qianjin"></i></li>
      </ul>
    </div>
    <div class="right part">
      <span><i class="iconfont icon-fullscreen"></i></span>
    </div>
  </div>
</template>

<script>
import { Upload, Message } from 'view-design'
import common from '@common/common'
import Vue from 'vue'


export default {
  props: {
    // 简单模式，没有左边的工具
    isHome: {
      type: Boolean,
      default: true,
    },
    enable: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    Upload,
  },
  data() {
    return {
      isActive: false,
      common,
      // 笔
      pencilColorArr: ['#333333', '#d81e06', '#f4ea2a', '#0abf53', '#1296db'],
      widthArr: [
        {
          width: 0.4,
          lineWidth: 4,
        },
        {
          width: 0.6,
          lineWidth: 8,
        },
        {
          width: 1,
          lineWidth: 14,
        },
        {
          width: 1.2,
          lineWidth: 18,
        },
        {
          width: 1.6,
          lineWidth: 26,
        },
      ],
      pencilToolArr: [
        {
          name: 'pen',
          icon: 'icon-gangbi',
        },
        {
          name: 'markPencil',
          icon: 'icon-makebi',
        },
        {
          name: 'arrow',
          icon: 'icon-arrow',
        },
      ],

      // eraserToolArr
      eraserToolArr: [
        {
          name: 'eraser',
          icon: 'icon-eraser',
        },
        {
          name: 'deleteGraphic',
          icon: 'icon-qingkong',
        },
        {
          name: 'clearBoard',
          icon: 'icon-clear',
        },
      ],
      boxName: '',
      // MsgUploading: []
    }
  },
  mounted() {
    // document.body.addEventListener('mousedown', () => {
    //   this.boxName = ''
    // })
  },
  // 关闭时销毁工具
  beforeDestroy() {
    Vue.eventBus.$emit('deactive-tool', { toolName: this.$globalConf.activeTool })
  },
  methods: {
    beforeUpload() {
      this.MsgUploading = this.MsgUploading || []
      this.MsgUploading.push(Message.loading({
        content: '上传中...',
        duration: 0,
      }))
      return true
    },
    uploadSuccess(res) {
      if (this.MsgUploading.length) this.MsgUploading.pop()()
      this.$emit('uploadSuccess', res)
    },
    changePencilTool(name, isFirst = false) {
      const stage = this.$globalConf.board
      const layer = this.$globalConf.layerManager[
        this.$globalConf.layerIds.REMARK_LAYER
      ]
      if (name !== this.$globalConf.activeTool && !isFirst) {
        Vue.eventBus.$emit('deactive-tool', { toolName: this.$globalConf.activeTool })
        this.$globalConf.activeTool = this.$globalConf.pencil.activePencilTool = name
        Vue.eventBus.$emit('active-tool', {
          toolName: this.$globalConf.activeTool,
          stage,
          layer,
        })
      } else if (isFirst) {
        Vue.eventBus.$emit('active-tool', {
          toolName: this.$globalConf.activeTool,
          stage,
          layer,
        })
      }
      this.resetCanvas()
    },
    changePencilColor(color) {
      this.$globalConf.pencil.color = color
      this.resetCanvas()
    },
    changePencilWidth(lineWidth) {
      this.$globalConf.pencil.lineWidth = lineWidth
      this.resetCanvas()
    },
    // eraser
    changeEraserTool(name) {
      if (this.$globalConf.activeTool === name) return
      const stage = this.$globalConf.board
      const layer = this.$globalConf.layerManager[
        this.$globalConf.layerIds.REMARK_LAYER
      ]
      Vue.eventBus.$emit('deactive-tool', { toolName: this.$globalConf.activeTool })
      this.$globalConf.activeTool = this.$globalConf.eraser.activeEraserTool = name
      if (name === 'eraser' || name === 'deleteGraphic') {
        Vue.eventBus.$emit('active-tool', {
          toolName: this.$globalConf.activeTool,
          stage,
          layer,
        })
      } else {
        this.$confirm('确定清除所有批注?不可撤销!', () => {
          // const layers = [
          //   layer,
          //   this.$globalConf.layerManager[this.$globalConf.layerIds.TEXT_LAYER],
          // ]
          // Vue.eventBus.$emit('active-tool', {
          //   toolName: this.$globalConf.activeTool,
          //   layers,
          // })
          this.$emit('clearBoard')
        })
      }
    },
    changeEraserWidth(lineWidth) {
      this.$globalConf.eraser.lineWidth = lineWidth
    },
    active() {
      if (this.isActive) { return }
      this.isActive = true
      this.setLiStyle('pencil-tool')
      this.changePencilTool(this.$globalConf.activeTool, true)
    },
    clickPanTool() {
      this.setLiStyle('pan-tool')
      this.setBoxName('')
      // 开启画板移动功能
      if (this.isHome) {
        const stage = this.$globalConf.board
        const layer = this.$globalConf.layerManager[
          this.$globalConf.layerIds.REMARK_LAYER
        ]
        Vue.eventBus.$emit('deactive-tool', { toolName: this.$globalConf.activeTool })
        this.$globalConf.activeTool = 'pan'
        Vue.eventBus.$emit('active-tool', {
          toolName: this.$globalConf.activeTool,
          stage,
          layer,
        })
      }
    },
    clickSelectTool() {
      this.setLiStyle('select-tool')
      this.setBoxName('')
      const stage = this.$globalConf.board
      Vue.eventBus.$emit('deactive-tool', { toolName: this.$globalConf.activeTool })
      this.$globalConf.activeTool = 'select'
      Vue.eventBus.$emit('active-tool', {
        toolName: this.$globalConf.activeTool,
        stage,
      })
    },
    clickPencilTool() {
      this.setLiStyle('pencil-tool')
      this.setBoxName('pencil')
      this.changePencilTool(this.$globalConf.pencil.activePencilTool)
    },
    clickEraserTool() {
      this.setLiStyle('eraser-tool')
      this.setBoxName('eraser')
      // 清屏不能点击就促发
      if (this.$globalConf.eraser.activeEraserTool === 'clearBoard') {
        this.$globalConf.eraser.activeEraserTool = 'eraser'
      }
      this.changeEraserTool(this.$globalConf.eraser.activeEraserTool)
    },
    clickTextTool() {
      this.setLiStyle('text-tool')
      this.setBoxName('')
      const stage = this.$globalConf.board
      const layer = this.$globalConf.layerManager[
        this.$globalConf.layerIds.TEXT_LAYER
      ]
      Vue.eventBus.$emit('deactive-tool', { toolName: this.$globalConf.activeTool })
      this.$globalConf.activeTool = 'text'
      Vue.eventBus.$emit('active-tool', {
        toolName: this.$globalConf.activeTool,
        stage,
        layer,
      })
    },
    setLiStyle(ref) {
      const el = document.querySelector('.center .activeTool')
      el && el.classList.remove('activeTool')
      this.$refs[ref].classList.add('activeTool')
    },
    setBoxName(boxName) {
      this.boxName = boxName
      console.log(this.boxName)
      Vue.eventBus.$emit('setTbMask', this.boxName !== '')
    },
    // 预览图
    resetCanvas() {
      const el = document.querySelector('#preview-canvas')
      const ctx = el.getContext('2d')
      // 获取3个点
      const start = [15, el.height / 2]
      const mid = [(el.width - 30) / 2, el.height / 2]
      let end = [el.width - 15, el.height / 2]
      ctx.strokeStyle = this.$globalConf.pencil.color
      ctx.lineWidth = this.$globalConf.pencil.lineWidth
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.clearRect(0, 0, el.width, el.height)
      let PI2
      let dx
      let dy
      let radians; let length; let width
      switch (this.$globalConf.activeTool) {
      case 'markPencil':
        ctx.beginPath()
        ctx.globalAlpha = 0.5
        ctx.moveTo(start[0], start[1])
        ctx.bezierCurveTo(start[0], start[1], mid[0], mid[1], end[0], end[1])
        ctx.stroke()
        break
      case 'pen':
        ctx.beginPath()
        ctx.globalAlpha = 1
        ctx.lineWidth = this.$globalConf.pencil.lineWidth / 2
        ctx.moveTo(start[0], start[1])
        ctx.bezierCurveTo(start[0], start[1], mid[0], mid[1], end[0], end[1])
        ctx.stroke()
        break
      case 'arrow':
        ctx.globalAlpha = 1
        ctx.beginPath()
        ctx.lineCap = 'butt'
        ctx.lineJoin = 'bevel'
        end = [el.width - 30, el.height / 2]
        ctx.moveTo(start[0], start[1])
        ctx.lineTo(end[0], end[1])
        ctx.stroke()
        ctx.save()
        PI2 = Math.PI * 2
        dx = end[0] - start[0]
        dy = end[1] - start[1]
        radians = (Math.atan2(dy, dx) + PI2) % PI2
        length = this.$globalConf.pencil.lineWidth + 30
        width = this.$globalConf.pencil.lineWidth + 30
        ctx.beginPath()
        ctx.fillStyle = this.$globalConf.pencil.color
        ctx.translate(end[0] + 15, end[1])
        ctx.rotate(radians)
        ctx.moveTo(0, 0)
        ctx.lineTo(-length, width / 2)
        ctx.lineTo(-length, -width / 2)
        ctx.fill()
        ctx.closePath()
        ctx.restore()
        break
      default:
        break
      }
    },
  },
}
</script>

<style lang="scss" src="./ToolBar.scss" scoped></style>
