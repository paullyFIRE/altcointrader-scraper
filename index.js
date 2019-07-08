const makeDriver = require('request-x-ray')
const express = require('express')
const app = express()
const server = require('http').Server(app)
const cloudscraper = require('cloudscraper')

const x = require('x-ray')({
  filters: {
    formatHistory: value =>
      typeof value === 'string'
        ? value
            .replace(/\n/gi, ' ')
            .trim()
            .split(' ')
        : value
  }
})

x.driver(
  makeDriver({
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.109 Safari/537.36'
    }
  })
)

app.get('/orderbook', async (req, res) => {
  cloudscraper.get('http://www.altcointrader.co.za/', async function(
    error,
    response,
    body
  ) {
    if (error) {
      console.log('Error occurred')
    }

    const payload = await x(body, {
      bids: x('.orderUdSell', [
        {
          price: '.orderUdSPr',
          volume: '.orderUdSAm'
        }
      ]),
      asks: x('.orderUdBuy', [
        {
          price: '.orderUdBPr',
          volume: '.orderUdBAm'
        }
      ])
    })

    res.send(payload)
  })
})

app.get('/history', async (req, res) => {
  cloudscraper.get('http://www.altcointrader.co.za/', async function(
    error,
    response,
    body
  ) {
    if (error) {
      console.log('Error occurred')
    }

    const historyRows =
      (await x(body, ['#trade-history > table > tbody > tr | formatHistory'])) || []
    const formattedRows = historyRows.map(([price, volume, total, time]) => ({
      price,
      volume,
      total,
      time
    }))

    res.send(formattedRows)
  })
})

const port = process.env.PORT || 5000

server.listen(port, () => console.log(`Listening on port ${port}`))
