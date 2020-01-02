// 组件删除
import Konva from 'konva';

function create(params) {
  const { stage, layer } = params;
  let label; let tr;
  stage.on('click', (evt) => {
    if (evt.target === stage) {
      return;
    }
    stage.find('Transformer').destroy();

    tr = new Konva.Transformer({
      node: evt.target,
      centeredScaling: true,
      rotationSnaps: [0, 90, 180, 270],
      resizeEnabled: false,
      rotateEnabled: false,
      padding: 40,
    });

    const selfRect = evt.target.getSelfRect();
    label = new Konva.Label({
      position: {
        x: selfRect.x + selfRect.width + 40 - 8,
        y: selfRect.y - 40 - 15,
      },
    });

    // 增加一个删除按钮
    label.add(new Konva.Tag({
      fill: '#fff',
      stroke: '#78c8f8',
      shadowColor: 'black',
      shadowBlur: 10,
      shadowOffset: [10, 10],
      shadowOpacity: 0.2,
      lineJoin: 'round',
      pointerDirection: 'none',
      pointerWidth: 20,
      pointerHeight: 20,
      cornerRadius: 2,
    }));

    const text = new Konva.Text({
      fontSize: 30,
      text: 'x',
      fill: '#333',
    });
    label.add(text);
    layer.add(tr);
    layer.add(label);
    layer.draw();

    label.on('mouseover touchstart', () => {
      label.getTag().fill('red');
      label.getText().fill('#fff');
      layer.draw();
    });
    label.on('mouseout touchend', () => {
      label.getTag().stroke('#78c8f8');
      layer.draw();
    });
    label.on('click', () => {
      label.destroy();
      tr.destroy();
      layer.draw();
    });
  });
}

function destroy(params) {
  const { stage } = params;
  stage.off('click');
  stage.find('Transformer').destroy();
}

export default {
  create,
  destroy,
};
