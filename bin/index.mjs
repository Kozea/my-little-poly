#! /usr/bin/env node

import http from 'http'

import app from '../lib'

const { SOCKET, HOST, PORT } = process.env

const server = http.createServer(app.callback())
const bind = SOCKET ? [SOCKET] : [PORT || 9966, HOST || 'localhost']

server.listen(...bind, err => {
  if (err) {
    // eslint-disable-next-line no-console
    console.error(
      '  🐴 my-little-poly has encountered an error during start',
      err
    )
    return
  }
  // eslint-disable-next-line no-console
  console.log(
    `  🐴 my-little-poly is running wildly at ${[...bind].reverse().join(':')}`
  )
})
