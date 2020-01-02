function create(params) {
  const { layers } = params;
  layers.forEach((layer) => {
    layer.destroyChildren();
    layer.batchDraw();
  });
}

export default {
  create,
};
