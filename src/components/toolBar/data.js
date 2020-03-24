export default {
  // 笔
  pencilColorArr: ['#333333', '#d81e06', '#f4ea2a', '#0abf53', '#1296db'],
  widthArr: [
    {
      width: 0.4,
      lineWidth: 4,
    },
    {
      width: 0.6,
      lineWidth: 8,
    },
    {
      width: 1,
      lineWidth: 14,
    },
    {
      width: 1.2,
      lineWidth: 18,
    },
    {
      width: 1.6,
      lineWidth: 22,
    },
  ],
  pencilToolArr: [
    {
      name: 'pen',
      icon: 'icon-gangbi',
    },
    {
      name: 'markPencil',
      icon: 'icon-makebi',
    },
    {
      name: 'arrow',
      icon: 'icon-arrow',
    },
  ],

  // eraserToolArr
  eraserToolArr: [
    {
      name: 'eraser',
      icon: 'icon-eraser',
    },
    {
      name: 'deleteGraphic',
      icon: 'icon-qingkong',
    },
    {
      name: 'clearBoard',
      icon: 'icon-clear',
    },
  ],
  boxName: '',
  files: [],
  // MsgUploading: []
  // 关联一级菜单栏和实际工具的
  menuRef: {
    'pan-tool': ['pan'],
    'select-tool': ['select'],
    'pencil-tool': ['pen', 'markPencil', 'arrow'],
    'eraser-tool': ['eraser', 'deleteGraphic', 'clearBoard'],
    'text-tool': ['text'],
  },
}
