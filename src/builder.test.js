const hmmBuilder = require('./builder')

describe('hmm-builder', function () {
  it('should call send method', async () => {
    const mockPost = jest.fn(payload => "RESPONSE:" +  JSON.stringify(payload))
    const Model = hmmBuilder(mockPost)
    const UserModel = Model('user')
    const rs = await UserModel.find({_id: 1}, { username: 1, password: 1 }).sort({createdDate: -1}).limit(10)
    expect(mockPost.mock.calls.length).toBe(1)
  })
})
