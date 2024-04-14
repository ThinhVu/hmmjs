function HmmBuilderFactory(send) {
  return function Model(name) {
    const model = {__name: `Model_${name}`}
    let payload = {model: name, fns: []}
    return new Proxy(model, {
      get(target, p) {
        switch (p) {
          case 'then':
            return (resolve, reject) => send(payload).then(resolve).catch(reject)
          case 'catch':
            return (reject) => send(payload).then(() => {}).catch(reject)
          case 'toString':
            return () => JSON.stringify({model, payload})
          default:
            return function next(...args) {
              payload.fns.push({m: p, args})
              return this;
            }
        }
      }
    })
  }
}
window.HmmBuilder = HmmBuilderFactory



