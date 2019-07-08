const express = require('express')
const app = express()
const server = require('http').Server(app)
const cloudscraper = require('cloudscraper')
const cheerio = require('cheerio')

app.get('/orderbook', async (req, res) => {
  cloudscraper.get('http://www.altcointrader.co.za/', async function(
    error,
    response,
    body
  ) {
    if (error) {
      console.log('error: ', error)
      console.log('Error occurred')
    }

    const $ = cheerio.load(body)

    const parseOrders = ({ tableSel, priceSel, volumeSel }) =>
      Array.from(
        $(tableSel).map(function() {
          return {
            price: $(this)
              .find(priceSel)
              .text(),
            volume: $(this)
              .find(volumeSel)
              .text()
          }
        })
      )

    const payload = {
      asks: parseOrders({
        tableSel: '.orderUdSell',
        priceSel: '.orderUdSPr',
        volumeSel: '.orderUdSAm'
      }),
      bids: parseOrders({
        tableSel: '.orderUdBuy',
        priceSel: '.orderUdBPr',
        volumeSel: '.orderUdBAm'
      })
    }

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

    const $ = cheerio.load(body)

    const payload = Array.from(
      $('#trade-history > table > tbody > tr').map(function(index, el) {
        const [price, volume, total, time] = $(el)
          .text()
          .split('\n')
          .filter(e => e.length)

        return { price, volume, total, time }
      })
    )

    res.send(payload)
  })
})

const port = process.env.PORT || 5000

server.listen(port, () => console.log(`Listening on port ${port}`))
