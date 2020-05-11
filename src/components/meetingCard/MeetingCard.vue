<!--
Description
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2020-05-11 09:42:50
@version 1.0.0
-->
<template>
<Row class="meeting-cards" :gutter="10">
    <Col class="card" v-for="(meeting,index) in list" :key="index" :lg="6" :md="8" :sm="12" :xs="24">
        <div class="img-wrapper">
        <img v-lazy="meeting.imgUrl" alt="会议截图">
        <div class="tips">
            <Tag color="success">私密</Tag>
            <Tag color="success">进行中</Tag>
        </div>
        </div>
        <div class="detail">
        <div class="row">
            <div class="left">
            <label>会议主题：</label>
            <span class="content">软件需求评审</span>
            </div>
            <div class="right">
            <label>发起人：</label>
            <span class="content">何浚铭</span>
            </div>
        </div>
            <div class="row">
            <label>日期时间：</label>
            <span class="content">2020年4月20日 9:00～10:30</span>
            </div>
            <div class="row">
            <label>地点：</label>
            <span class="content">南山会议室南山会议室南山会议室  </span>
            </div>
        </div>
        </div>
    </Col>
    </Row>
</template>

<script>
import { Row, Col, Tag } from 'view-design'

export default {
  components: {
    Row, Col, Tag,
  },
  props: {
    list: {
      type: Array,
      default: () => [],
    },
  },
}
</script>

<style lang="scss" scoped>
  .meeting-cards{
    .card{
      cursor: pointer;
    }
    .img-wrapper{
      position: relative;
      >img{
        width:100%;
        height:100%;
      }
      .tips{
        position: absolute;
        top:10px;
        right:10px;
      }
    }
    .row:first-child{
      display: flex;
      justify-content: space-between;
    }
  }
</style>
