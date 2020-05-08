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
        <Input v-model="meetingId" icon="ios-search-outline" placeholder="搜索会议id/主题" style="width: 200px" />
       </div>
    </div>
    <Row class="show-header">
      <div class="tabs">
        <div :class="['tab-item',`${activeTab==='myCreate'?'active':''}`]" >我创建的会议</div>
        <div :class="['tab-item',`${activeTab!=='myCreate'?'active':''}`]">待加入的会议<Badge count="3"></Badge></div>
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
    <Row>
    <Table>
    </Table>
    </Row>
  </div>
</template>

<script>
import { Select, Option, Badge } from 'view-design'

export default {
  components: { Select, Option, Badge },
  data() {
    return {
      meetingId: '',
      sortType: 1,
      isList: true,
      activeTab: 'myCreate',
      sortList: [
        { value: 0, label: '按时间从远到近' },
        { value: 1, label: '按时间从近到远' },
        { value: 2, label: '按主题A-Z' },
        { value: 3, label: '按主题Z-A' },
      ],
    }
  },
  methods: {
    changeListMode() {
      this.isList = !this.isList
    },
  },
}
</script>

<style lang="scss" scoped>
  .my-meeting{
    width:100%;
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
  }
</style>
