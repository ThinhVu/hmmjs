function HmmBuilderFactory(send) {
  return function Model(name) {
    const model = {__name: `Model_${name}`}
    let payload = {model: name, fns: []}
    return new Proxy(model, {
      get(target, p) {
        switch (p) {
          case 'then':
            return (resolve, reject) => {
              let sendPayload = payload;
              payload = {model: name, fns: []}
              send(sendPayload).then(resolve).catch(reject)
            }
          default:
            return function next(...args) {
              payload.fns.push({method: p, args})
              return this;
            }
        }
      }
    })
  }
}
window.HmmBuilder = HmmBuilderFactory



