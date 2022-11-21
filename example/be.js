const express = require('express');
const bodyParser = require('body-parser');
const app = express()
const executorFac = require('../src/executor')
const {default: db, model, Schema} = require('mongoose')

const start = async () => {
  // db init
  await db.connect('mongodb://localhost:27017/hmm')
  const UserModel = model('User', new Schema({u: String, p: String, age: Number}))
  const dbDriver = { user: UserModel }

  // hmm init
  const hmm = executorFac(dbDriver, { logLevel: 'log' })

  // express stuff
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(express.static('.'))

  app.post('/api', (req, res) =>
      hmm(req.body).then(rs => res.json(rs)).catch(e => res.status(400).end()))

  app.listen(3000, () => console.log('http://localhost:3000/example'))
}

start()
