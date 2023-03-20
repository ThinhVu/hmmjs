const express = require('express');
const bodyParser = require('body-parser');
const {MongoClient} = require('mongodb');
const jsonFn = require('json-fn');
const executorFac = require('../src/executor')

const start = async () => {
  // db init
  const client = new MongoClient('mongodb://localhost:27017');
  const database = client.db('hmm')
  const dbDriver = new Proxy({}, {
    get(__, p) {return database.collection(p)}
  })

  const app = express()
  // hmm init
  const hmm = executorFac(dbDriver, { logLevel: 'log' })
  app.post('/api', bodyParser.raw({limit: '50mb', type: () => true}),
      async (req, res) =>
          hmm(jsonFn.parse(req.body.toString()))
          .then(rs => res.json(rs))
          .catch(e => res.status(400).send(e.message)));


  // these stuff must call after hmm
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(express.static('.'))

  app.listen(3000, () => console.log('http://localhost:3000/example'))
}

start()
