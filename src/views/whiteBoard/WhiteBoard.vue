<!--
Description
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2019-12-24 09:34:21
@version 1.0.0
-->
<template>
  <div class="board-page">
    <section
      id="board-container"
      ref="board-container"
    ><i class="iconfont icon-jiami"></i>画板</section>
    <div class="tool-wrapper">
      <tool-bar
        ref="tool-bar"
        class="tool"
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
import ToolBar from '@/components/toolBar/ToolBar'
import Konva from 'konva'
import { initTool } from '@common/tool'

export default {
  components: {
    ToolBar
  },
  data() {
    return {
      stage: null,
      shouldConvert: false,
    }
  },
  mounted() {
    const el = document.querySelector('#board-container')
    this.$globalConf.board = this.stage = new Konva.Stage({
      container: 'board-container',
      width: el.clientWidth,
      height: el.clientHeight
    })
    Object.keys(this.$globalConf.layerIds).map(layerId => {
      const layer = new Konva.Layer({
        id: layerId
      })
      this.$globalConf.layerManager[layerId] = layer
      this.stage.add(layer)
    })
    initTool()
    this.$refs['tool-bar'].active()


    this.$root.$on('resize', () => {
      // 主屏应该重绘，并同步画布尺寸
      let width = this.$refs['board-container'].clientWidth
      let height = this.$refs['board-container'].clientHeight

      this.stage.size({
        width,
        height
      })
    })
  },
  methods: {
    // 初始化转换画板
    initConvertCanvas() {
      if (this.convertCanvas) {
        return
      }
      this.convertCanvas = new Konva.Stage({
        container: this.$refs['convertCanvas'],
      })
      this.convertCanvas.layer = new Konva.Layer()
      this.convertCanvas.add(this.convertCanvas.layer);
    },
  }
}
</script>

<style lang="scss" scoped>
.board-page {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  #board-container {
    background-color: #fff;
    flex: 1;
    margin: 10px 10px 0;
    border: 1px solid #eee;
    overflow: hidden;
  }
  .tool-wrapper {
    margin: 10px;
  }
  .convertCanvas {
    position: absolute;
    z-index: -10;
    top: 0;
    left: 0;
  }
}
</style>
