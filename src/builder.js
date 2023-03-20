const chain = hmm => new Proxy({}, {
  get(target, p) {
    switch (p) {
      case '$':
        return hmm.send(hmm.payload);
      case 'toString':
        return () => JSON.stringify(hmm.payload)
      default:
        return function (...args) {
          hmm.payload.fns.push({n: p, args})
          return this;
        }
    }
  }
})

const builder = send => new Proxy({}, {
  get(target, p) {
    return chain({send, payload: {model: p, fns: []}})
  }
})

if (window) {
  window.HmmBuilder = builder
} else {
  module.exports = builder
}
