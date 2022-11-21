module.exports = dbDriver => async payload => {
  const {model, fns} = payload
  let imme = dbDriver[model]
  for (const fn of fns)
    imme = imme[fn.n].apply(imme, fn.args)
  return imme
}
