import axios from 'axios'

import { baseUrl } from './common'

console.log(baseUrl)
axios.defaults.withCredentials = true


/**
 * send request.
 * @param method
 * @param url
 * @param params
 * @param success
 * @param failure
 * @param config
 *
 * @see get
 * @see post
 * @see put
 * @see delete
 * @see patch
 * @see custom
 */
function base(method, url, params, success, failure, config) {
  method = method.toUpperCase()
  let configuration = {
    method,
    url,
    data: params,
    baseURL: baseUrl,
    timeout: 30000,
  }
  if (method === 'GET' && params !== null) {
    delete configuration.data
    configuration.params = params
  }
  if (config && Object.keys(config).length > 0) {
    for (let i in config) {
      if (config.hasOwnProperty(i)) {
        configuration[i] = config[i]
      }
    }
  }
  axios(configuration).then((res) => {
    if ((typeof success).toUpperCase() === 'FUNCTION') success(res.data)
  }).catch((err) => {
    if ((typeof failure).toUpperCase() === 'FUNCTION') failure(err)
  })
}

export default {
  /**
     * get
     * @param url
     * @param params
     * @param success
     * @param failure
     * @param config
     */
  get(url, params, success, failure, config) {
    return base('GET', url, params, success, failure, config)
  },

  /**
     * post
     * @param url
     * @param params
     * @param success
     * @param failure
     * @param config
     * @returns {*}
     */
  post(url, params, success, failure, config) {
    return base('POST', url, params, success, failure, config)
  },

  /**
     * put
     * @param url
     * @param params
     * @param success
     * @param failure
     * @param config
     */
  put(url, params, success, failure, config) {
    return base('PUT', url, params, success, failure, config)
  },

  /**
     * delete
     * @param url
     * @param params
     * @param success
     * @param failure
     * @param config
     */
  delete(url, params, success, failure, config) {
    return base('DELETE', url, params, success, failure, config)
  },

  /**
     * patch
     * @param url
     * @param params
     * @param success
     * @param failure
     * @param config
     */
  patch(url, params, success, failure, config) {
    return base('PATCH', url, params, success, failure, config)
  },

  /**
     * custom
     * @param method
     * @param url
     * @param params
     * @param success
     * @param failure
     * @param config
     */
  custom(method, url, params, success, failure, config) {
    return base(method, url, params, success, failure, config)
  },
}
