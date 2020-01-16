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
      clearTimeout(this.timerRefresh)
      this.timerRefresh = setTimeout(() => {
        let former = this.$refs.board1 || this.$refs.board2
        this.$globalConf.toggleRouter = !this.$globalConf.toggleRouter
        this.$nextTick(() => {
          former && former.$destroy()
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
