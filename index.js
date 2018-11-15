var x = require('x-ray')()
const makeDriver = require('request-x-ray')
const express = require('express')
const app = express()
const server = require('http').Server(app)

const options = {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.109 Safari/537.36'
  }
}

const driver = makeDriver(options)
x.driver(driver)

app.get('/', async (req, res) => {
  const url = 'http://www.altcointrader.co.za/'

  const askOrders = await x(url, {
    askOrders: x('.orderUdBuy', [
      {
        price: '.orderUdBPr',
        volume: '.orderUdBAm'
      }
    ])
  })

  console.log(askOrders)

  res.send(askOrders)
})

const port = process.env.PORT || 5000

server.listen(port, () => console.log(`Listening on port ${port}`))
