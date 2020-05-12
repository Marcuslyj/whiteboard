<!--
Description
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2020-05-04 09:36:12
@version 1.0.0
-->
<template>
  <div class="meeting-form">
     <Form
        :model="model"
        :rules="rules"
        :label-width="80"
        style="margin-top: 16px;"
        ref="form"
      >
        <FormItem prop="theme" label="会议主题">
          <Input
            v-model="model.theme"
            maxlength="15"
            placeholder="请输入会议主题"
            style="width:200px"
          />
        </FormItem>
        <FormItem prop="date" label="会议日期">
          <DatePicker
            type="date"
            v-model="model.date"
            :options="date"
            placeholder="请选择会议时间"
            clearable
            :editable="false"
            style="width: 200px;"
          ></DatePicker>
        </FormItem>
        <FormItem prop="time" label="会议时间">
          <TimePicker
            type="timerange"
            v-model="model.time"
            placeholder="请选择会议具体时间点"
            format="HH:mm"
            :editable="false"
            style="width: 200px;"
          ></TimePicker>
        </FormItem>
        <FormItem prop="address" label="会议地点">
          <Input v-model="model.address" placeholder="请输入会议地点"  style="width: 200px;" maxlength="20" />
        </FormItem>
        <FormItem prop="type" label="房间类型">
          <RadioGroup v-model="model.type">
            <Radio label="0">公开</Radio>
            <Radio label="1">私密</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem prop="users" label="参会人员" v-if="model.type === '1'">
          <div class="user-modal">
            <header>
              <Input
                type="text"
                v-model="searchKey"
                suffix="ios-search"
                placeholder="搜索用户名"
                @on-enter="getUsers"
                @on-click="getUsers"
                :max-length="64"
                style="width:180px"
              />
            </header>
            <div class="user-modal-bd">
              <div class="user-list">
                <Tree
                  :data="users"
                  show-checkbox
                  multiple
                  @on-check-change="setUsers"
                  ref="tree"
                >
                </Tree>
              </div>
            </div>
          </div>
        </FormItem>
        <FormItem style="margin-bottom: 0">
          <Button @click="createMeeting" type="primary">确定</Button>
          <Button @click="cancel" style="margin-left: 16px;"
            >取消</Button
          >
        </FormItem>
      </Form>
  </div>
</template>

<script>
import {
  Form, FormItem, RadioGroup, Radio, Tree, DatePicker, TimePicker,
} from 'view-design'
import { api } from '@common/common'
import { getTimeStr } from '@common/utils'

export default {
  components: {
    Form, FormItem, RadioGroup, Radio, Tree, DatePicker, TimePicker,
  },
  data() {
    const vm = this
    const validateUsers = (rule, value, callback) => {
      if (parseInt(vm.model.type, 10) === 1) {
        if (vm.selectUsers.length <= 0) {
          callback(new Error('请选择参会人员'))
        }
        callback()
      }
      callback()
    }
    const validateTime = (rule, value, callback) => {
      const timeStr = getTimeStr(new Date())
      if (!value) {
        callback(new Error('请选择会议时间'))
      } else if (value[0] < timeStr) {
        callback(new Error('请保证会议开始时间大于当前时间点'))
      }
      callback()
    }
    return {
      model: {
        theme: null,
        date: null,
        time: null,
        address: null,
        type: '0',
      },
      users: [],
      selectUsers: [],
      searchKey: '',
      loading: false,
      date: {
        disabledDate(date) {
          return date && date.valueOf() < Date.now() - 86400000
        },
      },
      rules: {
        theme: [{ required: true, message: '请输入会议主题' }],
        address: [{ required: true, message: '请输入会议地点' }],
        type: [{ required: true, message: '请选择房间类型' }],
        users: [{ required: true, validator: validateUsers }],
        date: [{ required: true, message: '请选择会议日期' }],
        time: [{ required: true, validator: validateTime }],
      },
    }
  },
  created() {
    this.getUsers()
  },
  methods: {
    getUsers() {
      this.$api.get(
        api.meeting.userTree,
        {
          queryParam: this.searchKey,
        },
        (res) => {
          if (res.ret.retCode === '0') {
            this.users = res.data
          } else {
            this.$Message.error(res.ret.retMsg)
          }
        },
        (err) => {
          this.$Message.error(err.message)
        },
      )
    },
    createMeeting() {
      if (this.loading) return
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true
          const params = {
            theme: this.model.theme,
            startTime: `${this.model.date} ${this.model.time[0]}:00`,
            endTime: `${this.model.date} ${this.model.time[1]}:00`,
            address: this.model.address,
            type: parseInt(this.model.type),
            userIds: this.selectUsers,
          }
          this.$api.post(
            api.meeting.createMeet,
            params,
            (res) => {
              this.loading = false
              if (res.ret.retCode === '0') {
                this.$Message.success('创建成功')
              } else {
                this.$Message.error(res.ret.retMsg)
              }
            },
            (err) => {
              this.loading = false
              this.$Message.error(err.message)
            },
          )
        }
      })
    },
    cancel() {
      this.$refs.form.resetFields()
    },
    setUsers(value) {
      const users = []
      console.log(value)
      for (let i = 0, len = value.length; i < len; i++) {
        if (!value[i].children || value[i].children.length <= 0) { users.push(value[i].id) }
      }
      this.selectUsers = users
    },
  },
}
</script>

<style lang="scss" scoped>
  .meeting-form{
    padding:20px;
    .user-modal{
      display: inline-block;
      width:400px;
      border: 1px solid #dcdee2;
      border-radius: 4px;
      min-width: 250px;
      overflow: hidden;
      header{
        background-color:#ccc;
        display:flex;
        flex-direction: row-reverse;
        padding:10px 10px;
      }
      .user-modal-bd{
        height:200px;
        overflow-y:auto;

      }
    }
  }
</style>
