//  eslint-disable-next-line
import io from 'socket.io-client'
import Vue from 'vue'
import { socketUrl, socketEvent } from './common'
import config from './config'

let socket

function initSocket() {
  socket = io(`${socketUrl}`, {
    reconnectionDelay: 100, // Make the xhr connections as fast as possible
    timeout: 1000 * 60 * 3, // Timeout after 3 minutes
    reconnectionAttempts: 2, // 重连次数
    transports: ['websocket'],
    query: {
      meetingId: config.meetingId,
    },
  })
  socket.on('reconnect_failed', () => {
    Vue.prototype.$Message.error({
      content: '重连失败',
      duration: 10,
      closable: true,
    })
  })
  socket.on('connect_error', () => {
    Vue.prototype.$Message.error({
      content: '连接失败',
      duration: 10,
      closable: true,
    })
  })
}

export function destroySocket() {
  socket.close()
  socket = null
}

export function getSocket() {
  return socket
}

// 加入会议房间
function joinMeet(params) {
  socket.emit(socketEvent.joinMeet, params)
}

// 获取会议房间消息
function getMeet(params) {
  socket.emit(socketEvent.getMeet, params)
}

// 通知后台当前操作的某个画板某个文档id
function syncAction(params) {
  socket.emit(socketEvent.syncAction, params)
}

// 获取会议组件初始化
function getComponent(params) {
  socket.emit(socketEvent.getComponent, params)
}

// 新增组件
function addComponent(params) {
  socket.emit(socketEvent.addComponent, params)
}

// 更新组件
function updateComponent(params) {
  socket.emit(socketEvent.updateComponent, params)
}

// 更新组件删除，存在状态
function updateComponentState(params) {
  socket.emit(socketEvent.updateComponentState, params)
}

// 批量删除
function deleteComponents(params) {
  socket.emit(socketEvent.deletecomponents, params)
}

// 清屏
function clearBoard(params) {
  socket.emit(socketEvent.clearBoard, params)
}

// 单纯广播
function broadcast(params) {
  socket.emit(socketEvent.broadcast, params)
}

// 真删除指定 componentType 和state 的组件
function deleteComponentsTypesState(params) {
  socket.emit(socketEvent.deleteComponentsTypesState, params)
}

export default {
  getSocket,
  initSocket,
  destroySocket,
  joinMeet,
  getMeet,
  syncAction,
  getComponent,
  addComponent,
  updateComponent,
  updateComponentState,
  deleteComponents,
  clearBoard,
  broadcast,
  deleteComponentsTypesState,
}
