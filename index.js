const { EventEmitter } = require('events')
const deepEqual = require('deep-equal')
const validateModels = require('@tradle/validate-model')

module.exports = function modelManager () {
  let byId = {}
  let layers = []
  const emitter = new EventEmitter()

  function add (models, opts = {}) {
    if (typeof opts === 'boolean') {
      opts = { overwrite: opts }
    }

    const { overwrite, validate = true } = opts

    // accept array or object
    models = values(models).filter(model => {
      const existing = get(model.id)
      if (existing) {
        if (!overwrite) {
          if (!deepEqual(existing, model)) {
            throw new Error(`model ${model.id} already exists`)
          }

          return false
        }
      }

      return true
    })

    const layer = {}
    models.forEach(model => {
      layer[model.id] = model
    })

    // test before we commit
    if (validate) {
      validateModels(Object.assign(flatten(), layer))
    }

    layers.push(layer)
    Object.assign(byId, layer)

    emitter.emit('change')
    return this
  }

  function get (id) {
    if (id) return byId[id]

    return { ...byId }
  }

  function subClassOf (superId) {
    return subset(function (model) {
      return model.subClassOf === superId
    })
  }

  function subset (filter) {
    const matches = {}
    for (const id in byId) {
      const model = byId[id]
      if (filter(model)) matches[id] = model
    }

    return matches
  }

  function update (models) {
    return add(models, true)
  }

  function remove (ids) {
    let updated
    [].concat(ids).forEach(id => {
      if (id in byId) {
        delete byId[id]
        layers.forEach(layer => {
          delete layer[id]
        })

        updated = true
      }
    })

    if (updated) emitter.emit('change')

    return this
  }

  function reset () {
    byId = {}
    layers = []
    emitter.emit('change')
    return this
  }

  function flatten (offset = 0) {
    if (offset === 0) return get()

    const flat = {}
    layers.slice(offset)
      .forEach(layer => Object.assign(flat, layer))

    return flat
  }

  function exportArray () {
    return Object.keys(byId).map(id => byId[id])
  }

  return Object.assign(emitter, {
    add,
    remove,
    get,
    subClassOf,
    update,
    reset,
    forms: () => subClassOf('tradle.Form'),
    products: () => subClassOf('tradle.FinancialProduct'),
    clone: () => modelManager().add(byId),
    layers: () => layers.slice(),
    base: () => layers[0],
    rest: () => flatten(1),
    array: exportArray,
    flatten
  })
}

function values (objOrArray) {
  if (Array.isArray(objOrArray)) return objOrArray

  return Object.keys(objOrArray).map(key => objOrArray[key])
}
