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
  </div>
</template>

<script>
import ToolBar from '@/components/toolBar/ToolBar'
import konva from 'konva'
import { initTool } from '@common/tool'

export default {
  components: {
    ToolBar
  },
  data() {
    return {
      stage: null
    }
  },
  mounted() {
    const el = document.querySelector('#board-container')
    this.$globalConf.board = this.stage = new konva.Stage({
      container: 'board-container',
      width: el.clientWidth,
      height: el.clientHeight
    })
    Object.keys(this.$globalConf.layerIds).map(layerId => {
      const layer = new konva.Layer({
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
}
</style>
