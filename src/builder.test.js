const HmmBuild = require("./builder");

const delay = ms => new Promise(rs => setTimeout(rs, ms))
const fetchOk = (url, data) => new Promise((resolve, reject) => resolve(data))
const fetchNOk = (url, data) => new Promise((resolve, reject) => reject('something bad'))

describe('hmm-builder', function () {
  describe('send', function () {
    it('should fail on sync send method', async () => {
      const send = payload => "RESPONSE:" +  JSON.stringify(payload)
      const mockSend = jest.fn(send)
      const Model = HmmBuild(mockSend)
      let throwException;
      try {
        await Model('user').find({_id: 1}, { username: 1, password: 1 }).sort({createdDate: -1}).limit(10)
        throwException = false;
      } catch (e) {
        throwException = true;
      }
      expect(mockSend.mock.calls.length).toBe(1)
      expect(throwException).toBe(true)
    })
    it('should work on async send method', async () => {
      const send = async payload => "RESPONSE:" +  JSON.stringify(payload)
      const mockSend = jest.fn(send)
      const Model = HmmBuild(mockSend)
      let throwException;
      try {
        await Model('user').find({_id: 1}, { username: 1, password: 1 }).sort({createdDate: -1}).limit(10)
        throwException = false;
      } catch (e) {
        throwException = true;
      }
      expect(mockSend.mock.calls.length).toBe(1)
      expect(throwException).toBe(false)
    })
    it('should work on Promise send method', async () => {
      const send = payload => new Promise(resolve => resolve("RESPONSE:" +  JSON.stringify(payload)))
      const mockSend = jest.fn(send)
      const Model = HmmBuild(mockSend)
      let throwException;
      try {
        await Model('user').find({_id: 1}, { username: 1, password: 1 }).sort({createdDate: -1}).limit(10)
        throwException = false;
      } catch (e) {
        throwException = true;
      }
      expect(mockSend.mock.calls.length).toBe(1)
      expect(throwException).toBe(false)
    })
  })
  describe('usage', function () {
    describe('invoke', function () {
      describe('Promise', () => {
        it('should work with Promise#then', async () => {
          const send = data => fetchOk('/execute', data)
          const Model = HmmBuild(send)
          const datas = []
          Model('file').updateOne({name: 'x'}, {age: 1}).then(data => datas.push(data))
          await delay(10)
          expect(datas.length).toBe(1)
        })
        it('should catch exception with Promise#catch', async () => {
          const send = data => fetchNOk('/execute', data)
          const Model = HmmBuild(send)
          const datas = []
          const errors = []
          Model('file').updateOne({name: 'x'}, {age: 1}).catch(e => errors.push(e))
          await delay(10)
          expect(datas.length).toBe(0)
          expect(errors.length).toBe(1)
        })
        it('should work with Promise#then#catch (1)', async () => {
          const send = data => fetchOk('/execute', data)
          const Model = HmmBuild(send)
          const datas = []
          const errors = []
          Model('file').updateOne({name: 'x'}, {age: 1}).then(data => datas.push(data)).catch(e => errors.push(e))
          await delay(10)
          expect(datas.length).toBe(1)
          expect(errors.length).toBe(0)
        })
        it('should work with Promise#then#catch (1)', async () => {
          const send = data => fetchNOk('/execute', data)
          const Model = HmmBuild(send)
          const datas = []
          const errors = []
          Model('file').updateOne({name: 'x'}, {age: 1}).then(data => datas.push(data)).catch(e => errors.push(e))
          await delay(10)
          expect(datas.length).toBe(0)
          expect(errors.length).toBe(1)
        })
      });

      describe('async/await', () => {
        it('should work', async () => {
          const send = data => fetchOk('/execute', data)
          const Model = HmmBuild(send)
          const datas = []
          const errors = []
          try {
            const data = await Model('file').updateOne({name: 'x'}, {age: 1})
            datas.push(data)
          } catch (e) {
            errors.push(e)
          }
          expect(datas.length).toBe(1)
          expect(errors.length).toBe(0)
        })
        it('should catch exception', async () => {
          const send = data => fetchNOk('/execute', data)
          const Model = HmmBuild(send)
          const datas = []
          const errors = []
          try {
            const data = await Model('file').updateOne({name: 'x'}, {age: 1})
            datas.push(data)
          } catch (e) {
            errors.push(e)
          }
          expect(datas.length).toBe(0)
          expect(errors.length).toBe(1)
        })
      })
    })

    describe('payload', function() {
      it('should correct when using isolate Model instance', async () => {
        const send = data => fetchOk('/execute', data)
        const Model = HmmBuild(send)
        const datas = {}
        Model('file').updateOne({name: 'x'}, {age: 1}).then(data => datas[0] = data)
        Model('file').find({age: {$lte: 20}}).sort({date: -1}).skip(20).limit(10).then(data => datas[1] = data)
        Model('file').find({name: 'Josh'}).sort({age: 1}).limit(100).then(data => datas[2] = data)
        await delay(50)
        // console.log(datas)
        expect(datas[0].fns.length).toBe(1)
        expect(datas[1].fns.length).toBe(4)
        expect(datas[2].fns.length).toBe(3)
      })
      it('should messed-up when using shared Model instance', async () => {
        const send = data => fetchOk('/execute', data)
        const Model = HmmBuild(send)
        const FileModel = Model('file') // <- shared model instance
        const datas = {}
        FileModel.updateOne({name: 'x'}, {age: 1}).then(data => datas[0] = data)
        FileModel.find({age: {$lte: 20}}).sort({date: -1}).skip(20).limit(10).then(data => datas[1] = data)
        FileModel.find({name: 'Josh'}).sort({age: 1}).limit(100).then(data => datas[2] = data)
        await delay(50)
        // console.log(datas)
        expect(datas[0].fns.length).not.toBe(1)
        expect(datas[1].fns.length).not.toBe(4)
        expect(datas[2].fns.length).not.toBe(3)
      })
    })
  })
})
