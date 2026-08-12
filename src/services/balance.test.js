import test from 'node:test'
import assert from 'node:assert/strict'
import { availableBalance } from './balance.js'

test('approved ledger entries determine available balance', () => {
  const customer={id:'c1',balance:1000}
  const loans=[{customerId:'c1',amount:500,status:'approved'},{customerId:'c1',amount:900,status:'pending'}]
  const transactions=[{customerId:'c1',type:'deposit',amount:200,status:'approved'},{customerId:'c1',type:'withdrawal',amount:300,status:'approved'},{customerId:'c1',type:'zakat',amount:50,status:'rejected'}]
  assert.equal(availableBalance(customer,loans,transactions),1400)
})

test('other customers and pending requests do not affect balance', () => {
  const customer={id:'c1',balance:250}
  const transactions=[{customerId:'c2',type:'deposit',amount:5000,status:'approved'},{customerId:'c1',type:'withdrawal',amount:100,status:'pending'}]
  assert.equal(availableBalance(customer,[],transactions),250)
})

test('completed transfers debit sender and credit recipient',()=>{
  const transfers=[{senderId:'c1',recipientId:'c2',amount:100,status:'completed'},{senderId:'c1',recipientId:'c2',amount:500,status:'pending'}]
  assert.equal(availableBalance({id:'c1',balance:1000},[],[],transfers),900)
  assert.equal(availableBalance({id:'c2',balance:200},[],[],transfers),300)
})
