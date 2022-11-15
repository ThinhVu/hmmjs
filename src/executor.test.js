const executorFac = require('./executor')
const {ObjectID} = require('mongodb')
const {default: db, model, Schema} = require('mongoose')
const UserModel = model('User', new Schema({u: String, p: String, age: Number}))

let hmmExec;

describe('executor', () => {
  beforeAll(async () => {
    await db.connect('mongodb://localhost:27017/hmm')
    const dbi = { user: UserModel }
    const convertArgs = args => args.map(arg => typeof (arg) !== 'object'
        ? arg
        : Object.keys(arg).reduce((prev, k) => {
          prev[k] = k === '_id'
              ? new ObjectID(arg[k])
              : arg[k];
          return prev
        }, {}))
    hmmExec = executorFac(dbi, convertArgs)
    // init user
    await UserModel.deleteMany()
    for (let i = 0; i < 100; ++i)
      await UserModel.create({ u: `u${i}`, p: `p${i}`, age: i })
  })

  it('should execute 1', async () => {
    const payload = {
      model: 'user',
      fns: [
        { n: 'find', args: [{u: 'u10'}, {u: 1, p: 1}]},
        { n: 'limit', args: [1] }
      ]
    }
    const rs = await hmmExec(payload)
    expect(rs.length).toEqual(1)
    expect(rs[0].p).toEqual('p10')
    expect(rs[0].age).toEqual(undefined)
  })

  it('should execute 2', async () => {
    const payload = {
      model: 'user',
      fns: [
        { n: 'find', args: [{age: {$gt: 10}}, {u: 1, p: 1}]},
        { n: 'sort', args: [{age: 1}] },
        { n: 'limit', args: [10] }
      ]
    }
    const rs = await hmmExec(payload)
    expect(rs.length).toEqual(10)
    expect(rs[0].p).toEqual('p11')
    expect(rs[rs.length - 1].p).toEqual('p20')
  })
})
