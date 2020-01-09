import { deepFreeze } from './utils'

export const baseUrl = process.env.VUE_APP_baseUrl
export const webService = process.env.VUE_APP_webService
export const fileService = process.env.VUE_APP_fileService

export const api = {
  upload: `${webService}/upload/normal/file`,
  createMeet: '/meeting-manager/meeting',
  createBoard: '/meeting-manager/meeting/{meetingId}/whiteboard',
}

export const fbId = {
  upload: 'F1912100',
}

export const socketUrl = process.env.VUE_APP_socketUrl
export const socketEvent = {
  joinMeet: 'join-meeting',
  getMeet: 'get-meeting',
  getComponent: 'get-component',
  addComponent: 'add-component',
  syncAction: 'sync-action',
  updateComponent: 'update-component',
  deletecomponents: 'delete-components',
  updateComponentState: 'update-component-state',
  clearBoard: 'clear-board',
}

/**
 * 特殊组件id
 */
export const sComponentId = {
  // 主屏尺寸
  speakerSize: 'speakerSize',
  // 坐标基准宽度
  baseWidth: 'baseWidth',
  // stage.x，y 滚动情况
  stageXY: 'stageXY',
}

// 非响应式数据
export default deepFreeze({
  socketUrl,
  baseUrl,
  webService,
  fileService,
  api,
  fbId,
  socketEvent,
  sComponentId,
})
