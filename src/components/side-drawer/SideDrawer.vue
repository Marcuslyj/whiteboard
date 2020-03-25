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
            <!-- <span class="remark">{{
              user.userId === curPerson.userId ? "（演示者）" : (user.owner ? "（我）" : "")
            }}</span> -->
          </li>
        </ul>
        <section ref="subMenu" class="leage-two" v-show="cur_user.userId" @mouseenter="inSubMenu=true"  @mouseleave="mouseleaveFromSub">
          <ul>
            <li v-if="$globalConf.user.owner" @click="closeMeeting">关闭会议</li>
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
            <li v-if="($globalConf.user.owner||$globalConf.user.speakerPermission) && !cur_user.speakerPermission">踢出会议</li>
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
import Vue from 'vue'

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
      connect_callback: null,
      users: [],
      cur_user: {},
      inSubMenu: false,
      timeout: null,
    }
  },
  created() {
    this.$nextTick(() => {
      this.init()
    })
  },

  beforeDestroy() {
    this.listenStop()
  },
  methods: {
    // 初始化工作
    init() {
      this.listenStart()
      // 获取用户列表
      getUsers()
    },
    listenStart() {
      let socket = getSocket()
      if (!socket) return
      socket.on(socketEvent.getUsers, (users) => {
        if (users && users.length) {
          this.users = users
          console.log(users)
          console.log(this.$globalConf.user)
        }
      })
    },
    listenStop() {
      if (this.connect_callback) {
        Vue.eventBus.$off('socket_connect', this.connect_callback)
      }
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
  },
}
</script>


<style lang="scss" src="./SideDrawer.scss" scoped></style>
