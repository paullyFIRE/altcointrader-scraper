const express = require('express')
const app = express()
const server = require('http').Server(app)
const cloudscraper = require('cloudscraper')
const cheerio = require('cheerio')

const options = {
  uri: 'http://www.altcointrader.co.za/',
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
    'Cache-Control': 'private',
    Accept:
      'application/xml,application/xhtml+xml,text/html;q=0.9, text/plain;q=0.8,image/png,*/*;q=0.5'
  }
}

app.get('/orderbook', async (req, res) => {
  cloudscraper.get(options, async function(error, response, body) {
    if (error) {
      return res.send({ error, response })
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
  cloudscraper.get(options, async function(error, response, body) {
    if (error) {
      return res.send({ error, response })
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
