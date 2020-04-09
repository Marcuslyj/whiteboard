<template>
  <div class="wrapper" v-if="showBoard">
        <div class="toolbar-right">
          <span @click="goHome">
            <i class="iconfont icon-zhuye"></i>
          </span>
          <span v-if="$globalConf.mode==='document' && $globalConf.speakerPermission" @click="savePostil">
            <i class="iconfont icon-save"></i>
          </span>
          <span @click="handleFullscreen">
            <i class="iconfont" :class="[`icon-${$globalConf.isFullscreen ? 'normalscreen' : 'fullscreen'}`]"></i>
          </span>
        </div>
        <whiteboard v-if="$globalConf.toggleRouter" key='0' ref="board1"></whiteboard>
        <whiteboard v-if="!$globalConf.toggleRouter" key='1' ref="board2"></whiteboard>
  </div>
</template>

<script>
import { destroySocket } from '@common/socketUtil'
import Vue from 'vue'
import { api } from '@common/common'
import {
  formateUrl, fullscreen, exitFullscreen,
} from '@common/utils'
import whiteboard from './WhiteBoard'

export default {
  name: '',
  components: { whiteboard },
  data() {
    return {
      showBoard: false,
      timerSavePostil: null,
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
          this.$globalConf.user = {
            ...this.$globalConf.user,
            ...res.data.user,
          }
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
    // 第一次打开就是文档
    setTimeout(() => {
      if (this.$globalConf.mode === 'document') {
        // 打开文档默认手掌
        this.$globalConf.activeTool = 'pan'
        console.log('set')
      }
    }, 1000)
    Vue.eventBus.$on('resize', () => {
      clearTimeout(this.timerRefresh)
      this.timerRefresh = setTimeout(() => {
        this.$nextTick(() => {
          let board = this.$refs.board1 || this.$refs.board2
          board && board.onRefresh()
        })
      }, 100)
    })
  },
  methods: {
    goHome() {
      if (this.$globalConf.user.visitor) {
        this.delCookie('sid', '.tvflnet.com')
        this.delCookie('visitor', '.tvflnet.com')
        this.$router.push(`/auth/login/${this.$globalConf.meetingId}/${window.btoa(window.location.href)}`)
      } else {
        this.$router.push({ name: 'meeting' })
      }
    },
    handleFullscreen() {
      this.$globalConf.isFullscreen = !this.$globalConf.isFullscreen
      if (this.$globalConf.isFullscreen) {
        fullscreen()
      } else {
        exitFullscreen()
      }
    },
    // 同步批注
    savePostil() {
      clearTimeout(this.timerSavePostil)
      this.timerSavePostil = setTimeout(() => {
        Vue.eventBus.$emit('savePostil')
      }, 500)
    },
  },
}
</script>

<style lang="scss" scoped>
.wrapper {
    height: 100%;
    position: relative;
    .toolbar-right{
      background: #f0f0f0;
      position:absolute;
      z-index: 20;
      right: 20px;
      top: 20px;
      &>span{
        display: block;
        line-height: 2.4vw;
        text-align: center;
        width: 2.4vw;
        height: 2.4vw;
        cursor: pointer;
        &:hover{
          background: #D6D6D6;
        }
        .iconfont{
          font-size: 1.4vw;
        }
      }
    }
}
</style>
