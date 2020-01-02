
exports.install = function (Vue) {
  Vue.prototype.$confirm = function (content, ok, cancel, width, title) {
    title = title || '温馨提示';
    width = width || 360;
    const vm = this;
    vm.$Modal.confirm({
      title,
      content,
      width,
      closable: true,
      loading: true,
      onOk() {
        vm.$Modal.remove();
        if ((typeof ok).toLowerCase() === 'function') {
          ok.call();
        }
      },
      onCancel() {
        if ((typeof cancel).toLowerCase() === 'function') {
          cancel.call();
        }
      },
    });
  };
};
