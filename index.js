
const { EventEmitter } = require('events')
const shallowClone = require('xtend')
const shallowExtend = require('xtend/mutable')

module.exports = function modelManager () {
  let byId = {}
  const emitter = new EventEmitter()

  function add (models, overwrite) {
    // accept array or object
    models = values(models)
    if (!overwrite) {
      const conflict = models.find(model => get(model.id))
      if (conflict) {
        throw new Error(`model ${conflict.id} already exists`)
      }
    }

    models.forEach(model => {
      byId[model.id] = model
    })

    emitter.emit('change')
    return this
  }

  function get (id) {
    if (id) return byId[id]

    return shallowClone(byId)
  }

  function subClassOf (superId) {
    return subset(function (model) {
      return model.subClassOf === superId
    })
  }

  function subset (filter) {
    const matches = {}
    for (let id in byId) {
      let model = byId[id]
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
        updated = true
      }
    })

    if (updated) emitter.emit('change')

    return this
  }

  function reset () {
    byId = {}
    emitter.emit('change')
    return this
  }

  return shallowExtend(emitter, {
    add,
    remove,
    get,
    subClassOf,
    update,
    reset,
    forms: () => subClassOf('tradle.Form'),
    products: () => subClassOf('tradle.FinancialProduct'),
    clone: () => modelManager().add(byId)
  })
}

function values (objOrArray) {
  if (Array.isArray(objOrArray)) return objOrArray

  return Object.keys(objOrArray).map(key => objOrArray[key])
}
