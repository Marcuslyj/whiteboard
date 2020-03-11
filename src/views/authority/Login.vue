<template>
  <Row type="flex" justify="center" align="middle" class="mi-login">
    <Col span="8" class="mi-login-box" v-if="!tourist">
      <div class="mi-login-box-tourist" @click="setTourist" v-if="showTourist">
        <span>游客</span>
      </div>
      <Input
        prefix="ios-contact"
        placeholder="请输入工号"
        v-model="account"
        size="large"
      />
      <Input
        prefix="ios-lock"
        type="password"
        placeholder="请输入密码"
        size="large"
        v-model="password"
        @on-enter="login"
        password
        style="margin-top: 16px"
      />
      <Button
        type="primary"
        @click="login"
        style="width: 100%;margin-top: 16px;margin-bottom: 8px;"
        >登录
      </Button>
      <span class="mi-login-tip" v-if="message">
        <icon type="md-alert" />{{ message }}
      </span>
    </Col>
    <Col span="8" class="mi-login-box" v-else>
      <div class="mi-login-box-tourist" @click="setTourist" v-if="showTourist">
        <span>账号</span>
      </div>
      <Input
        prefix="ios-contact"
        placeholder="请输入名称"
        v-model="account"
        @on-enter="touristLogin"
        size="large"
      />
      <Button
        type="primary"
        @click="touristLogin"
        style="width: 100%;margin-top: 16px;margin-bottom: 8px;"
        >进入
      </Button>
      <span class="mi-login-tip" v-if="message">
        <icon type="md-alert" />{{ message }}
      </span>
    </Col>
  </Row>
</template>

<script>
import Vue from 'vue'
import {
  Row, Col, Input, Button, Icon,
} from 'view-design'

const components = {
  Row,
  Col,
  Input,
  Button,
  Icon,
}
Object.keys(components).forEach((key) => {
  Vue.component(key, components[key])
})
const AuthorityLoginComponent = {
  data() {
    return {
      account: '',
      password: '',
      message: null,
      tourist: false,
      showTourist: false,
      link: null,
      mid: 0,
    }
  },
  methods: {
    check() {
      let status = false
      this.message = null
      if (!this.account) {
        this.message = '请输入工号'
      } else if (!/[a-zA-Z]([0-9]{1,20})$/.test(this.account)) {
        this.message = '工号格式不正确 ( 示例：A0001 )'
      } else if (!this.password) {
        this.message = '请输入密码'
      }
      if (!this.message) status = true
      return status
    },
    login() {
      if (this.check()) {
        this.$api.post(
          '/user-manager/login',
          {
            account: this.account,
            password: this.password,
          },
          (res) => {
            if (res.ret.retCode === '0') {
              if (this.mid && this.link) {
                this.auth()
              } else {
                this.$router.push({ name: 'meeting' })
              }
            } else {
              this.message = res.ret.retMsg
            }
          },
          (err) => {
            this.message = err.message
          },
        )
      }
    },
    setTourist() {
      this.tourist = !this.tourist
      this.account = null
      this.password = null
      this.message = null
    },
    touristLogin() {
      if (!this.account) {
        this.message = '请输入名称'
      } else if (!this.link) {
        this.$Message.error('会议链接有误，请稍候再试')
      } else {
        this.$api.post(
          'user-manager/visitor-login',
          { realName: this.account },
          (res) => {
            if (res.ret.retCode === '0') {
              this.auth(true)
            } else {
              this.$Message.error(res.ret.retMsg)
            }
          },
          (err) => {
            this.$Message.error(err.message)
          },
        )
      }
    },
    auth(tourist = false) {
      this.$api.get(
        `meeting-manager/meeting/${this.mid}/auth`,
        {},
        (res) => {
          if (res.ret.retCode === '0') {
            if (res.data.type === 1 && tourist) {
              this.$Message.error({
                content: '很抱歉，游客无权限访问该内容,请切换账号登录',
              })
            } else {
              window.location.href = this.link
            }
          } else {
            this.$Message.error(res.ret.retMsg)
          }
        },
        (err) => {
          this.$Message.error(err.message)
        },
      )
    },
  },
  created() {
    const { params } = this.$route
    if (params.mid) this.mid = params.mid
    if (params.link) {
      this.link = window.atob(params.link)
      this.tourist = true
    }
    if (this.mid && this.link) this.showTourist = true
    const visitor = this.getCookie('visitor')
    if (
      this.getCookie('sid')
      && visitor !== ''
      && visitor !== undefined
      && visitor !== null
      && !visitor
    ) {
      this.$router.push({ name: 'meeting' })
    }
  },
}
export default AuthorityLoginComponent
</script>

<style lang="less" scoped>
@mi-login: mi-login;
.@{mi-login} {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  &-box {
    max-width: 400px;
    padding: 32px;
    border: 1px solid #e4e4e4;
    border-radius: 8px;
    overflow: hidden;
    &-tourist {
      width: 100px;
      height: 100px;
      top: -55px;
      right: -55px;
      position: absolute;
      transform: rotate(45deg);
      font-size: 12px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      background: #f3f3f3;
      cursor: pointer;
      span {
        margin-bottom: 8px;
      }
    }
  }
  &-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #f56c6c;
    i {
      font-size: 18px;
      margin-right: 4px;
    }
  }
}
</style>
