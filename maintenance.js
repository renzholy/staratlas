const fetch = require('node-fetch')

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function run(url) {
  while (true) {
    try {
      const json = await fetch(url).then((response) => response.json())
      console.log(url, json)
      if (!json.top) {
        await sleep(60 * 1000)
      }
    } catch (err) {
      console.error(err)
      await sleep(10 * 1000)
    }
  }
}

const host = 'http://localhost:3000'
// const host = 'https://staratlas.vercel.app'

// run(`${host}/api/maintenance?network=${'main'}`)
// run(`${host}/api/maintenance?network=${'barnard'}`)
run(`${host}/api/maintenance?network=${'proxima'}&height=952463`)
// run(`${host}/api/maintenance?network=${'halley'}`)
