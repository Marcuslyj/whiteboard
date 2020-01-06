//  eslint-disable-next-line
import io from 'socket.io-client'
import { socketUrl, socketEvent } from './common'

export const socket = io(`${socketUrl}`, {
  reconnectionDelay: 100, // Make the xhr connections as fast as possible
  timeout: 1000 * 60 * 3, // Timeout after 20 minutes
  reconnectionAttempts: 2, // 重连次数
  transports: ['websocket'],
})
startListen()

function startListen() {
  socket.on(socketEvent.joinMeet, (res) => {

  })
}

socket.on('connect_error', (error) => {
  console.error(`连接错误${error}`)
})

function joinMeet(params) {
  socket.emit(socketEvent.joinMeet, params)
}

function addComponent(params) {
  socket.emit(socketEvent.addComponent, params)
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
  socket,
  joinMeet,
  addComponent,
  updateComponent,
  deleteComponents,
  updateComponentState,
}
