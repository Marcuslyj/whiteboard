import io from 'socket.io-client'
import { socketUrl } from './common'

const socket = io(`${socketUrl}`, {
  reconnectionDelay: 100, // Make the xhr connections as fast as possible
  timeout: 1000 * 60 * 20, // Timeout after 20 minutes
  transports: ['websocket'],
})

socket.on('connect_error', (error) => {
  console.error(`连接错误${error}`)
})


export function joinMeet() {

}


export default {
  joinBoard,
}
