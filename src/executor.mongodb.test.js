const executorFac = require('./executor')
const {MongoClient} = require('mongodb')

let hmmExec;

describe('executor', () => {
  beforeAll(async () => {
    const client = new MongoClient('mongodb://localhost:27017');
    const database = client.db('hmm')
    const userColl = database.collection('users')
    const dbDriver = { user: userColl }
    hmmExec = executorFac(dbDriver)
    // init user
    await userColl.deleteMany({})
    for (let i = 0; i < 100; ++i) {
      await userColl.insertOne({ u: `u${i}`, p: `p${i}`, age: i })
    }
  })

  it('insertOne', async () => {
    const i = Math.random() * 1000
    await hmmExec({ model: 'user', fns: [{ n: 'insertOne', args: [{u: `u${i}`, p: `p${i}`, age: i }]} ] })
    const rs = await hmmExec({ model: 'user', fns: [{ n: 'findOne', args: [{age: i}, { projection: { u: 1, p: 1 } }]}] })
    expect(rs.p).toEqual(`p${i}`)
  })

  it('findOne', async () => {
    const rs = await hmmExec({ model: 'user', fns: [{ n: 'findOne', args: [{u: 'u10'}, { projection: { u: 1, p: 1 } }]}] })
    expect(rs.p).toEqual('p10')
    expect(rs.age).toEqual(undefined)
  })

  it('find (1)', async () => {
    const rs = await hmmExec({
      model: 'user',
      fns: [
        { n: 'find', args: [{u: 'u10'}, { projection: { u: 1, p: 1 } }]},
        { n: 'limit', args: [1] },
        { n: 'toArray', args: [] }
      ]
    })
    expect(rs.length).toEqual(1)
    expect(rs[0].p).toEqual('p10')
    expect(rs[0].age).toEqual(undefined)
  })

  it('find (2)', async () => {
    const rs = await hmmExec({
      model: 'user',
      fns: [
        { n: 'find', args: [{age: {$gt: 10}}, { projection: { u: 1, p: 1 } }]},
        { n: 'sort', args: [{age: 1}] },
        { n: 'limit', args: [10] },
        { n: 'toArray', args: [] }
      ]
    })
    expect(rs.length).toEqual(10)
    expect(rs[0].p).toEqual('p11')
    expect(rs[rs.length - 1].p).toEqual('p20')
  })
})
