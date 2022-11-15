module.exports = (dbi, convertArgs) => {
  return async payload => {
    const {model, fns} = payload
    let imme = dbi[model]
    for (const fn of fns)
      imme = imme[fn.n](...(convertArgs ? convertArgs(fn.args): fn.args))
    return imme
  }
}
