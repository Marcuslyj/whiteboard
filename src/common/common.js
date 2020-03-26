import { deepFreeze } from './utils'

export const baseUrl = process.env.VUE_APP_baseUrl
export const webService = process.env.VUE_APP_webService
export const fileService = process.env.VUE_APP_fileService
export const imageService = process.env.VUE_APP_imageService

export const api = {
  upload: `${webService}/upload/normal/file`,
  batchUpload: `${webService}/upload/normal/batch-file`,
  docToPdf: '/meeting-manager/meeting/{meetingId}/whiteboard/{whiteboardId}/doc-to-pdf',
  createMeet: '/meeting-manager/meeting',
  createBoard: '/meeting-manager/meeting/{meetingId}/whiteboard',
  auth: '/meeting-manager/meeting/{meetingId}/auth',
  documentList: '/meeting-manager/meeting/{meetingId}/documents',
  downloadPostil: '/meeting-manager/meeting/whiteboard/document/{documentId}/imgs-to-pdf',
}

export const fbId = {
  // 文件
  upload: 'F4710100',
  // 封片图片
  docCover: 'F4710100',
  // 批注图片
  postil: 'F4720100',
}

export const socketUrl = process.env.VUE_APP_socketUrl
export const socketEvent = {
  joinMeet: 'join-meeting',
  getMeet: 'get-meeting',
  syncAction: 'sync-action',
  getComponent: 'get-component',
  addComponent: 'add-component',
  updateComponent: 'update-component',
  updateComponentState: 'update-component-state',
  deletecomponents: 'delete-components',
  clearBoard: 'clear-board',
  broadcast: 'broadcast',
  deleteComponentsTypesState: 'delete-components-types-state',
  /**
   * 保存未同步批注页页码和替换文档页截图
   */
  reportDocumentAction: 'report-document-action',
  /**
   * 获取未同步批注页页码
   */
  getDocumentPages: 'get-document-pages',
  /**
   * 删除文档
   */
  deleteDocument: 'delete-document',
  /**
   * 获取用户列表
   */
  getUsers: 'get-sessions',
  /**
   * 上下线通知
   */
  sessionAction: 'session-action',
  /**
   * 踢人
   */
  kickingSession: 'kicking-session',
  /**
   * 授权
   */
  authPermission: 'auth-permission-session',
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

// 待同步的带注释页面
let postilsToUpdate = new Set()

// 非响应式数据
export const unObs = {
  postilsToUpdate,
}

// 非响应式数据, 冻结（可用于vue模板或传入作为vue实例data）
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
