<template>
  <div class="wrapper" v-if="showBoard">
    <div class="board-manager-wrapper">
      <div class="board-manager">
        <div @click.stop.prevent="clickBd" class="btn">
          <span class="title">{{ $globalConf.activeWhiteboardNum }} / {{ $globalConf.whiteboards.length }}</span>
          <span class="logo" v-if="$globalConf.speakerPermission">
            <i class="iconfont icon-add" @click.stop.prevent="createWhiteboard"></i>
          </span>
        </div>
        <div class="menu board" v-show="boxName==='bd'" >
          <header>
            <span @click.stop.prevent="delWhiteboards" v-if="$globalConf.speakerPermission">
              <i class="iconfont icon-menu-delete"></i>
            </span>
            <span class="download"  @click.stop.prevent="downloadPdf" v-if="$globalConf.downloadPermission">
              <i class="iconfont icon-Shapecopy"></i>
            </span>
          </header>
          <div class="wb-bd">
            <div
              class="item-wrapper"
              v-for="(wb, index) in $globalConf.whiteboards"
              :key="index"
            >
              <Checkbox v-model="wb.selected" v-if="$globalConf.speakerPermission" :disabled="index===$globalConf.activeWhiteboardNum-1"></Checkbox>
              <div class="img-wrapper"  @click.stop.prevent=" $globalConf.speakerPermission&&changeWhiteboard(wb.whiteboardId)"  :class="{ active: wb.whiteboardId === $globalConf.whiteboardId }">
                 <img class="img" v-if="wb.url" :src="`${fileService}${wb.url}`" alt=""/>
                 <div class="blank-img" v-else></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
import socketUtil, { destroySocket } from '@common/socketUtil'
import Vue from 'vue'
import {
  formateUrl, fileLinkToStreamDownload, fullscreen, exitFullscreen,
} from '@common/utils'
import { api, fileService } from '@common/common'
import Konva from 'konva'
import whiteboard from './WhiteBoard'

export default {
  name: '',
  components: { whiteboard },
  data() {
    return {
      showBoard: false,
      boxName: '',
      fileService,
      timerSavePostil: null,
    }
  },
  watch: {
    boxName(val) {
      if (val !== '') {
        // 更新当前的预览白板
        const update = (url) => {
          const item = this.$globalConf.whiteboards[this.$globalConf.activeWhiteboardNum - 1]
          item.url = url
          this.$set(this.$globalConf.whiteboards, this.$globalConf.activeWhiteboardNum - 1, item)
        }
        Vue.eventBus.$emit('clipAndSend', { callback: update })
      }
    },
  },
  beforeDestroy() {
    // 销毁socket
    destroySocket()
    Vue.eventBus.$off('hideTbMask')
  },
  beforeCreate() {
    // 看高清屏是否改善卡顿
    Konva.pixelRatio = 1
    console.log('pixelRatio: ', Konva.pixelRatio)
  },
  created() {
    Vue.eventBus.$on('hideTbMask', () => {
      this.boxName = ''
    })
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
          this.$router.push(
            `/auth/login/${meetingId}/${window.btoa(window.location.href)}`,
          )
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
      }
    }, 1000)
    Vue.eventBus.$on('resize', () => {
      clearTimeout(this.timerRefresh)
      this.timerRefresh = setTimeout(() => {
        this.$nextTick(() => {
          let board = this.$refs.board1 || this.$refs.board2
          board && board.onRefresh()
        })
      }, 120)
    })
  },
  methods: {
    clickBd() {
      this.setBoxName('bd')
    },
    createWhiteboard() {
      if (this.$globalConf.whiteboards.length === 5) {
        this.$Message.warning('最多支持5个白板')
        return
      }
      Vue.eventBus.$emit('createWhiteboard')
    },
    downloadPdf() {
      const download = () => {
        const url = formateUrl(api.downloadWhiteboards, { meetingId: this.$globalConf.meetingId })
        this.$api.post(url, {}, (res) => {
          if (res.ret.retCode === '0') {
            fileLinkToStreamDownload(`${fileService}${res.data.url}`, this.$globalConf.theme, 'pdf')
          }
        })
      }
      download()
    },
    delWhiteboards() {
      const delIds = []
      this.$globalConf.whiteboards.forEach((item) => {
        if (item.selected) {
          delIds.push(item.whiteboardId)
        }
      })
      const inValidId = delIds.find((e) => e === this.$globalConf.whiteboardId)
      if (inValidId) {
        this.$Modal.error({ title: '温馨提示', content: '不允许删除当前白板，请重新选择!' })
        return
      }
      if (delIds.length === 0) {
        this.$Modal.error({ title: '温馨提示', content: '请至少选择一个白板删除!' })
        return
      }
      this.$Modal.confirm({
        title: '温馨提示',
        content: `确定删除选中的${delIds.length}个白板!`,
        onOk: () => {
          const url = formateUrl(api.deleteBoards, {
            meetingId: this.$globalConf.meetingId,
          })
          this.$api.delete(url, delIds, (res) => {
            if (res.ret.retCode === '0') {
              this.$Message.success('删除成功!')
              const arr = []
              // 前端移除掉删掉的白板，同时更新activeWhiteboardNum
              this.$globalConf.whiteboards.forEach((e) => {
                if (delIds.indexOf(e.whiteboardId) === -1) {
                  arr.push(e)
                }
              })
              this.$globalConf.whiteboards = arr
              const i = this.$globalConf.whiteboards.findIndex((item) => item.whiteboardId === this.$globalConf.whiteboardId)
              this.$globalConf.activeWhiteboardNum = i + 1
            } else {
              this.$Modal.error({ title: '温馨提示', content: res.ret.retMsg })
            }
          })
        },
      })
    },
    setBoxName(boxName) {
      this.boxName = this.boxName === boxName ? '' : boxName
      Vue.eventBus.$emit('setTbMask', { id: 'boardManager', visible: this.boxName !== '' })
    },
    // 切换白板
    changeWhiteboard(whiteboardId) {
      if (this.$globalConf.whiteboardId === whiteboardId) {
        return
      }
      // 1. 通知后台全局记录下打开白板的id
      let options = {
        meetingId: this.$globalConf.meetingId,
        whiteboardId: 0,
        syncAction: JSON.stringify({ whiteboardId }),
      }
      socketUtil.syncAction(options)
      this.$globalConf.toggleRouter = !this.$globalConf.toggleRouter
    },
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
  .whiteboard{
    z-index: 1;
  }
  .board-manager-wrapper {
    position: fixed;
    left:5vw;
    bottom:12px;
    z-index: 20;
    .board-manager {
      position: relative;
      text-align: left;
      height: 2.8vw;
      font-size: 1.4vw;
      cursor: pointer;
      .btn{
        line-height: 2.8vw;
        padding: 0 0.6vw;
        border-radius: 0.5vw;
        background: #f0f0f0;
        &:hover {
          background: #d6d6d6;
        }
      }

      .logo{
        margin-left:1.5vw;
        background:#fff;
        padding:0.2vw;
        border-radius: 0.3vw;
        &:hover{
          color:#2d8cf0;
        }
      }
      .iconfont {
        font-size: 1.4vw;
      }
      .menu {
        position: absolute;
        bottom: 4vw;
        left: 50%;
        transform: translateX(-50%);
        background: #f3f4f7;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
        &::before {
          position: absolute;
          bottom: -2vw;
          left: 50%;
          transform: translateX(-50%);
          content: "";
          display: block;
          height: 0;
          width: 0;
          border: 1vw solid transparent;
          border-top: 1vw solid #f3f4f7;
        }
      }
      header {
        border-bottom: 1px solid #e8e8e8;
        line-height:1;
        padding:0.2vw 0 0;
        .iconfont {
          display: inline;
          font-size: 1vw;
        }
        .download {
          margin-left: 10px;
        }
        span{
          margin-left:4px;
          &:hover{
            color:#2d8cf0;
          }
        }
      }
      .wb-bd {
        overflow-x:hidden;
        overflow-y: auto;
        max-height: 240px;
        .item-wrapper {
          margin: 0.5vw 0.5vw 0;
          background-color: #fff;
          position: relative;
          height: 6vw;
          width: 8vw;
          min-width:80px;
          min-height:60px;
          .ivu-checkbox-wrapper {
            position: absolute;
            left: 10px;
            top: 10px;
          }
          .img-wrapper{
            height:100%;
            overflow: hidden;
            border:1px solid transparent;
            border-radius: 4px;
            &.active {
            border: 1px solid #2d8cf0;
            }
          }
          img,.blank-img{
            width:100%;
            height:100%;
          }
        }
      }
    }
  }
  @media screen and(max-width:600px){
    .board-manager{
      height:6vw;
      .iconfont{
        font-size:3vw;
      }
      .btn{
        line-height:6vw;
      }
      &:hover {
        background:#D6D6D6
      }
    }
  }
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
