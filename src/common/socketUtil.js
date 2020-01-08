//  eslint-disable-next-line
import io from 'socket.io-client'
import { socketUrl, socketEvent } from './common'

let socket

function initSocket() {
  socket = io(`${socketUrl}`, {
    reconnectionDelay: 100, // Make the xhr connections as fast as possible
    timeout: 1000 * 60 * 3, // Timeout after 20 minutes
    reconnectionAttempts: 2, // 重连次数
    transports: ['websocket'],
  })
  socket.on('connect_error', (error) => {
    console.error(`连接错误${error}`)
  })
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

// 获取会议组件初始化
function getComponent(params) {
  socket.emit(socketEvent.getComponent, params)
}

// 新增组件
function addComponent(params) {
  socket.emit(socketEvent.addComponent, params)
}

// 通知后台当前操作的某个画板某个文档id
function syncAction(params) {
  socket.emit(socketEvent.syncAction, params)
}

function updateComponent(params) {
  socket.emit(socketEvent.updateComponent, params)
}
// 批量删除
function deleteComponents(params) {
  socket.emit(socketEvent.deletecomponents, params)
}

// 更新状态
function updateComponentState(params) {
  socket.emit(socketEvent.updateComponentState, params)
}


export default {
  getSocket,
  initSocket,
  joinMeet,
  getMeet,
  getComponent,
  addComponent,
  syncAction,
  updateComponent,
  deleteComponents,
  updateComponentState,
}
