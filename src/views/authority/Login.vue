<template>
  <Row type="flex" justify="center" align="middle" class="mi-login">
    <Col span="8" class="mi-login-box">
      <Tabs>
        <TabPane label="账号登录" name="account">
          <Form :model="accountForm.validate" :rules="accountForm.rules" ref="accountForm">
            <FormItem prop="account" style="margin-top: 8px;">
              <Input
                prefix="ios-contact"
                placeholder="请输入工号"
                v-model="accountForm.validate.account"
                size="large" />
            </FormItem>
            <FormItem prop="password">
              <Input
                prefix="ios-lock"
                type="password"
                placeholder="请输入密码"
                size="large"
                v-model="accountForm.validate.password"
                @on-enter="login"
                password />
            </FormItem>
            <span v-html="message" style="position: absolute;bottom: 42px;left: 0;color: #ed4014;" v-if="message"></span>
            <FormItem style="margin-bottom: 8px;">
              <Button
                type="primary"
                @click="login"
                :style="{width: '100%'}"
                >登录
              </Button>
            </FormItem>
          </Form>
        </TabPane>
        <TabPane label="游客登录" name="tourist" style="display: flex;align-items: center;justify-content: center;">
          <Form :model="touristForm.validate" :rules="touristForm.rules" ref="touristForm" style="width: 100%;">
            <FormItem prop="realName" style="margin-top: 8px;">
              <Input
                prefix="ios-contact"
                placeholder="请输入名称"
                v-model="touristForm.validate.realName"
                @on-enter="touristLogin"
                size="large" />
            </FormItem>
            <FormItem>
              <Button
                type="primary"
                @click="touristLogin"
                style="width: 100%;"
                >进入
              </Button>
            </FormItem>
          </Form>
        </TabPane>
      </Tabs>
    </Col>
  </Row>
</template>

<script>
import {
  Row, Col, Input, Button, Icon, Tabs, TabPane, Form, FormItem,
} from 'view-design'

const components = {
  Row,
  Col,
  Input,
  Button,
  Icon,
  Tabs,
  TabPane,
  Form,
  FormItem,
}

const AuthorityLoginComponent = {
  components,
  data() {
    const checkAccount = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入工号'))
      } else {
        callback()
      }
    }
    const checkPassword = (rule, value, callback) => {
      if (!value) {
        this.message = null
        callback(new Error('请输入密码'))
      } else {
        callback()
      }
    }
    return {
      link: null,
      mid: 0,
      message: null,
      tourist: false,
      accountForm: {
        validate: {
          account: '',
          password: '',
        },
        rules: {
          account: [{ required: true, validator: checkAccount }],
          password: [{ required: true, validator: checkPassword }],
        },
      },
      touristForm: {
        validate: { realName: '' },
        rules: { realName: [{ required: true, message: '请输入名称' }] },
      },
    }
  },
  methods: {
    login() {
      this.$refs.accountForm.validate((valid) => {
        if (valid) {
          this.$api.post('/user-manager/login', { ...this.accountForm.validate }, (res) => {
            if (res.ret.retCode === '0') {
              if (this.mid && this.link) {
                this.auth()
              } else {
                this.$router.push({ name: 'myMeeting' })
              }
            } else {
              this.message = res.ret.retMsg
            }
          }, (err) => {
            this.message = err.message
          })
        }
      })
    },
    touristLogin() {
      this.$refs.touristForm.validate((valid) => {
        if (valid) {
          if (!this.link) {
            this.$Message.error('会议链接有误，请稍候再试')
          } else {
            this.$api.post(
              'user-manager/visitor-login',
              { ...this.touristForm.validate },
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
        }
      })
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
    const visitor = this.getCookie('visitor')
    const sid = this.getCookie('sid')
    if (sid && this.link) {
      window.location.href = this.link
    } else if (sid && visitor === 'false') {
      this.$router.push({ name: 'myMeeting' })
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
    padding: 16px 32px;
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
    justify-content: flex-start;
    font-size: 12px;
    color: #f56c6c;
    padding: 8px 0;
    i {
      font-size: 18px;
      margin-right: 4px;
    }
  }
}
</style>
