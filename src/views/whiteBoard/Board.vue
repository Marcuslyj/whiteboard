<template>
  <div class="wrapper">
        <whiteboard v-if="$globalConf.toggleRouter" key='0' ref="board1"></whiteboard>
        <whiteboard v-if="!$globalConf.toggleRouter" key='1' ref="board2"></whiteboard>
  </div>
</template>

<script>
import { destroySocket } from '@common/socketUtil'
import bus from '@common/eventBus'
import whiteboard from './WhiteBoard'

export default {
  name: '',
  components: { whiteboard },
  beforeDestroy() {
    // 销毁socket
    destroySocket()
  },
  mounted() {
    bus.$on('resize', () => {
      // this.onRefresh()
      clearTimeout(this.timerRefresh)
      this.timerRefresh = setTimeout(() => {
        this.$nextTick(() => {
          let board = this.$refs.board1 || this.$refs.board2
          board && board.onRefresh()
        })
      }, 600)
    })
  },
}
</script>

<style lang="scss" scoped>
.wrapper {
    height: 100%;
}
</style>
