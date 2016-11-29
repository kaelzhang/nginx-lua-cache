const request = require('request')
const { EventEmitter } = require('events')
const uuid = require('uuid')
const clone = require('clone')

const BACKEND_HOST = 'http://127.0.0.1:8080'

module.exports = class Visit extends EventEmitter {
  constructor (options) {
    super()
    this.options = options
  }

  visit () {
    if (!this.visited) {
      return this._visit()
    }

    if (this.ready) {
      return this._request()
    }

    return new Promise((resolve) => {
      this.on('ready', () => {
        resolve()
      })
    })
    .then(() => {
      return this._request()
    })
  }

  _visit () {
    return this._request()
    .then((res) => {
      this.ready = true
      this.emit('ready')
      return res
    })
  }

  _request () {
    this.visited = true

    const {
      url,
      method = 'GET',
      headers = {},
      body = ''
    } = this.options

    const id = uuid.v4()
    const h = clone(headers)
    h.id = id
    h['User-Agent'] = 'Gaia-Test-Agent'

    return new Promise((resolve, reject) => {
      request({
        url,
        method: method.toUpperCase(),
        headers: h,
        body,
        json: true

      }, (err, res, body) => {
        if (err) {
          return reject(err)
        }

        const ret = {
          body,
          headers: res.headers,
          stale: res.headers.id !== id
        }
        resolve(ret)
      })
    })
  }
}
