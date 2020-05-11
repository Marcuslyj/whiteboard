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
        <div :class="['tab-item',`${activeTab==='mine'?'active':''}`]" >我创建的会议</div>
        <div :class="['tab-item',`${activeTab!=='mine'?'active':''}`]">待参加的会议<Badge :count="total.toJoin"></Badge></div>
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
  Select, Option, Badge, Table, Page,
} from 'view-design'
import { api } from '@common/common'
import MeetingCard from '@/components/meetingCard/MeetingCard'

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
        },
        {
          title: '会议主题',
          key: 'theme',
        },
        {
          title: '发起人',
          key: 'creator',
        },
        {
          title: '会议日期',
          key: 'date',
        },
        {
          title: '会议时间',
          key: 'time',
        },
        {
          title: '会议地点',
          key: 'address ',
        }, {
          title: '参会人员',
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
        },
        {
          title: '操作',
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
    setPaginationSize() {

    },
    setPaginationNum() {

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
    }

  }
</style>
