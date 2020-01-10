
exports.install = function (Vue) {
  Vue.prototype.$confirm = function (content, ok, cancel, width, title) {
    title = title || '温馨提示'
    width = width || 360
    const vm = this
    vm.$Modal.confirm({
      title,
      content,
      width,
      closable: true,
      loading: true,
      onOk() {
        vm.$Modal.remove()
        if ((typeof ok).toLowerCase() === 'function') {
          ok.call()
        }
      },
      onCancel() {
        if ((typeof cancel).toLowerCase() === 'function') {
          cancel.call()
        }
      },
    })
  }

  /**
     * receiving event.
     * @param event
     * @param unique
     */
  Vue.prototype.$onPopup = function (event, unique) {
    const vm = this
    const classes = {
      wrap: 'ivu-modal-wrap',
      title: 'ivu-modal-confirm-head-title',
      footer: 'ivu-modal-confirm-footer',
      close: 'ivu-modal-close',
    }
    vm.$on(event, function (fn) {
      const modals = document.getElementsByClassName(classes.wrap)
      const { length } = modals
      let i = 0
      if (length > 0) {
        for (; i < length; i++) {
          let cur = modals[i]
          let title = cur.getElementsByClassName(classes.title)[0]
          if (title) {
            let parent = title.parentNode
            let text = vm.trim(title.innerText)
            if (text === vm.trim(unique)) {
              vm.addClass(cur, event)
              parent.remove()
              cur.getElementsByClassName(classes.footer)[0].remove()
              let close = cur.getElementsByClassName(classes.close)[0]
              close.onclick = function () {
                vm.$Modal.remove()
              }
              if (typeof fn === 'function') fn.call(vm)
              break
            }
          }
        }
      }
    })
  }

  /**
   * emit event & close popup.
   * @param event {*}
   * @param time
   */
  Vue.prototype.$emitPopup = function (event, time) {
    const vm = this
    time = typeof time !== 'undefined' ? time : 0
    vm.$nextTick(() => {
      vm.$emit(event, function () {
        if (time && time > 0) {
          setTimeout(() => {
            vm.$Modal.remove()
          }, time * 1000)
        }
      })
    })
  }

  /**
   * success
   * @param content
   * @param width
   * @param time
   */
  Vue.prototype.$success = function (content, width, time) {
    const vm = this; const title = vm.$unique()
    const success = 'fl-modal-success'
    width = width || 300
    vm.$onPopup(success, title)
    vm.$Modal.success({
      content,
      width,
      title,
      closable: true,
    })
    vm.$emitPopup(success, time)
  }

  /**
   * error
   * @param content
   * @param width
   * @param time
   */
  Vue.prototype.$error = function (content, width, time) {
    const vm = this; const title = vm.$unique()
    const error = 'fl-modal-error'
    width = width || 300
    vm.$onPopup(error, title)
    vm.$Modal.error({
      content,
      width,
      title,
      closable: true,
    })
    vm.$emitPopup(error, time)
  }

  /**
   * generate unique key.
   * @returns {string}
   */
  Vue.prototype.$unique = function () {
    const vm = this
    return (vm.$random() + vm.$random() + vm.$random() + vm.$random() + vm.$random() + vm.$random() + vm.$random() + vm.$random()).toLocaleUpperCase()
  }
  
  Vue.prototype.getCookie = function (cname) {
        const name = cname + '=',
            ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++){
            let c = ca[i];
            while(c.charAt(0) === ' ') c = c.substring(1);
            if(c.indexOf(name) !== -1){
                return c.substring(name.length, c.length);
            }
        }
        return '';
    };
  
  /**
     * set cookie
     * @param name
     * @param value
     * @param expire
     */
    Vue.prototype.setCookie = function (name, value, expire) {
        const d = new Date();
        d.setTime(d.getTime() + (expire * 24 * 60 * 60 * 1000));
        const expires = 'expires=' + d.toUTCString();
        document.cookie = name + '=' + value + ';' + expires;
    };

    /**
     * delete cookie
     * @param name
     */
    Vue.prototype.delCookie = function (name) {
        const d = new Date();
        d.setTime(d.getTime() - (24 * 60 * 60 * 1000));
        const expire = 'expires=' + d.toUTCString();
        document.cookie = name + '="";' + expire;
    };
}
