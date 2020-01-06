<!--
Description
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2019-12-24 09:34:21
@version 1.0.0
-->
<template>
  <div class="board-page">
    <section class="board-container-wrapper">
    <div id="board-container"
      ref="board-container">
    </div>
    <!-- 用于工具条menu 关闭遮罩 -->
    <div class="tool-box-mask" v-if="tbMask" @click="clickTbMask"></div>
    </section>
    <div class="tool-wrapper">
      <tool-bar
        ref="tool-bar"
        class="tool"
        @uploadSuccess="uploadSuccess"
      ></tool-bar>
    </div>
    <!-- 用于转换图片 -->
    <div
      v-if="shouldConvert"
      ref="convertCanvas"
      class="convertCanvas"
    ></div>
  </div>
</template>

<script>
import { Message } from 'view-design'
import Konva from 'konva'
import { initTool } from '@common/tool'
import { addCover, loadPdf } from '@common/tool/document'
import bus from '@common/eventBus'
import { socket } from '@common/socketUtil'
import { socketEvent } from '@common/common'
import Vue from 'vue'
import ToolBar from '@/components/toolBar/ToolBar'
// import pdfjsLib from 'pdfjsLib'
// import common from '@common/common'

export default {
  components: {
    ToolBar,
  },
  data() {
    return {
      stage: null,
      shouldConvert: false,
      convertCanvas: null,
      tbMask: false,
    }
  },
  created() {
    // const { socket } = socketUtil
    socket.on(socketEvent.joinMeet, (res) => {

    })
  },
  mounted() {
    const el = document.querySelector('#board-container')
    this.$globalConf.board = this.stage = new Konva.Stage({
      container: 'board-container',
      width: el.clientWidth,
      height: el.clientHeight,
    })
    Object.keys(this.$globalConf.layerIds).map((layerId) => {
      const layer = new Konva.Layer({
        id: layerId,
      })
      this.$globalConf.layerManager[layerId] = layer
      this.$globalConf.layerManager.BG_LAYER.listening(false)
      this.stage.add(layer)
    })
    initTool()
    this.$refs['tool-bar'].active()
    Vue.eventBus.$on('setTbMask', (visible) => {
      this.tbMask = visible
    })


    bus.$on('resize', () => {
      // 主屏应该重绘，并同步画布尺寸
      if (this.$refs['board-container']) {
        const width = this.$refs['board-container'].clientWidth
        const height = this.$refs['board-container'].clientHeight

        this.stage.size({
          width,
          height,
        })
      }
    })
  },
  methods: {
    // 初始化转换画板
    initConvertCanvas() {
      if (this.convertCanvas) {
        return
      }
      this.convertCanvas = new Konva.Stage({
        container: this.$refs.convertCanvas,
      })
      this.convertCanvas.layer = new Konva.Layer()
      this.convertCanvas.add(this.convertCanvas.layer)
    },
    // 文档上传成功
    async uploadSuccess({ data, ret }) {
      if (Number(ret.retCode) === 0) {
        this.Msgloading = this.Msgloading || []
        this.Msgloading.push(Message.loading({
          content: '读取中...',
          duration: 0,
        }))
        // let filePath = common.fileService + data.filePath
        // let pdf = await pdfjsLib.getDocument(filePath).promise
        const pdf = await loadPdf({ url: data.filePath })

        this.shouldConvert = true

        this.$nextTick(() => {
          this.initConvertCanvas()
          if (this.Msgloading.length) this.Msgloading.pop()()

          addCover(pdf, {
            stage: this.stage,
            layer: this.$globalConf.layerManager[this.$globalConf.layerIds.BG_LAYER],
            convertCanvas: this.convertCanvas,
          })
        })
      }
    },
    // 点击画板，弹窗消失
    clickTbMask() {
      this.$refs['tool-bar'].boxName = ''
      this.tbMask = false
    },
  },
}
</script>

<style lang="scss" scoped>
.board-page {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  /deep/ {
    canvas {
      transform: translateZ(0);
    }
  }
  .board-container-wrapper {
    background-color: #fff;
    flex: 1;
    margin: 10px 10px 0;
    border: 1px solid #eee;
    overflow: hidden;
    position: relative;
    #board-container{
      position:relative;
      z-index:10;
      width:100%;
      height:100%;
    }
    .tool-box-mask{
      position: absolute;
      top:0;
      left:0;
      width:100%;
      height:100%;
      z-index: 11;
    }
  }
  .tool-wrapper {
    position: relative;
    margin: 10px;
    z-index:12;
  }
  .convertCanvas {
    width: 10px;
    height: 10px;
    overflow: hidden;
    position: absolute;
    z-index: -10;
    top: 0;
    left: 0;
  }
}
</style>
