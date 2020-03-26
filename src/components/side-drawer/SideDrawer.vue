<!--
Description
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2020-03-19 16:36:57
@version 1.0.0
-->
<template>
  <transition name="fade">
    <div class="drawer" v-show="visible">
      <div class="wrapper" v-click-outside="handleClickOutside">
        <h3>会议成员</h3>
        <ul class="leage-one">
          <li
            v-for="user in users"
            :key="user.userId"
            @mouseenter="handleMouseenter($event, user)"
            @mouseleave="handleMouseleave()"
            :class="{'active':cur_user.userId===user.userId}"
          >
            <span class="icon"
              ><i :class="['iconfont', getRoleIcon(user)]"></i
            ></span>
            <span class="name">{{ user.realName }}</span>
            <span class="remark">{{user.speakerPermission ? "（主讲人）" : (user.userId===$globalConf.user.userId? '（我）':'')}}</span>
          </li>
        </ul>
        <section ref="subMenu" class="leage-two" v-show="cur_user.userId" @mouseenter="inSubMenu=true"  @mouseleave="mouseleaveFromSub">
          <ul>
            <template v-if="$globalConf.user.owner">
              <template v-if="!cur_user.vistor">
                <li v-if="!cur_user.speakerPermission">设为演示者</li>
                <li v-else-if="!cur_user.owner">取消演示者</li>
              </template>

              <template v-if="!cur_user.owner">
                <li v-if="!cur_user.downloadPermission">开放下载</li>
                <li v-else>禁止下载</li>
              </template>
            </template>
            <li v-if="$globalConf.user.owner && cur_user.owner" @click="closeMeeting">关闭会议</li>
            <li v-if="($globalConf.user.owner||$globalConf.user.speakerPermission) && !cur_user.speakerPermission" @click="kick(cur_user)">踢出会议</li>
          </ul>
        </section>
      </div>
      <div class="mask"></div>
    </div>
  </transition>
</template>

<script>
import { directive as clickOutside } from 'v-click-outside-x'
import { getSocket, getUsers } from '@common/socketUtil'
import { socketEvent } from '@common/common'

let eventsToDestroy

export default {
  model: {
    prop: 'visible',
    event: 'showVisible',
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  directives: { clickOutside },
  data() {
    return {
      showLeageTwo: false,
      // curPerson: this.users[0],
      users: [],
      cur_user: {},
      inSubMenu: false,
      timeout: null,
    }
  },
  created() {
    this.$nextTick(() => {
      eventsToDestroy = []
      this.init()
    })
  },

  beforeDestroy() {
    this.listenStop()
    eventsToDestroy = null
  },
  methods: {
    // 初始化工作
    init() {
      this.listenStart()
      // 获取用户列表
      getUsers()
    },
    listenStart() {
      this.socketOn(socketEvent.getUsers, (users) => {
        if (users && users.length) {
          this.users = users
        }
      })
      // 有用户上下线，更新用户列表
      this.socketOn(socketEvent.sessionAction, (user) => {
        if (user.onlineState) {
          let exist = this.users.filter((u) => u.userId === user.userId)
          if (!exist.length) {
            this.users.push(user)
          } else {
            // 防止session不同一
            exist.sessionId = user.sessionId
          }
        } else {
          for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].sessionId === user.sessionId) {
              this.users.splice(i, 1)
              i--
            }
          }
        }
      })
    },
    socketOn(event, cb) {
      let socket = getSocket()
      socket.on(event, cb)
      eventsToDestroy.push(event)
    },
    listenStop() {
      let socket = getSocket()
      if (!socket) return
      eventsToDestroy && eventsToDestroy.map((event) => socket.off(event))
    },
    closeMeeting() {},
    getRoleIcon(user) {
      let icons = {
        owner: 'icon-admin',
        user: 'icon-user',
        visitor: 'icon-vistor',
      }
      let key = user.owner ? 'owner' : 'user'
      return icons[key]
    },
    handleClickOutside() {
      this.inSubMenu = false
      this.timeout = null
      this.cur_user = {}
      this.$emit('showVisible', false)
    },
    handleMouseenter($event, user) {
      const target = $event.currentTarget
      const { scrollTop } = document.querySelector('.leage-one')
      this.$refs.subMenu.style.left = `${target.offsetLeft}px`
      this.$refs.subMenu.style.top = `${Math.max(target.offsetTop - scrollTop + 40, 40)}px`
      this.cur_user = user
      clearTimeout(this.timeout)
    },
    handleMouseleave() {
      this.timeout = setTimeout(() => {
        if (!this.inSubMenu) {
          this.cur_user = {}
        }
      }, 200)
    },
    mouseleaveFromSub() {
      console.log(true)
      this.inSubMenu = false
      this.cur_user = {}
    },
    // 踢人
    kick(user) {
      let { meetingId } = this.$globalConf
      getSocket().emit(socketEvent.kickingSession, {
        meetingId,
        kickingSessionId: user.sessionId,
      })
      this.cur_user = {}
    },
  },
}
</script>


<style lang="scss" src="./SideDrawer.scss" scoped></style>
