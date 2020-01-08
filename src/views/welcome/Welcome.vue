<!--
Description
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2019-12-24 13:41:49
@version 1.0.0
-->
<template>
  <div class="welcome">
      <header>
          <div>
            <img class="logo" :src="require('@assets/logo.png')" alt="">
            <span class="text">电子会议白板</span>
          </div>
      </header>
      <div class="main">
          <h2>电子会议白板</h2>
          <div class="box">
              <div class="input-container">
                  <h4 class="title">开启一个会议</h4>
                  <input placeholder="meetingId，不要修改" v-model="meetingId"/>
              </div>
                <input placeholder="userId 0 表示主讲人，其他非主讲人" v-on="userId"/>
                 <!-- <input placeholder="meetingId" v-model="meetingId"/> -->
             <button class="btn" @click="joinMeet">开始</button>
          </div>
      </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      theme: '',
      userId: '0',
      meetingId: '74',
    }
  },
  methods: {
    joinMeet() {
      const params = { theme: this.theme, userId: this.userId, meetingId: this.meetingId }
      this.$router.push({ name: 'whiteboard', params })
      console.log(`theme:${this.theme}`)
    },
  },
}
</script>

<style lang="scss" scoped>
  .welcome{
    width:100%;
    height:100%;
    background:linear-gradient(-90deg,#1251AE 0,#0074FF 50%,#1251AE 100%);
    header{
        div{
            display: inline-block;
            margin:30px;
            color:#fff;
            font-size:16px;
            .logo{
                width:48px;
                height:48px;
                vertical-align: middle;
            }
            span.text{
                vertical-align: middle;
                display: inline-block;
            }
        }
    }
    .main{
        display:flex;
        flex-direction: column;
        align-items: center;
        h2{
            color: #fff;
            font-size: 2.5rem;
            font-weight: 500;
            line-height: 1.18;
            margin-bottom: 16px;
            opacity: 1;
        }
        .box{
            display: flex;
            align-items: center;
            max-width: calc(100% - 40px);
            width: 680px;
            z-index: 2;
            background-color: #fff;
            padding: 25px 30px;
            border-radius: 0;
            .input-container{
                flex:1;
                padding: 0 8px 5px 0;
                text-align: left;
                color: #253858;
                height: fit-content;
                border-width: 0 0 2px;
                border-style: solid;
                border-image: linear-gradient(to right,#dee1e6,#fff) 1;
                input{
                    border: none;
                    display: inline-block;
                    width: 100%;
                    font-size: 14px;
                    outline:none;
                }
            }
            .btn{
                background:#00aeff;
                border-radius:4px;
                font-size:14px;
                color:#fff;
                padding:10px 20px;
                outline:none;
                border:none;
                cursor: pointer;
            }
        }


    }
  }
</style>
