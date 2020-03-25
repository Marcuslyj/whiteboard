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
        <section class="leage-one">
          <h3>会议成员</h3>
          <ul>
            <li v-for="(user, index) in users" :key="index">
              <span class="icon"
                ><i :class="['iconfont', getRoleIcon(user)]"></i
              ></span>
              <span class="name">{{ user.realName }}</span>
              <!-- <span class="remark">{{
                user.userId === curPerson.name
                  ? "（演示者）"
                  : user.role === "admin"
                  ? "（我）"
                  : ""
              }}</span> -->
              <section class="leage-two">
                <ul>
                  <li v-if="$globalConf.user.owner" @click="closeMeeting">关闭会议</li>
                  <template v-if="$globalConf.user.owner">
                    <template v-if="!user.vistor">
                      <li v-if="!user.speakerPermission">设为演示者</li>
                      <li v-else-if="!user.owner">取消演示者</li>
                    </template>

                    <template v-if="!user.owner">
                      <li v-if="!user.downloadPermission">开放下载</li>
                      <li v-else>禁止下载</li>
                    </template>
                  </template>
                  <li v-if="($globalConf.user.owner||$globalConf.user.speakerPermission) && !user.speakerPermission">踢出会议</li>
                </ul>
              </section>
            </li>
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
      this.$emit('showVisible', false)
    },
  },
}
</script>


<style lang="scss" src="./SideDrawer.scss" scoped></style>
