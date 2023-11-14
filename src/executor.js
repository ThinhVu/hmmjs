module.exports = dbDriver => async payload => {
  const {model, fns} = payload
  let imme = dbDriver[model]
  for (const fn of fns) {
    const fnI = imme[fn.method]
    imme = fnI.apply(imme, fn.args)
  }
  return imme
}
