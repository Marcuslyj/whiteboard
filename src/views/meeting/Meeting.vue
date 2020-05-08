<!--
Description
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2020-05-04 09:18:31
@version 1.0.0
-->
<template>
  <div class="meeting-page">
  <Layout>
    <Header class="m-header">
      <div :class="{'collapsed-btn':true,'uncollapsed':isCollapsed}" @click="changeCollapsed" >
        <icon type="md-menu"></icon>
      </div>
      <Dropdown class="m-header-user" trigger="hover" placement="bottom">
        <icon type="ios-contact" />
        <DropdownMenu slot="list">
          <DropdownItem v-html="user.realName"></DropdownItem>
          <DropdownItem><a href="javascript:void(0);" @click="setPwdModal">修改密码</a></DropdownItem>
          <DropdownItem><a href="javascript:void(0);" @click="logout">退出登录</a></DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </Header>
    <Layout class="meeting-body">
      <Sider  hide-trigger collapsible :collapsed-width="50"  v-model="isCollapsed">
        <Menu width="auto" theme="dark">
        <MenuItem name="1">
          <Icon type="ios-navigate"></Icon>
          <span class="title">新建会议</span>
        </MenuItem>
        <MenuItem name="2">
          <Icon type="ios-keypad"></Icon>
          <span class="title">我的会议</span>
        </MenuItem>
        <MenuItem name="3">
          <Icon type="ios-analytics"></Icon>
          <span class="title">历史会议</span>
        </MenuItem>
        <MenuItem name="4">
          <Icon type="ios-paper"></Icon>
           <span class="title">文档检索</span>
        </MenuItem>
      </Menu>
      </Sider>
      <Content class="m-content">
         <router-view></router-view>
      </Content>
    </Layout>
    <!-- <Footer>Footer</Footer> -->
  </Layout>
  <Modal class-name="mi-modal" title="修改密码" v-model="pwdModal.show" @on-ok="setPassword" footer-hide>
      <Form :model="pwdModal.validate" :rules="pwdModal.rules" :label-width="120" ref="pwd-form">
        <FormItem label="旧密码" prop="opwd">
          <Input v-model="pwdModal.validate.opwd" :max-length="32" type="password" password></Input>
        </FormItem>
        <FormItem label="新密码" prop="npwd">
          <Input v-model="pwdModal.validate.npwd" :max-length="32" type="password" password></Input>
        </FormItem>
        <FormItem label="确认新密码" prop="rpwd">
          <Input v-model="pwdModal.validate.rpwd" :max-length="32" type="password" password></Input>
        </FormItem>
        <FormItem style="margin-bottom: 0">
          <Button @click="setPassword" type="primary">确定</Button>
          <Button @click="setPwdModal()" style="margin-left: 16px;">取消</Button>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import { Form, FormItem } from 'view-design'

const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次确认新密码'))
  } else if (this.pwdModal.validate.npwd !== value) {
    callback(new Error('两次密码输入不一致，请重新输入'))
  } else {
    callback()
  }
}
export default {
  components: { Form, FormItem },
  data() {
    return {
      isCollapsed: false,
      user: {},
      pwdModal: {
        show: false,
        validate: {
          opwd: null,
          npwd: null,
          rpwd: null,
        },
        rules: {
          opwd: [{ required: true, message: '请输入旧密码' }],
          npwd: [{ required: true, message: '请输入新密码' }],
          rpwd: [{ required: true, validator: validatePassword }],
        },
      },
    }
  },
  methods: {
    changeCollapsed() {
      this.isCollapsed = !this.isCollapsed
    },
    setPwdModal() {
      if (this.user.userId) {
        this.pwdModal.show = !this.pwdModal.show
        this.$refs['pwd-form'].resetFields()
      } else {
        this.$Message.error('用户信息有误，请刷新后再试')
      }
    },
    logout() {
      this.$api.get(
        'user-manager/logout',
        {},
        (res) => {
          if (res.ret.retCode === '0') {
            this.delCookie('sid', '.tvflnet.com')
            this.delCookie('visitor', '.tvflnet.com')
            this.$router.push({ name: 'login' })
          } else {
            this.$Message.error(res.ret.retMsg)
          }
        },
        (err) => {
          this.$Message.error(err.message)
        },
      )
    },
    setPassword() {
      this.$refs['pwd-form'].validate((valid) => {
        if (valid) {
          this.$api.post(`/user-manager/user/${this.user.userId}/password/valid`, {
            password: this.pwdModal.validate.opwd,
          }, (res) => {
            if (res.ret.retCode === '0' && res.data === true) {
              this.$api.put(`/user-manager/user/${this.user.userId}/password`, {
                oldPassword: this.pwdModal.validate.opwd,
                password: this.pwdModal.validate.npwd,
              }, (response) => {
                if (response.ret.retCode === '0' && response.data === true) {
                  this.pwdModal.show = false
                  this.$Message.success('密码修改成功')
                } else {
                  this.$Message.error(response.ret.retMsg)
                }
              }, (err) => {
                this.$Message.error(err.message)
              })
            } else {
              this.$Message.error('旧密码输入有误，请重新输入')
            }
          }, (err) => {
            this.$Message.error(err.message)
          })
        }
      })
    },
  },

}
</script>

<style lang="scss" scoped>
  @import '@/styles/variable.scss';
  .meeting-page{
    height:100%;
    >.ivu-layout{
      height: 100%;
    }
    .m-header{
      // background:$theme-color;
      // border-bottom:1px solid #eee;
      .collapsed-btn{
        margin-left:160px;
        display: inline-block;
        width:43px;
        height:43px;
        line-height:43px;
        color:#fff;
        cursor: pointer;
        font-size:28px;
      }
      .uncollapsed{
        margin-left:0;
        transition:.3s;
        .ivu-icon{
          transform: rotate(90deg);
        }
      }
      .m-header-user{
        position:absolute;
        right:60px;
        font-size:28px;
        color:#fff;
        cursor: pointer;
      }
    }
    .m-content{
      width:100%;
    }
    .meeting-body{
      flex:1;
      .ivu-menu-item{
        .ivu-icon{
          font-size:24px;
        }
      }
      /deep/ .ivu-layout-sider-collapsed{
        .ivu-menu-item{
          height:50px;
          line-height:50px;
          padding:0;
          overflow: hidden;
          .ivu-icon{
            font-size:24px;
          }
          text-align: center;
          .title{
            display: none;
          }
        }
     }
    }
  }

</style>
