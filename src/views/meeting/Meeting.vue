<!--
Description
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2020-05-04 09:18:31
@version 1.0.0
-->
<template>
  <Layout>
    <Header>Header</Header>
    <Layout theme="light">
      <Sider hide-trigger>
        <MenuItem name="1">
          <Icon type="ios-navigate"></Icon>
          新建会议
        </MenuItem>
        <MenuItem name="2">
          <Icon type="ios-keypad"></Icon>
          我的会议
        </MenuItem>
        <MenuItem name="3">
          <Icon type="ios-analytics"></Icon>
         历史会议
        </MenuItem>
        <MenuItem name="4">
          <Icon type="ios-paper"></Icon>
         文档检索
        </MenuItem>
      </Sider>
      <Content>
          hello meeting
         <router-view></router-view>
      </Content>
    </Layout>
    <Footer>Footer</Footer>
  </Layout>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped></style>
