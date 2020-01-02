import config from '@common/config';
import { generateUID } from '@common/utils';
import Konva from 'konva';
import common from '@common/common';
import pdfjsLib from 'pdfjsLib';

// 加载pdf
export async function loadPdf({ url, docID }) {
  let pdf;

  if (url) {
    if (url.indexOf(common.fileService) !== 0) {
      url = `${common.fileService}${url}`;
    }
    pdf = await pdfjsLib.getDocument(url).promise;
  } else if (docID) {
    //
  }

  return pdf;
}

// 文档cover添加到首页
export async function addCover(pdf, { stage, layer, convertCanvas }) {
  // 接口获取文档id
  const docID = generateUID();

  const page = await pdf.getPage(1);
  const viewport = getCoverViewport(page);
  const { width } = viewport;
  const { height } = viewport;
  // 设置转换画板尺寸
  convertCanvas.size({
    width,
    height,
  });
  const renderContext = {
    canvasContext: convertCanvas.layer.getContext(),
    viewport,
  };

  const width_safe = Math.floor((stage.width() - viewport.width) * 0.8);
  const height_safe = Math.floor((stage.height() - viewport.height) * 0.8);
  const x = Math.floor(Math.random() * width_safe);
  const y = Math.floor(Math.random() * height_safe);

  const render = async (page, renderContext) => {
    await page.render(renderContext).promise;
    const imgUrl = convertCanvas.layer.canvas._canvas.toDataURL();

    // 上传图片

    let img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      const imgK = new Konva.Image({
        id: docID,
        x,
        y,
        image: img,
        width,
        height,
        // 白底,防止透明背景
        fill: '#fff',
        stroke: '#ccc',
        draggable: true,
      });
      imgK.cache();
      imgK.filters([Konva.Filters.Contrast]);

      layer.add(imgK);
      layer.draw();

      // 事件
      imgK.on('mouseover', ({ target }) => {
        target.contrast(20);
        layer.draw();
      });
      imgK.on('mouseout', ({ target }) => {
        target.contrast(0);
        layer.draw();
      });
      imgK.on('click tap', ({ target }) => {
        // 传文档id
        // open(docID, { stage, layer, convertCanvas })
        open(pdf, { stage, layer, convertCanvas });
      });

      page = renderContext = img = null;
    };
  };
  // 渲染
  render(page, renderContext);

  // width = stage.width()
}

// 打开文档
export async function open(docID, { stage, layer, convertCanvas }) {
  // 参数暂时是文档地址

  // 清屏
  // stage.clear()
  Object.values(config.layerIds).map((v) => {
    config.layerManager[v].removeChildren();
  });

  // 本机测试
  let pdf = await loadPdf({
    url: docID._transport._params.url.substring(docID._transport._params.url.indexOf('/file')),
  });
  let viewport = await getViewport(pdf, { stage });
  // 按图片大小设置
  convertCanvas.size({
    width: viewport.width,
    height: viewport.height,
  });

  // 加载文档
  loopRender(pdf, { viewport, layer, convertCanvas });
  // 火狐内存泄露问题严重
  pdf = viewport = null;
}

// 获取文档封面viewport
function getCoverViewport(page) {
  let viewport = page.getViewport({
    scale: 1,
  });
  const stage = config.board;
  // 封面宽度，屏宽1600对应160,即画布宽度十分之一
  const width = Math.floor(stage.width() / 10);
  if (viewport.width !== width) {
    viewport = page.getViewport({
      // width * 1 / viewport.width
      scale: width / viewport.width,
    });
  }
  return viewport;
}

// 获取与stage尺寸一致的viewport
async function getViewport(pdf, { stage }) {
  // 获取第一页
  const page1 = await pdf.getPage(1);
  let scale = 1;
  let viewport = await page1.getViewport({ scale });
  // 修正viewport
  if (viewport.width !== stage.width()) {
    scale = stage.width() / viewport.width;
    viewport = await page1.getViewport({
      scale,
    });
  }
  return viewport;
}

// 加载所有页面
function loopRender(pdf, { viewport, layer, convertCanvas }) {
  // console.log(convertCanvas)
  const context = convertCanvas.layer.getContext();
  let renderContext = {
    canvasContext: context,
    viewport,
  };
  // 标记已加载
  const c = 0;
  // 位置
  const y = 0;
  renderOne(pdf, {
    viewport, layer, renderContext, convertCanvas, c, y,
  });
  pdf = renderContext = viewport = null;
}
// 加载一页
async function renderOne(pdf, {
  viewport, layer, renderContext, convertCanvas, c, y,
}) {
  let page = await pdf.getPage(c + 1);
  await page.render(renderContext).promise;
  page = null;
  c++;

  let imgUrl = convertCanvas.layer.canvas._canvas.toDataURL();
  let img = new Image();
  img.src = imgUrl;
  img.onload = () => {
    const imgK = new Konva.Image({
      x: 0,
      y,
      image: img,
      width: viewport.width,
      height: viewport.height,
      // 白底,防止透明背景
      fill: '#fff',
      stroke: '#ccc',
    });
    layer.add(imgK);

    if (c < pdf.numPages) {
      y += viewport.height;
      renderOne(pdf, {
        viewport, layer, renderContext, convertCanvas, c, y,
      });
      if ((c < 6 && c % 2 === 0) || c % 20 === 0) {
        layer.batchDraw();
      }
    } else {
      layer.batchDraw();
      console.log('done');
    }
    imgUrl = img = pdf = viewport = renderContext = null;
  };
}


export default {
  addCover,
};
