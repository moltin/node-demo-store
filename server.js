const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const MoltinGateway = require('@moltin/sdk').gateway

const PORT = parseInt(process.env.PORT, 10) || 3000

const app = express()

const Moltin = MoltinGateway({
  client_id:
    process.env.MOLTIN_CLIENT_ID ||
    'j6hSilXRQfxKohTndUuVrErLcSJWP15P347L6Im0M4',
  application: 'node-demo-store'
})

app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, 'static')))
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', async (req, res, next) => {
  try {
    const {
      json: { data, included }
    } = await Moltin.Products.With(['main_image']).All()

    const products = data.map(product => {
      const imageId = product.relationships.main_image
        ? product.relationships.main_image.data.id
        : false

      return {
        ...product,
        image: imageId
          ? included.main_images.find(img => img.id === imageId).link.href
          : '/static/moltin-light-hex.svg'
      }
    })

    res.render('index', {
      products
    })
  } catch ({ json }) {
    next(json.errors)
  }
})

app.get('/products/:id', async (req, res, next) => {
  const { id } = req.params

  try {
    const {
      json: { data }
    } = await Moltin.Products.Get(id)

    res.render('product', {
      product: data
    })
  } catch ({ json }) {
    next(json.errors)
  }
})

app.listen(PORT, err => {
  if (err) throw err
  console.log(`> Ready on http://localhost:${PORT}`)
})
