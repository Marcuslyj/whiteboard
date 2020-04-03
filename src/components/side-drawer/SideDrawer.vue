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
        <section ref="subMenu" class="leage-two" v-show="cur_user.sessionId" @mouseenter="inSubMenu=true"  @mouseleave="mouseleaveFromSub">
          <ul>
            <template v-if="$globalConf.user.owner && !cur_user.visitor">
              <!-- <template v-if="!cur_user.visitor"> -->
                <li v-if="!cur_user.speakerPermission" @click="auth(cur_user,{k:'speakerPermission',v:true})">设为演示者</li>
                <li v-else-if="!cur_user.owner" @click="auth(cur_user,{k:'speakerPermission',v:false})">取消演示者</li>
              <!-- </template> -->

              <template v-if="!cur_user.owner">
                <li v-if="!cur_user.downloadPermission" @click="auth(cur_user,{k:'downloadPermission',v:true})">开放下载</li>
                <li v-else @click="auth(cur_user,{k:'downloadPermission',v:false})">禁止下载</li>
              </template>
            </template>
            <!-- <li v-if="$globalConf.user.owner && cur_user.owner" @click="closeMeeting">关闭会议</li> -->
            <li v-if="($globalConf.user.owner||$globalConf.user.speakerPermission) && !(cur_user.speakerPermission||cur_user.owner)" @click="kick(cur_user)">踢出会议</li>
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
      toggleRouter: null,
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
      // 监听授权
      this.socketOn(socketEvent.authPermission, (params) => {
        // 被授权的是自己
        let permissions = ['downloadPermission', 'speakerPermission']
        if (params.permissionSessionId === this.$globalConf.user.sessionId) {
          permissions.forEach((p) => {
            if (p in params) {
              this.$globalConf[p] = this.$globalConf.user[p] = params[p]
              clearTimeout(this.toggleRouter)
              if (p === 'speakerPermission' && params[p]) {
                this.toggleRouter = setTimeout(() => {
                  this.$globalConf.toggleRouter = !this.$globalConf.toggleRouter
                }, 300)
              }
              this.$Message.success('授权变更成功！')
            }
          })
        } else {
          permissions.forEach((p) => {
            if (p in params) {
              let user = this.users.filter((u) => u.userId === params.permissionUserId)
              if (user.length) user[0][p] = params[p]
              if (p === 'speakerPermission') {
                clearTimeout(this.toggleRouter)
                if (params[p]) {
                  if (this.$globalConf.speakerPermission) {
                    this.$globalConf.speakerPermission = this.$globalConf.user.speakerPermission = false
                  }
                } else if (this.$globalConf.owner) {
                  // 授权房主自己
                  this.auth(this.$globalConf.user, { k: 'speakerPermission', v: true })
                }
              }
              this.$Message.success('授权变更成功！')
            }
          })
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
        visitor: 'icon-youkeyonghu',
      }
      let key = user.owner ? 'owner' : (user.visitor ? 'visitor' : 'user')
      return icons[key]
    },
    handleClickOutside() {
      this.inSubMenu = false
      this.timeout = null
      this.cur_user = {}
      this.$emit('showVisible', false)
    },
    handleMouseenter($event, user) {
      clearTimeout(this.timeout)
      const target = $event.currentTarget
      const { scrollTop } = document.querySelector('.leage-one')
      this.$refs.subMenu.style.left = `${target.offsetLeft}px`
      this.$refs.subMenu.style.top = `${Math.max(target.offsetTop - scrollTop + 40, 40)}px`
      this.cur_user = user
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
      this.$confirm(`确定踢除[${user.realName}]？`, () => {
        let { meetingId } = this.$globalConf
        getSocket().emit(socketEvent.kickingSession, {
          meetingId,
          kickingSessionId: user.sessionId,
        })
        this.cur_user = {}
      })
    },
    // 授权
    auth(user, { k, v }) {
      let tips = {
        speakerPermission: {
          true: `确定授权[${user.realName}]主讲权限？`,
          false: `确定取消[${user.realName}]主讲权限？`,
        },
        downloadPermission: {
          true: `确定授权[${user.realName}]下载权限？`,
          false: `确定取消[${user.realName}]下载权限？`,
        },
      }
      let tip = tips[k][v]
      if (tip) {
        this.$confirm(tip, () => {
          getSocket().emit(socketEvent.authPermission, {
            meetingId: this.$globalConf.meetingId,
            permissionSessionId: user.sessionId,
            permissionUserId: user.userId,
            permissionRealName: user.realName,
            [k]: v,
          })
        })
      }
    },
  },
}
</script>


<style lang="scss" src="./SideDrawer.scss" scoped></style>
