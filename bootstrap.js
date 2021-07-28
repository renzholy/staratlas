const fetch = require('node-fetch')

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function run(network, type, top) {
  for (let height = top; height > 0; height -= 32) {
    console.log(height)
    await delay(50)
    fetch(
      `http://localhost:3000/api/list/height?network=${network}&height=${height}&type=${type}`,
    ).catch(console.error)
  }
}

run('halley', 'block', 18202)
