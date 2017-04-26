const test = require('tape')
const shallowClone = require('xtend')
const createManager = require('../')

test('basic', function (t) {
  const models = createManager()
  const A = {
    type: 'tradle.Model',
    id: 'tradle.A'
  }

  const B = {
    type: 'tradle.Model',
    id: 'tradle.B',
    subClassOf: 'tradle.Form'
  }

  t.same(models.get(), {})
  t.same(models.subClassOf('tradle.Form'), {})
  models.add([A])

  t.same(models.get(), {
    [A.id]: A
  })

  t.same(models.clone().get(), {
    [A.id]: A
  })

  t.same(models.subClassOf('tradle.Form'), {})

  t.throws(function () {
    models.add([A])
  }, /exists/)

  const updatedA = shallowClone(A, {
    properties: {}
  })

  models.update([updatedA])
  t.same(models.get(), {
    [A.id]: updatedA
  })

  models.add([B])
  t.same(models.get(), {
    [A.id]: updatedA,
    [B.id]: B
  })

  t.same(models.subClassOf('tradle.Form'), {
    [B.id]: B
  })

  models.remove(A.id)
  t.same(models.get(), {
    [B.id]: B
  })

  models.reset()
  t.same(models.get(), {})

  t.end()
})
