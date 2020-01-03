//  eslint-disable-next-line
import io from 'socket.io-client'
import { socketUrl, socketEvent } from './common'

const socket = io(`${socketUrl}`, {
  reconnectionDelay: 100, // Make the xhr connections as fast as possible
  timeout: 1000 * 60 * 3, // Timeout after 20 minutes
  reconnectionAttempts: 2, // 重连次数
  transports: ['websocket'],
})

socket.on('connect_error', (error) => {
  console.error(`连接错误${error}`)
})

export function joinMeet(params) {
  socket.emit(socketEvent.joinMeet, params)
}

export function updateComponent() {
  socket.emit(socketEvent.updateComponent)
}


export default socket
