import { equalTo, get, onValue, orderByChild, push, query, ref, set, update } from 'firebase/database'
import { database } from './firebase'

const asList = snapshot => snapshot.exists() ? Object.entries(snapshot.val()).map(([id,value])=>({ id, ...value })) : []
export function subscribeList(path, callback, errorCallback) { return onValue(query(ref(database,path)),snapshot=>callback(asList(snapshot)),errorCallback) }
export function subscribeFilteredList(path, child, value, callback, errorCallback) { return onValue(query(ref(database,path),orderByChild(child),equalTo(value)),snapshot=>callback(asList(snapshot)),errorCallback) }
export function subscribeRecord(path, callback, errorCallback) { return onValue(ref(database,path),snapshot=>callback(snapshot.exists()?{ id:snapshot.key,...snapshot.val() }:null),errorCallback) }

export async function submitLoanRequest({ customerId, customer, amount, purpose, duration, notes }) {
  const numericAmount=Number(amount); if(!customerId||!numericAmount||numericAmount<=0)throw new Error('A valid customer and amount are required.')
  const requestRef=push(ref(database,'loans')); const createdAt=Date.now()
  await set(requestRef,{customerId,customer,amount:numericAmount,purpose,duration:Number(duration),notes:notes||'',status:'pending',authority:numericAmount>1000000?'manager':'employee',createdAt,updatedAt:createdAt})
  return requestRef.key
}
export async function submitTransactionRequest({ customerId, customer, type, amount, notes }) {
  const numericAmount=Number(amount); if(!customerId||!numericAmount||numericAmount<=0)throw new Error('A valid customer and amount are required.')
  if(!['deposit','withdrawal','donation','zakat'].includes(type))throw new Error('Invalid transaction type.')
  const requestRef=push(ref(database,'transactions')); const createdAt=Date.now()
  await set(requestRef,{customerId,customer,type,amount:numericAmount,notes:notes||'',status:'pending',createdAt,updatedAt:createdAt})
  return requestRef.key
}

export async function submitSupportRequest({ customerId, customer, message }) {
  const cleanMessage=String(message||'').trim();if(!customerId||cleanMessage.length<5)throw new Error('Please enter a valid support question.')
  const requestRef=push(ref(database,'supportRequests'));const createdAt=Date.now()
  await set(requestRef,{customerId,customer,message:cleanMessage,status:'pending',createdAt,updatedAt:createdAt})
  return requestRef.key
}

export async function decideFinancialRequest({ collection, id, status, actor }) {
  if(!['loans','transactions'].includes(collection)||!['approved','rejected'].includes(status))throw new Error('Invalid decision.')
  const [profileSnapshot,requestSnapshot]=await Promise.all([get(ref(database,`users/${actor.uid}`)),get(ref(database,`${collection}/${id}`))]);const verified=profileSnapshot.val();const request=requestSnapshot.val()
  if(!verified||verified.role!==actor.role||!['employee','manager'].includes(verified.role))throw new Error('Your staff role is not authorized.')
  if(!request||request.status!=='pending')throw new Error('Request was already processed.')
  const amount=Number(request.amount);if(collection==='loans'){const required=amount>1000000?'manager':'employee';if(verified.role!==required)throw new Error(`This loan requires ${required} approval.`)}
  if(status==='approved'&&collection==='transactions'&&['withdrawal','donation','zakat'].includes(request.type)){
    const customerId=request.customerId;const [customerSnapshot,loansSnapshot,transactionsSnapshot]=await Promise.all([get(ref(database,`customers/${customerId}`)),get(query(ref(database,'loans'),orderByChild('customerId'),equalTo(customerId))),get(query(ref(database,'transactions'),orderByChild('customerId'),equalTo(customerId)))])
    const base=Number(customerSnapshot.val()?.balance||0);const issued=asList(loansSnapshot).filter(item=>item.status==='approved').reduce((sum,item)=>sum+Number(item.amount),0);const movements=asList(transactionsSnapshot).filter(item=>item.status==='approved').reduce((sum,item)=>sum+(['withdrawal','donation','zakat'].includes(item.type)?-Number(item.amount):Number(item.amount)),0)
    if(base+issued+movements<amount)throw new Error('Customer has insufficient balance.')
  }
  const now=Date.now();await update(ref(database),{[`${collection}/${id}/status`]:status,[`${collection}/${id}/decidedBy`]:actor.uid,[`${collection}/${id}/decidedByRole`]:verified.role,[`${collection}/${id}/decidedAt`]:now,[`${collection}/${id}/updatedAt`]:now,[`auditLogs/${collection}-${id}-${now}`]:{action:`${collection.slice(0,-1)}_${status}`,requestId:id,targetId:request.customerId,actorId:actor.uid,actorRole:verified.role,amount,createdAt:now}})
  return {id,status}
}

export async function updateEmployeeRecord(id, changes) {
  const safe={name:changes.name,email:changes.email,salary:Number(changes.salary||0),responsibility:changes.responsibility,status:changes.status||'active',updatedAt:Date.now()};return update(ref(database),{[`employees/${id}`]:safe,[`users/${id}/name`]:safe.name,[`users/${id}/status`]:safe.status})
}
export async function deactivateEmployee(id) { return update(ref(database),{[`employees/${id}/status`]:'inactive',[`users/${id}/status`]:'inactive'}) }
