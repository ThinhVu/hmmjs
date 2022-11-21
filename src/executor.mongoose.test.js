const executorFac = require('./executor')
const {default: db, model, Schema} = require('mongoose')

let hmmExec;

describe('executor', () => {
  beforeAll(async () => {
    await db.connect('mongodb://localhost:27017/hmm')
    const UserModel = model('User', new Schema({u: String, p: String, age: Number}))
    const dbDriver = { user: UserModel }
    hmmExec = executorFac(dbDriver)
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
