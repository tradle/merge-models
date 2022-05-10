const test = require('tape')
const DEFAULT_MODELS = require('@tradle/models').models
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
  properties: {}
}
const C = {
  type: 'tradle.Model',
  id: 'tradle.C',
  title: 'C',
  subClassOf: 'tradle.FinancialProduct',
  forms: [],
  properties: {}
}
const MyC = {
  type: 'tradle.Model',
  id: 'tradle.MyC',
  title: 'MyC',
  subClassOf: 'tradle.MyProduct',
  properties: {}
}

test('basic', function (t) {
  const models = createManager()

  t.same(models.get(), {})
  t.same(models.array(), [])
  t.same(models.subClassOf('tradle.Form'), {})
  t.same(models.forms()[A.id], undefined)
  t.same(models.products()[C.id], undefined)
  models.add([A])

  t.same(models.get(), {
    [A.id]: A
  })

  t.same(models.array(), [A])

  t.same(models.clone().get(), {
    [A.id]: A
  })

  t.same(models.subClassOf('tradle.Form'), {})

  const updatedA = {
    ...A,
    title: 'A1'
  }

  t.throws(() => models.add({
    [A.id]: A,
    foo: 'bar'
  }), /already exists/)

  models.update([updatedA])
  t.same(models.get(), {
    [A.id]: updatedA
  })

  models.reset()
  models
    .add(DEFAULT_MODELS)
    .add([A])
    .add([B])
    .add([C, MyC])

  t.same(models.rest(), {
    [A.id]: A,
    [B.id]: B,
    [C.id]: C,
    [MyC.id]: MyC
  })

  t.same(models.subClassOf('tradle.Form')[B.id], B)
  t.same(models.forms()[B.id], B)
  t.same(models.subClassOf('tradle.FinancialProduct')[C.id], C)
  t.same(models.products()[C.id], C)

  models.remove(A.id)
  t.same(models.rest(), {
    [B.id]: B,
    [C.id]: C,
    [MyC.id]: MyC
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

  models.reset()
    .add(DEFAULT_MODELS)
    .add([A])
    .add([B])

  t.same(models.flatten(), models.get())
  t.same(models.flatten(0), models.get())
  t.same(models.flatten(2), {
    [B.id]: B
  })

  t.same(models.rest(), {
    [A.id]: A,
    [B.id]: B
  })

  models.remove([B.id])
  t.same(models.rest(), {
    [A.id]: A
  })

  models.remove(Object.keys(DEFAULT_MODELS))
  t.same(models.get(), {
    [A.id]: A
  })

  t.end()
})

test('validate', function (t) {
  const models = createManager()

  models.add([A], { validate: true })
  t.throws(() => models.add([B]), /tradle.Form/)
  t.doesNotThrow(() => models.add([B], { validate: false }))
  t.end()
})
