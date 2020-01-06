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
    }
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
    #board-container{
      position:relative;
      z-index:10;
      width:100%;
      height:100%;
      /deep/ .konvajs-content{
        transition: opacity 0.5s;
        opacity: 1;
        &.invisible{
          opacity: 0;
        }
      }
    }
  }
  .tool-wrapper {
    margin: 10px;
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
