const hmmBuilder = require('./builder')

describe('hmm-builder', function () {
  it('should build', () => {
    const hmm = hmmBuilder(() => {})
    const hmm2Str = hmm.user.find({_id: 1}, {username: 1, password: 1}).sort({createdDate: -1}).limit(10).toString()
    const output = {
      model: 'user',
      fns: [
        { n: 'find', args: [{_id: 1}, {username: 1, password: 1}]},
        { n: 'sort', args: [{createdDate: -1}]},
        { n: 'limit', args: [10] }
      ]
    }
    expect(hmm2Str).toEqual(JSON.stringify(output))
  })

  it('should call send method', async () => {
    const mockPost = jest.fn(payload => "RESPONSE:" +  JSON.stringify(payload))
    const hmm = hmmBuilder(mockPost)
    const qry = hmm.user.find({_id: 1}, { username: 1, password: 1 }).sort({createdDate: -1}).limit(10)
    const hmm2Str = qry.toString()
    const rs = await qry.$
    expect(mockPost.mock.calls.length).toBe(1)
    expect(JSON.stringify(mockPost.mock.calls[0][0])).toBe(hmm2Str)
    expect(rs).toEqual("RESPONSE:" + hmm2Str)
  })
})
