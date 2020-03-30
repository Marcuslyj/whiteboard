<template>
  <Row type="flex" justify="center" align="middle">
    <div class="mi-header">
      <Tooltip content="退出" placement="bottom" class="mi-header-user">
        <icon type="ios-contact" @click="logout" />
      </Tooltip>
    </div>
    <Col span="16" class="mi-meeting">
      <Tabs :value="active" @on-click="changeTab">
        <TabPane label="我的会议" name="mine" id="mine">
          <div id="mi-meeting-mine">
            <div class="mi-meeting-list">
              <div class="mi-meeting-search">
                <Input
                  type="text"
                  suffix="ios-search"
                  placeholder="搜索会议主题 / 地点"
                  size="large"
                  :max-length="64"
                  v-model="search.subject"
                  @on-enter="searchMeeting"
                  @on-change="searchMeeting"
                />
                <Tooltip content="创建会议" placement="top-end">
                  <icon
                    type="ios-add-circle-outline"
                    size="30"
                    style="margin-left: 16px;cursor: pointer;"
                    @click="setMeetingModal()"
                  />
                </Tooltip>
              </div>
              <div
                class="mi-meeting-item"
                v-for="(meet, index) in meeting.mine"
                :key="index"
              >
                <div class="mi-meeting-item-title">
                  <div class="subject">
                    <a :href="meet.link" target="_blank" style="color: #515a6e;"
                      ><span>会议主题：{{ meet.theme }}</span></a
                    >
                    <span
                      class="status state"
                      v-html="meet.type === 1 ? '私密' : '公开'"
                      :class="meet.type === 1 ? 'primary' : null"
                    ></span>
                    <span
                      class="status waiting"
                      v-if="meet.startTime > Date.now()"
                      >待参加</span
                    >
                    <span
                      class="status being"
                      v-else-if="
                        meet.startTime < Date.now() && Date.now() < meet.endTime
                      "
                      >进行中</span
                    >
                    <span class="status end" v-else>已结束</span>
                  </div>
                  <div class="share">
                    <Tooltip
                      content="修改会议"
                      placement="top"
                      style="margin-right: 8px;"
                    >
                      <icon
                        type="ios-create-outline"
                        size="24"
                        @click="setMeetingModal(meet.meetingId)"
                      />
                    </Tooltip>
                    <Tooltip
                      content="分享会议"
                      placement="top"
                      style="margin-right: 8px;"
                    >
                      <icon
                        type="ios-share-alt-outline"
                        size="24"
                        @click="setShareModal(meet.meetingId)"
                      />
                    </Tooltip>
                    <Tooltip content="取消会议" placement="top">
                      <icon
                        type="ios-close-circle-outline"
                        size="22"
                        @click="setDeleteModal(meet.meetingId)"
                      />
                    </Tooltip>
                  </div>
                </div>
                <div class="mi-meeting-item-info">
                  <span>会议时间：{{ meet.meetingTimeText }}</span>
                  <span>会议地点：{{ meet.address || "-" }}</span>
                </div>
                <div class="mi-meeting-item-people" v-if="meet.type === 1">
                  <span>参会人员：</span>
                  <span
                    class="name"
                    v-for="(user, i) in meet.users"
                    :key="i"
                    v-html="user.realName"
                  ></span>
                </div>
              </div>
              <div class="mi-meeting-item-none" v-if="meeting.mine.length <= 0">
                暂无会议
              </div>
            </div>
            <div class="mi-pagination">
              <span class="pagination-total">
                共 {{ total.mine }} 条记录 第 {{ pagination.mine.pageNum }} /
                {{ Math.ceil(total.mine / pagination.mine.pageSize) }} 页
              </span>
              <Page
                :total="total.mine"
                :current="pagination.mine.pageNum"
                :page-size="pagination.mine.pageSize"
                @on-change="setPaginationNum"
                @on-page-size-change="setPaginationSize"
                show-elevator
                show-sizer
                transfer
              ></Page>
            </div>
          </div>
        </TabPane>
        <TabPane :label="label" name="soon" id="soon">
          <div id="mi-meeting-soon">
            <div class="mi-meeting-list">
              <div class="mi-meeting-search">
                <Input
                  type="text"
                  suffix="ios-search"
                  placeholder="搜索会议主题 / 地点"
                  size="large"
                  :max-length="64"
                  v-model="search.subject"
                  @on-enter="searchMeeting"
                  @on-change="searchMeeting"
                />
              </div>
              <div
                class="mi-meeting-item"
                v-for="(meet, index) in meeting.soon"
                :key="index"
              >
                <div class="mi-meeting-item-title">
                  <a :href="meet.link" target="_blank" style="color: #515a6e;"
                    ><span>会议主题：{{ meet.theme }}</span></a
                  >
                </div>
                <div class="mi-meeting-item-info">
                  <span>会议时间：{{ meet.meetingTimeText }}</span>
                  <span>会议地点：{{ meet.address || "-" }}</span>
                  <span>发起人：{{ meet.creator || "-" }}</span>
                </div>
              </div>
              <div class="mi-meeting-item-none" v-if="meeting.soon.length <= 0">
                暂无会议
              </div>
            </div>
            <div class="mi-pagination">
              <span class="pagination-total">
                共 {{ total.soon }} 条记录 第 {{ pagination.soon.pageNum }} /
                {{ Math.ceil(total.soon / pagination.soon.pageSize) }} 页
              </span>
              <Page
                :total="total.soon"
                :current="pagination.soon.pageNum"
                :page-size="pagination.soon.pageSize"
                @on-change="setPaginationNum"
                @on-page-size-change="setPaginationSize"
                show-elevator
                show-sizer
                transfer
              ></Page>
            </div>
          </div>
        </TabPane>
        <TabPane label="历史会议" name="history" id="history">
          <div id="mi-meeting-history">
            <div class="mi-meeting-list">
              <div class="mi-meeting-search">
                <Input
                  type="text"
                  suffix="ios-search"
                  placeholder="搜索会议主题 / 地点"
                  size="large"
                  :max-length="64"
                  v-model="search.subject"
                  @on-enter="searchMeeting"
                  @on-change="searchMeeting"
                />
              </div>
              <div
                class="mi-meeting-item"
                v-for="(meet, index) in meeting.history"
                :key="index"
              >
                <div class="mi-meeting-item-title">
                  <a :href="meet.link" target="_blank" style="color: #515a6e;"
                    ><span>会议主题：{{ meet.theme }}</span></a
                  >
                </div>
                <div class="mi-meeting-item-info">
                  <span>会议时间：{{ meet.meetingTimeText }}</span>
                  <span>会议地点：{{ meet.address || "-" }}</span>
                  <span>发起人：{{ meet.creator || "-" }}</span>
                </div>
              </div>
              <div
                class="mi-meeting-item-none"
                v-if="meeting.history.length <= 0"
              >
                暂无会议
              </div>
            </div>
            <div class="mi-pagination">
              <span class="pagination-total">
                共 {{ total.history }} 条记录 第
                {{ pagination.history.pageNum }} /
                {{ Math.ceil(total.history / pagination.history.pageSize) }} 页
              </span>
              <Page
                :total="total.history"
                :current="pagination.history.pageNum"
                :page-size="pagination.history.pageSize"
                @on-change="setPaginationNum"
                @on-page-size-change="setPaginationSize"
                show-elevator
                show-sizer
                transfer
              ></Page>
            </div>
          </div>
        </TabPane>
      </Tabs>
    </Col>
    <Modal
      title="创建会议"
      class-name="mi-modal"
      width="560"
      v-model="modal"
      footer-hide
    >
      <Form
        :model="model"
        :rules="rules"
        :label-width="80"
        style="margin-top: 16px;"
        ref="form"
      >
        <FormItem prop="subject" label="会议主题">
          <Input
            v-model="model.subject"
            maxlength="32"
            placeholder="请输入会议主题"
          />
        </FormItem>
        <FormItem prop="datetime" label="会议时间">
          <DatePicker
            type="date"
            v-model="model.date"
            :options="date"
            placeholder="请选择会议时间"
            @on-change="setDate"
            clearable
            :editable="false"
          ></DatePicker>
          <TimePicker
            type="timerange"
            v-model="model.time"
            placeholder="请选择会议具体时间点"
            format="HH:mm"
            @on-change="setTime"
            :editable="false"
            style="margin-left: 16px;"
          ></TimePicker>
        </FormItem>
        <FormItem prop="address" label="会议地点">
          <Input v-model="model.address" placeholder="请输入会议地点" />
        </FormItem>
        <FormItem prop="type" label="房间类型">
          <RadioGroup v-model="model.type" @on-change="setRoomType">
            <Radio label="0">公开</Radio>
            <Radio label="1">私密</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem prop="people" label="参会人员" v-if="model.type === '1'">
          <div class="mi-modal-item-people">
            <div class="mi-modal-item-people-search">
              <Input
                type="text"
                v-model="name"
                suffix="ios-search"
                placeholder="搜索用户名"
                :max-length="64"
              />
            </div>
            <div class="mi-modal-item-people-list">
              <div class="mi-modal-item-people-list-box">
                <Tree
                  :data="people"
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
          <Button @click="setMeetingModal()" style="margin-left: 16px;"
            >取消</Button
          >
        </FormItem>
      </Form>
    </Modal>
    <Modal class-name="mi-modal" v-model="share.modal" footer-hide>
      <div class="mi-modal-item" style="margin-top: 16px;">
        <div class="mi-modal-item-title">会议链接</div>
        <div class="mi-modal-item-content">
          <Input type="text" v-model="share.link"></Input>
          <Button
            type="primary"
            v-clipboard:copy="share.link"
            v-clipboard:success="copyShareLinkSuccess"
            v-clipboard:error="copyShareLinkFailed"
          >
            复制
          </Button>
        </div>
      </div>
    </Modal>
    <Modal
      class-name="mi-modal mi-modal-delete"
      width="300"
      v-model="confirm.modal"
      footer-hide
    >
      <div class="mi-modal-confirm">
        <icon type="ios-help-circle" />
        确定删除当前所选会议？
      </div>
      <div class="mi-modal-confirm">
        <Button style="margin-right: 16px" @click="setDeleteModal">取消</Button>
        <Button type="primary" @click="deleteMeeting">确定</Button>
      </div>
    </Modal>
  </Row>
</template>

<script>
import Vue from 'vue'
import VueClipboard from 'vue-clipboard2'
import {
  Row,
  Col,
  Input,
  Table,
  Tabs,
  TabPane,
  Page,
  Icon,
  Badge,
  DatePicker,
  TimePicker,
  Tree,
  Form,
  FormItem,
  Button,
  Message,
  RadioGroup,
  Radio,
  Tooltip,
} from 'view-design'

Vue.use(VueClipboard)

const components = {
  Row,
  Col,
  Input,
  Table,
  Tabs,
  TabPane,
  Page,
  Icon,
  Badge,
  DatePicker,
  TimePicker,
  Tree,
  Form,
  FormItem,
  Button,
  Message,
  RadioGroup,
  Radio,
  Tooltip,
}
Object.keys(components).forEach((key) => {
  Vue.component(key, components[key])
})
Vue.prototype.$Message = Message
const AuthorityMeetingComponent = {
  data() {
    const validateDateTime = (rule, value, callback) => {
      if (Object.keys(value).length > 0) {
        if (!value.date) {
          callback(new Error('请选择会议时间'))
        } else if (!value.time) {
          callback(new Error('请选择会议具体时间点'))
        } else {
          const stime = new Date(`${value.date} ${value.time[0]}`)
          const etime = new Date(`${value.date} ${value.time[1]}`)
          const dtime = etime - stime
          if (dtime <= 0) {
            callback(new Error('会议结束时间必须大于开始时间'))
          }
          callback()
        }
      }
      callback(new Error('请选择会议时间'))
    }
    const validatorUsers = (rule, value, callback) => {
      if (parseInt(value.type) === 1) {
        if (value.list.length <= 0) {
          callback(new Error('请选择参会人员'))
        }
        callback()
      }
      callback()
    }
    return {
      sid: null,
      salt: 'LOlKxO0wSRrnxgSA',
      active: 'mine',
      height: 'auto',
      cates: {
        mine: 1,
        soon: 2,
        history: 3,
      },
      modal: false,
      search: {
        subject: null,
        timer: null,
        page: 0,
      },
      timer: null,
      name: null,
      meeting: {
        mine: [],
        soon: [],
        history: [],
      },
      users: [],
      people: [],
      date: {
        disabledDate(date) {
          return date && date.valueOf() < Date.now() - 86400000
        },
      },
      pagination: {
        mine: {
          pageNum: 1,
          pageSize: 10,
        },
        soon: {
          pageNum: 1,
          pageSize: 10,
        },
        history: {
          pageNum: 1,
          pageSize: 10,
        },
      },
      total: {
        mine: 0,
        soon: 0,
        history: 0,
      },
      share: {
        modal: false,
        link: null,
      },
      confirm: {
        id: 0,
        modal: false,
      },
      loading: false,
      model: {
        subject: null,
        date: null,
        time: null,
        datetime: {},
        address: null,
        type: '0',
        people: {
          type: '0',
          list: [],
        },
        users: [],
      },
      rules: {
        subject: [{ required: true, message: '请输入会议主题' }],
        datetime: [{ required: true, validator: validateDateTime }],
        address: [{ required: true, message: '请输入会议地点' }],
        type: [{ required: true, message: '请选择房间类型' }],
        people: [{ validator: validatorUsers }],
      },
      firstIn: true,
      attend: 1,
      label: (h) => h('div', [
        h('span', '待参加会议'),
        h('Badge', {
          props: {
            count: this.attend,
          },
        }),
      ]),
    }
  },
  methods: {
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
    changeTab(name) {
      this.active = name
      this.setCookie('meeting-active-type', name)
      this.search = {
        subject: null,
        timer: null,
        page: 0,
      }
      this.getMeeting()
    },
    searchMeeting() {
      if (this.search.timer) clearTimeout(this.search.timer)
      this.search.timer = setTimeout(() => {
        if (this.search.subject && this.search.page <= 0) {
          this.search.page = this.pagination[this.active].pageNum
        }
        if (!this.search.subject) {
          this.pagination[this.active].pageNum = this.search.page > 0 ? this.search.page : 1
          this.search.page = 0
        } else {
          this.pagination[this.active].pageNum = 1
        }
        this.getMeeting()
      }, 300)
    },
    getUsers() {
      this.$api.get(
        '/user-manager/user-tree',
        {
          queryParam: this.name,
        },
        (res) => {
          if (res.ret.retCode === '0') {
            this.users = res.data
            this.people = res.data
          } else {
            this.$Message.error(res.ret.retMsg)
          }
        },
        (err) => {
          this.$Message.error(err.message)
        },
      )
    },
    getMeeting(type = null) {
      this.$api.get(
        '/meeting-manager/meetings',
        {
          meetingType: type ? parseInt(type) : this.cates[this.active],
          queryParam: this.search.subject,
          ...this.pagination[this.active],
        },
        (res) => {
          if (res.ret.retCode === '0') {
            for (let i = 0, len = res.data.meetings.length; i < len; i++) {
              const cur = res.data.meetings[i]
              cur.link = `${process.env.VUE_APP_baseUrl.replace(
                '/api',
                '',
              )}index.html#/whiteboard/${cur.meetingId}`
            }
            if (this.firstIn) {
              this.firstIn = false
              this.getMeeting(2)
            }
            if (type) {
              this.attend = res.data.pagination.count
            } else {
              this.total[this.active] = res.data.pagination.count
              this.meeting[this.active] = res.data.meetings
              this.$nextTick(() => {
                this.setHeight()
              })
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
    createMeeting() {
      if (this.loading) return
      this.loading = true
      this.$refs.form.validate((valid) => {
        if (valid) {
          const startTime = `${this.model.datetime.date} ${this.model.datetime.time[0]}:00`
          const stime = new Date(startTime).getTime()
          const ntime = new Date().getTime()
          if (stime <= ntime) {
            this.loading = false
            this.$Message.error('会议开始时间不能小于当前时间')
          } else {
            const params = {
              theme: this.model.subject,
              startTime,
              endTime: `${this.model.datetime.date} ${this.model.datetime.time[1]}:00`,
              address: this.model.address,
              type: parseInt(this.model.type),
              userIds: this.model.users,
            }
            if (this.model.id) {
              this.updateMeeting(params)
            } else {
              this.$api.post(
                '/meeting-manager/meeting',
                params,
                (res) => {
                  this.loading = false
                  if (res.ret.retCode === '0') {
                    this.$Message.success('创建成功')
                    this.setMeetingModal()
                    this.getMeeting()
                    this.attend++
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
          }
        } else this.loading = false
      })
    },
    editMeeting(id) {
      if (!id || isNaN(id)) {
        this.$Message.error('会议ID有误，请刷新后再试')
        this.setMeetingModal()
      } else {
        this.$api.get(
          `/meeting-manager/meeting/${id}`,
          {},
          (res) => {
            if (res.ret.retCode === '0') {
              this.model.id = res.data.meetingId
              this.model.subject = res.data.theme
              this.model.address = res.data.address
              this.model.date = res.data.meetingYear
              this.model.time = res.data.meetingHms
              this.model.datetime = {
                date: res.data.meetingYear,
                time: res.data.meetingHms,
              }
              this.model.type = res.data.type.toString()
              this.model.people = {
                type: this.model.type,
                list: res.data.userTree,
              }
              this.people = res.data.userTree
              this.model.users = res.data.userIds
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
    updateMeeting(params) {
      params.meetingId = this.model.id
      this.$api.put(
        `meeting-manager/meeting/${this.model.id}`,
        params,
        (res) => {
          this.loading = false
          if (res.ret.retCode === '0') {
            this.model.id = 0
            this.$Message.success('更新成功')
            this.setMeetingModal()
            this.getMeeting()
          } else {
            this.$Message.error(res.ret.retMsg)
          }
        },
        (err) => {
          this.loading = false
          this.$Message.error(err.message)
        },
      )
    },
    deleteMeeting() {
      const { id } = this.confirm
      if (id && !isNaN(id)) {
        this.$api.delete(
          `/meeting-manager/meeting/${id}`,
          {},
          (res) => {
            if (res.ret.retCode === '0') {
              this.setDeleteModal()
              this.$Message.success('删除成功')
              this.getMeeting()
            } else {
              this.$Message.error(res.ret.retMsg)
            }
          },
          (err) => {
            this.$Message.error(err.message)
          },
        )
      } else {
        this.$Message.error('会议ID有误，请刷新后再试')
      }
    },
    createShareLink(id) {
      if (!id) {
        this.$Message.error('会议ID有误，分享链接生成失败')
        this.setMeetingModal()
      } else {
        this.share.link = `${process.env.VUE_APP_baseUrl.replace(
          '/api',
          '',
        )}index.html#/whiteboard/${id}`
      }
    },
    copyShareLinkSuccess() {
      this.$Message.success('复制成功')
    },
    copyShareLinkFailed() {
      this.$Message.error('复制失败')
    },
    setHeight() {
      for (let i in this.cates) {
        if (this.cates.hasOwnProperty(i)) {
          const id = `mi-meeting-${i}`
          const height = document.getElementById(id).clientHeight + 64
          const element = document.getElementById(i)
          if (i === this.active) {
            if (element) element.style.height = `${height}px`
          } else if (element) element.style.height = 0
        }
      }
    },
    setMeetingModal(id) {
      this.modal = !this.modal
      this.$refs.form.resetFields()
      this.model.date = this.model.time = null
      this.model.id = 0
      if (this.modal) {
        if (id) this.editMeeting(id)
      }
    },
    setShareModal(id) {
      this.share.modal = !this.share.modal
      if (this.share.modal) {
        this.createShareLink(id)
      } else {
        this.share.link = null
      }
    },
    setDeleteModal(id) {
      this.confirm.modal = !this.confirm.modal
      if (id) this.confirm.id = id
    },
    setDate(date) {
      delete this.model.datetime.date
      if (date) this.model.datetime.date = date
    },
    setTime(time) {
      delete this.model.datetime.time
      if (time) this.model.datetime.time = time
    },
    setRoomType(value) {
      this.model.people.type = value
    },
    setUsers(value) {
      const users = []
      for (let i = 0, len = value.length; i < len; i++) {
        if (!value[i].children || value[i].children.length <= 0) { users.push(value[i].id) }
      }
      this.model.users = users
      this.model.people.list = users
    },
    setPagination(type, key, value) {
      this.$set(this.pagination[type], key, value)
      this.getMeeting()
    },
    setPaginationNum(num) {
      this.setPagination(this.active, 'pageNum', num)
    },
    setPaginationSize(num) {
      this.setPagination(this.active, 'pageSize', num)
    },
  },
  created() {
    const visitor = this.getCookie('visitor')
    this.sid = this.getCookie('sid')
    if (!this.sid || visitor === 'true') {
      this.$router.push({ name: 'login' })
    } else {
      const active = this.getCookie('meeting-active-type')
      if (active) this.active = active
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.getUsers()
      this.getMeeting()
    })
  },
  destroyed() {
    this.delCookie('meeting-active-type')
  },
}
export default AuthorityMeetingComponent
</script>

<style lang="less">
  body {overflow: auto;}
@mi-meeting: mi-meeting;
@mi-pagination: mi-pagination;
@mi-header: mi-header;
@mi-modal: mi-modal;
.@{mi-header} {
  height: 60px;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  background: #e6e6e6;
  z-index: 1;
  &-user {
    position: absolute;
    right: 20px;
    top: 10px;
    cursor: pointer;
    .ivu-icon {
      font-size: 40px;
      color: #999;
    }
  }
}
.@{mi-meeting} {
  position: relative;
  &-search {
    margin-bottom: 32px;
    padding-bottom: 32px;
    border-bottom: 1px solid #f2f2f2;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .ivu-input-wrapper {
      width: 350px;
    }
  }
  .ivu-badge {
    margin-left: 6px;
    vertical-align: 2px;
  }
  .ivu-badge-count-alone {
    line-height: 16px;
  }
  &-item {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: column;
    padding-bottom: 32px;
    margin-bottom: 32px;
    border-bottom: 1px solid #f2f2f2;
    &:last-child {
      padding-bottom: 0;
      margin-bottom: 16px;
      border-bottom: none;
    }
    .subject {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    &-title {
      font-weight: 700;
      font-size: 16px;
      letter-spacing: 2px;
      font-family: "微软雅黑";
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      width: 100%;
      span.subject {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      span.status {
        color: #fff;
        font-size: 12px;
        margin-left: 8px;
        padding: 2px 8px;
        border-radius: 4px;
        background: #9e9e9e;
        text-align: center;
        font-weight: 400;
      }
      span.waiting {
        background: #f56c6c;
        color: #fff;
      }
      span.being {
        background: #5cb85c;
        color: #fff;
      }
      span.state {
        background: #00bcd4;
      }
      span.primary {
        background: #ff9800;
      }
      .share {
        .ivu-icon {
          cursor: pointer;
          font-size: 20px;
          color: #666;
        }
      }
    }
    &-info {
      display: flex;
      align-items: center;
      justify-content: center;
      span {
        margin-right: 84px;
        &:last-child {
          margin-right: 0;
        }
      }
    }
    &-people {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      flex-wrap: wrap;
      margin-top: 16px;
      margin-bottom: -16px;
      span {
        margin-bottom: 16px;
      }
      .name {
        padding: 2px 12px;
        background: #607d8b;
        color: #fff;
        border-radius: 4px;
        margin-right: 16px;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      &:last-child {
        margin-right: 0;
      }
    }
    &-none {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
      font-size: 20px;
      color: #999;
    }
  }
  .ivu-tabs-bar {
    background: #e6e6e6;
    border-bottom: none;
    position: fixed;
    top: 0;
    z-index: 10;
    .ivu-tabs-tab {
      height: 60px;
      line-height: 60px;
      padding: 0 32px;
      font-size: 16px;
    }
  }
  .ivu-tabs-content {
    margin-top: 90px;
    margin-bottom: 32px;
  }
  .ivu-tabs .ivu-tabs-tabpane {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 32px;
  }
  .@{mi-pagination} {
    padding: 24px 0 0 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .ivu-page {
      .ivu-select-placeholder,
      .ivu-select-selected-value,
      .ivu-select-dropdown-list .ivu-select-item {
        font-size: 14px !important;
      }
      input[type="text"] {
        text-align: center;
        font-size: 14px;
      }
      .ivu-page-total {
        vertical-align: bottom;
        color: #999;
      }
      .ivu-page-item-active {
        background-color: #409eff;
        a {
          color: #fff;
        }
      }
    }
    .pagination-total {
      margin-right: 15px;
      color: #bababa;
      font-size: 14px;
    }
    &.center {
      justify-content: center;
    }
    &.left {
      justify-content: flex-start;
    }
    .wi-pagination-other {
      display: flex;
      position: absolute;
      left: 0;
      color: rgba(0, 0, 0, 0.35);
      cursor: pointer;
    }
  }
}
.@{mi-modal} {
  display: flex;
  align-items: center;
  justify-content: center;
  .ivu-modal {
    top: 0;
  }
  .ivu-modal-body {
    padding: 16px 32px 24px 16px;
  }
  &-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 16px;
    &:last-child {
      margin-bottom: 0;
    }
    &-title {
      width: 70px;
      text-align: left;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    &-people {
      border: 1px solid #dcdee2;
      border-radius: 4px;
      height: 200px;
      min-width: 250px;
      overflow: hidden;
      &-search {
        width: 100%;
        height: 50px;
        background: #ccc;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        .ivu-input-wrapper {
          width: 200px;
          margin-right: 16px;
        }
      }
      &-list {
        padding: 0 16px;
        overflow: scroll;
        margin-right: -21px;
        height: 100%;
        &-box {
          margin-right: 21px;
          margin-bottom: 57px;
        }
      }
    }
    &-content {
      display: flex;
      align-items: center;
      justify-content: center;
      .ivu-input-wrapper {
        width: 320px;
        margin-right: 8px;
      }
    }
  }
  &-delete {
    .ivu-modal-body {
      padding: 16px 16px 24px;
    }
  }
  &-confirm {
    padding: 16px 0 0;
    display: flex;
    align-items: center;
    justify-content: center;
    .ivu-icon {
      color: #ec971f;
      font-size: 32px;
      margin-right: 8px;
    }
  }
}
</style>
