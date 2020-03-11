<template>
  <div class="wrapper" v-if="showBoard">
        <whiteboard v-if="$globalConf.toggleRouter" key='0' ref="board1"></whiteboard>
        <whiteboard v-if="!$globalConf.toggleRouter" key='1' ref="board2"></whiteboard>
  </div>
</template>

<script>
import { destroySocket } from '@common/socketUtil'
import bus from '@common/eventBus'
import { formateUrl } from '@common/utils'
import { api } from '@common/common'
import whiteboard from './WhiteBoard'

export default {
  name: '',
  components: { whiteboard },
  data() {
    return {
      showBoard: false,
    }
  },
  beforeDestroy() {
    // 销毁socket
    destroySocket()
  },
  created() {
    // 权限以及是否登录判断
    const { meetingId } = this.$route.params
    if (!meetingId) {
      return
    }
    this.$globalConf.meetingId = meetingId
    const url = formateUrl(api.auth, { meetingId })
    this.$api.get(url, {}, (res) => {
      if (res.ret.retCode === '0') {
        const { hasMeetingAuth } = res.data
        if (hasMeetingAuth) {
          this.$globalConf.user = res.data.user
          this.showBoard = true
        } else if (res.data.hasLogin) {
          this.$confirm('用户没有此会议的权限!,是否重新登录', () => {
            this.$router.push('/auth/login')
          })
        } else {
          this.$router.push(`/auth/login/${meetingId}/${window.btoa(window.location.href)}`)
        }
      } else {
        this.$Message.error(res.ret.retMsg)
      }
    })
  },
  mounted() {
    bus.$on('resize', () => {
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
