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
            <li v-for="(user, index) in userList" :key="index">
              <span class="icon"
                ><i :class="['iconfont', getRole(user)]"></i
              ></span>
              <span class="name">{{ user.name }}</span>
              <span class="remark">{{
                user.name === curPerson.name
                  ? "（演示者）"
                  : user.role === "admin"
                  ? "（我）"
                  : ""
              }}</span>
              <section class="leage-two">
                <ul ref="admin" v-if="user.role === 'admin'">
                  <li @click="closeMeeting">关闭会议</li>
                  <li v-show="!user.isSpeaker">设为演示者</li>
                </ul>
                <ul ref="user" v-if="user.role === 'user'">
                  <li>
                    {{ user.isSpeaker ? "取消演示者" : "设为演示者" }}
                  </li>
                  <li>{{ user.hasDownload ? "禁止下载" : "开放下载" }}</li>
                  <li>踢出会议</li>
                </ul>
                <ul ref="vistor" v-show="user.role === 'vistor'">
                  <li>踢出会议</li>
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
    userList: {
      type: Array,
      default: () => [
        {
          name: '房管',
          role: 'admin',
          isSpeaker: false,
        },
        {
          name: 'aaaa',
          role: 'user',
          isSpeaker: true,
          hasDownload: false,
        },
        {
          name: 'bbb',
          role: 'vistor',
        },
      ],
    },
  },
  directives: { clickOutside },
  data() {
    return {
      showLeageTwo: false,
      curPerson: this.userList[0],
    }
  },
  methods: {
    closeMeeting() {},
    getRole(user) {
      let cls = ''
      switch (user.role) {
      case 'admin':
        cls = 'icon-admin'
        break
      case 'user':
        cls = 'icon-user'
        break
      case 'vistor':
        cls = 'icon-vistor'
        break
      default:
        break
      }
      return cls
    },
    handleClickOutside() {
      this.$emit('showVisible', false)
    },
  },
}
</script>

<style lang="scss" scoped>
.drawer {
  z-index: 99;
  position: fixed;
  right: 0;
  top: 15vh;
  height: 70vh;
  width: 300px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
  border: 1px solid #e8eaec;
  background: #fff;
  .wrapper {
    position: relative;
    z-index: 2;
    .iconfont {
      font-size: 18px;
    }
    h3 {
      height: 40px;
      line-height: 40px;
      border-bottom: 1px solid #eee;
      padding-left: 10px;
    }
    li {
      padding: 8px 20px;
      font-size: 14px;
      cursor: pointer;
      .name {
        margin-left: 10px;
      }
      &:hover {
        background: #2d8cf0;
      }
    }
    .leage-one {
      li {
        position: relative;
        &:hover {
          .icon,.name,.remark{
            color: #fff;
          }
        }
        .leage-two {
          position: absolute;
          right: 100%;
          top: 0;
          display: none;
          width: fit-content;
          border: 1px solid #e8eaec;
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
          li:hover {
              color: #fff;
           }
        }
         &:hover {
            .leage-two {
              display: block;
            }
          }
      }
    }
  }
  .mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    opacity: 0;
    z-index: 1;
  }
}
.fade-enter,
.fade-leave-to {
  width: 0;
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s;
}
.fade-enter-to,
.fade-leave {
  opacity: 1;
}
</style>
