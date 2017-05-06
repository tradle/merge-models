const test = require('tape')
const shallowClone = require('xtend')
const createManager = require('../')
const A = {
  type: 'tradle.Model',
  id: 'tradle.A',
  title: 'A',
  properties: {}
}

const B = {
  type: 'tradle.Model',
  id: 'tradle.B',
  title: 'B',
  subClassOf: 'tradle.Form',
  interfaces: [
    'tradle.Message'
  ],
  properties: {}
}

test('basic', function (t) {
  const models = createManager()

  t.same(models.get(), {})
  t.same(models.array(), [])
  t.same(models.subClassOf('tradle.Form'), {})
  models.add([A])

  t.same(models.get(), {
    [A.id]: A
  })

  t.same(models.array(), [A])

  t.same(models.clone().get(), {
    [A.id]: A
  })

  t.same(models.subClassOf('tradle.Form'), {})

  t.throws(function () {
    models.add([A])
  }, /exists/)

  const updatedA = shallowClone(A, {
    title: 'A1'
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

test('layers', function (t) {
  const models = createManager()
  const base = {
    [A.id]: A
  }

  models.add([A])
  t.same(models.layers(), [base])
  t.same(models.base(), base)
  t.same(models.flatten(0), base)
  t.same(models.rest(), {})
  t.same(models.flatten(1), {})

  models.add([B])
  t.same(models.base(), base)
  t.same(models.flatten(), models.get())
  t.same(models.flatten(0), models.get())
  t.same(models.flatten(1), {
    [B.id]: B
  })

  t.same(models.rest(), {
    [B.id]: B
  })

  t.end()
})