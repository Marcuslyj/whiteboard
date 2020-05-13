<!--
Description
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2020-05-04 09:29:47
@version 1.0.0
-->
<template>
  <div>
    <Row class="search-bar">
        <Input v-model="searchKey" icon="ios-search-outline" placeholder="搜索会议id/主题" style="width: 200px"  @on-enter="search" @on-click="search"/>
    </Row>
    <Row class="show-header">
        <Select v-model="sortType" style="width:200px" @on-change="changeSortType">
          <Option v-for="item in sortList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
    </Row>
    <Row class="m-body">
      <Table :columns="columns" :data="hmeetingData" stripe  @on-row-click="openMeeting"></Table>
    </Row>
    <footer>
      <Page v-show="total>0"
        :total="total"
        :current="pagination.pageNum"
        :page-size="pagination.pageSize"
        @on-change="setPaginationNum"
        @on-page-size-change="setPaginationSize"
        show-elevator
        show-sizer
        transfer
        show-total
     ></Page>
  </footer>
  </div>
</template>

<script>
import {
  Select, Option, Table, Page,
} from 'view-design'
import { api } from '@common/common'
import { getDateStr, getTimeStr } from '@common/utils'

export default {
  components: {
    Select, Option, Table, Page,
  },
  data() {
    return {
      searchKey: '',
      sortType: 0,
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
      hmeetingData: [],
      columns: [
        {
          title: '会议ID',
          key: 'meetingId',
          align: 'center',
          width: 80,
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
          render: (h, params) => h('span', getDateStr(new Date(params.row.startTime))),
        },
        {
          title: '会议时间',
          render: (h, params) => h('span', `${getTimeStr(new Date(params.row.startTime))}~${getTimeStr(new Date(params.row.endTime))}`),
        },
        {
          title: '会议地点',
          key: 'address',
        },
      ],
      pagination: {
        pageNum: 1,
        pageSize: 10,
      },
      total: 0,
    }
  },
  created() {
    this.getHMeetings(3)
  },
  methods: {
    getHMeetings() {
      this.$api.get(
        api.meeting.meetings,
        {
          meetingType: 3,
          queryParam: this.searchKey,
          ...this.pagination,
          ...this.sortMap[this.sortType],
        },
        (res) => {
          if (res.ret.retCode === '0') {
            for (let i = 0, len = res.data.meetings.length; i < len; i++) {
              const cur = res.data.meetings[i]
              // 本地开发
              if (process.env.NODE_ENV === 'development') {
                cur.link = `/#/${cur.meetingId}/whiteboard`
              } else {
                cur.link = `${process.env.VUE_APP_baseUrl.replace(
                  '/api',
                  '',
                )}index.html#/${cur.meetingId}/whiteboard`
              }
            }
            this.total = res.data.pagination.count
            this.hmeetingData = res.data.meetings
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
      this.pagination.pageNum = num
      this.getHMeetings()
    },
    setPaginationSize(size) {
      this.pagination.pageSize = size
      this.getHMeetings()
    },
    changeSortType(value) {
      this.sortType = value
      this.getHMeetings()
    },
    search() {
      this.getHMeetings()
    },
    openMeeting(row) {
      window.location.href = row.link
    },
  },
}
</script>

<style lang="scss" scoped>
  .search-bar{
    display:flex;
    padding:10px 20px;
    flex-direction: row-reverse;
  }
  .show-header{
     display:flex;
    padding:10px 20px;
    flex-direction: row-reverse;
  }
  .m-body{
    margin:16px 20px 0;
  }
  footer{
    padding:16px 0;
    text-align: center;
  }
</style>
