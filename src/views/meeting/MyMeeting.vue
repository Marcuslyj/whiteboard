<!--
Description
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2020-05-04 09:29:35
@version 1.0.0
-->
<template>
  <div class="my-meeting">
    <div class="search-bar">
       <div class="add-meeting">
         <Input v-model="meetingId" icon="md-arrow-forward" placeholder="输入会议id,加入会议" style="width: 200px" />
       </div>
       <div class="right">
        <Input v-model="searchKey" icon="ios-search-outline" placeholder="搜索会议id/主题" style="width: 200px" />
       </div>
    </div>
    <Row class="show-header">
      <div class="tabs">
        <div :class="['tab-item',`${activeTab==='mine'?'active':''}`]" @click="changeTab('mine')">我创建的会议</div>
        <div :class="['tab-item',`${activeTab!=='mine'?'active':''}`]" @click="changeTab('toJoin')">待参加的会议<Badge style="margin-left:10px" :count="total.toJoin"></Badge></div>
      </div>
      <div class="right">
        <Select v-model="sortType" style="width:200px">
          <Option v-for="item in sortList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <span class="list-mode-btn" @click="changeListMode">
        <i :class="['iconfont',`icon-${isList?'qiapian':'liebiao'}`]"></i>
        </span>
      </div>
    </Row>
    <Row class="m-body">
      <template v-if="activeTab==='mine'">
        <Table v-show="isList" :columns="columns" :data="meetingData.mine" stripe ></Table>
        <meeting-card v-show="!isList" :list="meetingData.mine"></meeting-card>
        <div class="footer">
          <Page v-show="total.mine>0"
            :total="total.mine"
            :current="pagination.mine.pageNum"
            :page-size="pagination.mine.pageSize"
            @on-change="setPaginationNum"
            @on-page-size-change="setPaginationSize"
            show-elevator
            show-sizer
            transfer
            show-total
          ></Page>
        </div>
      </template>
      <template v-else>
        <Table v-show="isList" :columns="columns" :data="meetingData.toJoin" stripe ></Table>
        <meeting-card v-show="!isList" :list="meetingData.mine"></meeting-card>
        <div class="footer">
          <Page v-show="total.toJoin>0"
            :total="total.toJoin"
            :current="pagination.toJoin.pageNum"
            :page-size="pagination.toJoin.pageSize"
            @on-change="setPaginationNum"
            @on-page-size-change="setPaginationSize"
            show-elevator
            show-sizer
            transfer
            show-total
          ></Page>
        </div>
      </template>
    </Row>
  </div>
</template>

<script>
import {
  Select, Option, Badge, Table, Page, Tag,
} from 'view-design'
import { api } from '@common/common'
import MeetingCard from '@/components/meetingCard/MeetingCard'
import { getDateStr, getTimeStr, formateUrl } from '@common/utils'

export default {
  components: {
    MeetingCard,
    Select,
    Option,
    Badge,
    Table,
    Page,
  },
  data() {
    return {
      meetingId: '',
      searchKey: '',
      sortType: 0,
      // 是列表模式(还有卡片模式)
      isList: true,
      activeTab: 'mine',
      sortList: [
        { value: 0, label: '按时间从远到近' },
        { value: 1, label: '按时间从近到远' },
        { value: 2, label: '按主题A-Z' },
        { value: 3, label: '按主题Z-A' },
      ],
      sortMap: [
        { sortMark: 'DESC', sortRule: 1 },
        { sortMark: 'ASC', sortRule: 1 },
        { sortMark: 'DESC', sortRule: 2 },
        { sortMark: 'ASC', sortRule: 2 },
      ],
      meetingData: {
        mine: [],
        toJoin: [],
      },
      columns: [
        {
          title: '会议ID',
          key: 'meetingId',
          width: 80,
          align: 'center',
        },
        {
          title: '会议主题',
          width: 150,
          key: 'theme',
        },
        {
          title: '发起人',
          width: 80,
          key: 'creator',
        },
        {
          title: '会议日期',
          width: 120,
          render: (h, params) => h('span', getDateStr(new Date(params.row.startTime))),
        },
        {
          title: '会议时间',
          width: 120,
          render: (h, params) => h('span', `${getTimeStr(new Date(params.row.startTime))}~${getTimeStr(new Date(params.row.endTime))}`),
        },
        {
          title: '会议地点',
          width: 120,
          key: 'address',
        }, {
          title: '参会人员',
          minWidth: 200,
          render: (h, params) => {
            let resStr = params.row.users.reduce((sum, e, i) => {
              if (i > 0) {
                return `${sum}、${e.realName}`
              }
              return e.realName
            }, '')
            return h('span', resStr)
          },
        },
        {
          title: '状态',
          width: 200,
          render: (h, params) => h('div', [
            h(Tag, {
              props: {
                color: '#607d8b',
              },
            }, params.row.type === 0 ? '公开' : '私密'),
            h(Tag, {
              props: {
                color: '#607d8b',
              },
            }, params.row.endTime >= Date.now() && params.row.startTime <= Date.now() ? '进行中' : params.row.endTime < Date.now() ? '结束' : '未开始'),
          ]),
        },
        {
          title: '操作',
          width: 'auto',
          render: (h, params) => h('div', [
            h('icon', {
              props: {
                type: 'ios-create-outline',
                size: '24',
              },
              on: {
                click: () => {
                  this.share(params.row)
                },
              },
            }),
            h('icon', {
              props: {
                type: 'ios-share-alt-outline',
                size: '24',
              },
              on: {
                click: () => {
                  this.share(params.row)
                },
              },
            }),
            h('icon', {
              props: {
                type: 'ios-close-circle-outline',
                size: '24',
              },
              on: {
                click: () => {
                  this.showdeleteModal(params.row.meetingId)
                },
              },
            }),
          ]),
        },

      ],
      pagination: {
        mine: {
          pageNum: 1,
          pageSize: 10,
        },
        toJoin: {
          pageNum: 1,
          pageSize: 10,
        },
      },
      total: {
        mine: 0,
        toJoin: 0,
      },
    }
  },
  created() {
    this.getMeetings('mine')
    this.getMeetings('toJoin')
  },
  methods: {
    changeTab(name) {
      this.activeTab = name
    },
    changeListMode() {
      this.isList = !this.isList
    },
    getMeetings(type) {
      this.$api.get(
        api.meeting.meetings,
        {
          meetingType: type === 'mine' ? 1 : 2,
          queryParam: this.searchKey,
          ...this.pagination[type],
          ...this.sortMap[this.sortType],
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
            this.total[type] = res.data.pagination.count
            this.meetingData[type] = res.data.meetings
          } else {
            this.$Message.error(res.ret.retMsg)
          }
        },
        (err) => {
          this.$Message.error(err.message)
        },
      )
    },
    setPaginationNum(num) {
      this.setPagination(this.activeTab, 'pageNum', num)
    },
    setPaginationSize(num) {
      this.setPagination(this.activeTab, 'pageSize', num)
    },
    setPagination(type, key, value) {
      this.$set(this.pagination[type], key, value)
      this.getMeeting(this.activeTab)
    },
    share(params) {
      console.log(params)
    },
    showdeleteModal(meetingId) {
      this.$confirm(' 确定删除当前所选会议？', () => {
        this.deleteMeeting(meetingId)
      })
    },
    deleteMeeting(meetingId) {
      if (meetingId && !isNaN(meetingId)) {
        this.$api.delete(
          formateUrl(api.meeting.delete, { meetingId }),
          {},
          (res) => {
            if (res.ret.retCode === '0') {
              this.$Message.success('删除成功')
              this.getMeeting(this.activeTab)
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
  },
}
</script>

<style lang="scss" scoped>
  .my-meeting{
    width:100%;
    min-width:400px;
    .search-bar{
      display:flex;
      padding:10px 20px;
      position:relative;
      .right{
        position: absolute;
        right:20px;
        top:10px;
      }
    }
    .show-header{
      position: relative;
      .tabs{
        display:inline-block;
        margin-left:20px;
        .tab-item{
          display:inline-block;
          cursor: pointer;
          font-size:16px;
          background:#eee;
          padding:5px 10px;
          border-radius:4px;
          &:not(:first-child){
            margin-left:16px;
          }
          &:hover{
            color:#57a3f3;
          }
          &.active{
            background:#57a3f3;
             color:#fff;
          }
        }
      }
      .right{
        position: absolute;
        right:20px;
        top:0;
        display: flex;
        align-items: center;
        .list-mode-btn{
          font-size:24px;
          margin-left:10px;
          cursor: pointer;
        }
      }
    }
    .m-body{
      margin:16px 20px 0;
      .footer{
        padding:16px 0;
        text-align: center;
      }
      /deep/ .ivu-table{
        .ivu-icon{
          cursor: pointer;
          &:not(:first-child){
            // margin-left:10px;
          }
        }
      }
    }

  }
</style>
