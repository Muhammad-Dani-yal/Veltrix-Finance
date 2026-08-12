import { equalTo, get, onValue, orderByChild, push, query, ref, set, update } from 'firebase/database'
import { database } from './firebase'
import { availableBalance } from './balance'

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

export async function findTransferRecipient(accountNumber,currentCustomerId) {
  const normalized=String(accountNumber||'').trim().toUpperCase();if(!normalized)throw new Error('Enter a valid Veltrix account number.')
  const snapshot=await get(ref(database,`publicAccounts/${normalized}`));const account=snapshot.val()
  if(!account||account.status!=='active')throw new Error('An active Veltrix account was not found.')
  if(account.uid===currentCustomerId)throw new Error('You cannot add your own account as a beneficiary.')
  return {...account,accountNumber:normalized}
}

export async function saveBeneficiary(ownerId,{recipientId,accountNumber,accountTitle,nickname}) {
  const cleanNickname=String(nickname||'').trim();if(cleanNickname.length<2)throw new Error('Enter a beneficiary nickname.')
  const itemRef=push(ref(database,`beneficiaries/${ownerId}`));const createdAt=Date.now()
  await set(itemRef,{ownerId,recipientId,accountNumber,accountTitle,nickname:cleanNickname,createdAt})
  return itemRef.key
}

export async function removeBeneficiary(ownerId,id){await set(ref(database,`beneficiaries/${ownerId}/${id}`),null)}

export async function submitTransfer({senderId,senderName,senderAccountNumber,recipientId,recipientTitle,recipientAccountNumber,beneficiaryNickname,amount,purpose}) {
  const numericAmount=Number(amount);if(!numericAmount||numericAmount<=0)throw new Error('Enter a valid transfer amount.');if(senderId===recipientId)throw new Error('You cannot transfer to your own account.')
  const recipient=await findTransferRecipient(recipientAccountNumber,senderId);if(recipient.uid!==recipientId||recipient.accountTitle!==recipientTitle)throw new Error('Beneficiary details changed. Verify the account again.')
  const [customerSnapshot,loansSnapshot,transactionsSnapshot,outgoingSnapshot,incomingSnapshot]=await Promise.all([get(ref(database,`customers/${senderId}`)),get(query(ref(database,'loans'),orderByChild('customerId'),equalTo(senderId))),get(query(ref(database,'transactions'),orderByChild('customerId'),equalTo(senderId))),get(query(ref(database,'transfers'),orderByChild('senderId'),equalTo(senderId))),get(query(ref(database,'transfers'),orderByChild('recipientId'),equalTo(senderId)))])
  const outgoing=asList(outgoingSnapshot);const transfers=[...outgoing,...asList(incomingSnapshot).filter(item=>!outgoing.some(existing=>existing.id===item.id))];const balance=availableBalance({id:senderId,...customerSnapshot.val()},asList(loansSnapshot),asList(transactionsSnapshot),transfers);if(balance<numericAmount)throw new Error('Insufficient available balance.')
  const createdAt=Date.now();const automatic=numericAmount<=250000;const authority=automatic?'automatic':numericAmount<=500000?'employee':'manager';const transferRef=push(ref(database,'transfers'))
  await set(transferRef,{senderId,senderName,senderAccountNumber,recipientId,recipientTitle,recipientAccountNumber,beneficiaryNickname,purpose:String(purpose||'').trim()||'Personal transfer',amount:numericAmount,status:automatic?'completed':'pending',authority,createdAt,updatedAt:createdAt})
  return {id:transferRef.key,status:automatic?'completed':'pending',authority}
}

export async function decideSupportRequest(id,status,actor) {
  if(!['resolved','rejected'].includes(status))throw new Error('Invalid support decision.')
  const requestSnapshot=await get(ref(database,`supportRequests/${id}`));const request=requestSnapshot.val();if(!request||request.status!=='pending')throw new Error('Support request was already processed.')
  const now=Date.now();await update(ref(database),{[`supportRequests/${id}/status`]:status,[`supportRequests/${id}/decidedBy`]:actor.uid,[`supportRequests/${id}/decidedByRole`]:actor.role,[`supportRequests/${id}/decidedAt`]:now,[`supportRequests/${id}/updatedAt`]:now,[`auditLogs/support-${id}-${now}`]:{action:`support_${status}`,targetId:request.customerId,actorId:actor.uid,actorRole:actor.role,createdAt:now}})
}

export async function decideFinancialRequest({ collection, id, status, actor }) {
  if(!['loans','transactions','transfers'].includes(collection)||!['approved','rejected'].includes(status))throw new Error('Invalid decision.')
  const [profileSnapshot,requestSnapshot]=await Promise.all([get(ref(database,`users/${actor.uid}`)),get(ref(database,`${collection}/${id}`))]);const verified=profileSnapshot.val();const request=requestSnapshot.val()
  if(!verified||verified.role!==actor.role||!['employee','manager'].includes(verified.role))throw new Error('Your staff role is not authorized.')
  if(!request||request.status!=='pending')throw new Error('Request was already processed.')
  const amount=Number(request.amount);if(collection==='loans'||collection==='transfers'){const required=collection==='transfers'?(amount>500000?'manager':'employee'):(amount>1000000?'manager':'employee');if(verified.role!==required)throw new Error(`This ${collection==='loans'?'loan':'transfer'} requires ${required} approval.`)}
  if(status==='approved'&&collection==='transactions'&&['withdrawal','donation','zakat'].includes(request.type)){
    const customerId=request.customerId;const [customerSnapshot,loansSnapshot,transactionsSnapshot]=await Promise.all([get(ref(database,`customers/${customerId}`)),get(query(ref(database,'loans'),orderByChild('customerId'),equalTo(customerId))),get(query(ref(database,'transactions'),orderByChild('customerId'),equalTo(customerId)))])
    const base=Number(customerSnapshot.val()?.balance||0);const issued=asList(loansSnapshot).filter(item=>item.status==='approved').reduce((sum,item)=>sum+Number(item.amount),0);const movements=asList(transactionsSnapshot).filter(item=>item.status==='approved').reduce((sum,item)=>sum+(['withdrawal','donation','zakat'].includes(item.type)?-Number(item.amount):Number(item.amount)),0)
    if(base+issued+movements<amount)throw new Error('Customer has insufficient balance.')
  }
  if(status==='approved'&&collection==='transfers'){
    const senderId=request.senderId;const [customerSnapshot,loansSnapshot,transactionsSnapshot,outgoingSnapshot,incomingSnapshot]=await Promise.all([get(ref(database,`customers/${senderId}`)),get(query(ref(database,'loans'),orderByChild('customerId'),equalTo(senderId))),get(query(ref(database,'transactions'),orderByChild('customerId'),equalTo(senderId))),get(query(ref(database,'transfers'),orderByChild('senderId'),equalTo(senderId))),get(query(ref(database,'transfers'),orderByChild('recipientId'),equalTo(senderId)))])
    const transfers=[...asList(outgoingSnapshot),...asList(incomingSnapshot).filter(incoming=>!asList(outgoingSnapshot).some(outgoing=>outgoing.id===incoming.id))];const balance=availableBalance({id:senderId,...customerSnapshot.val()},asList(loansSnapshot),asList(transactionsSnapshot),transfers)
    if(balance<amount)throw new Error('Sender has insufficient balance.')
  }
  const targetId=request.customerId||request.senderId;const now=Date.now();await update(ref(database),{[`${collection}/${id}/status`]:status,[`${collection}/${id}/decidedBy`]:actor.uid,[`${collection}/${id}/decidedByRole`]:verified.role,[`${collection}/${id}/decidedAt`]:now,[`${collection}/${id}/updatedAt`]:now,[`auditLogs/${collection}-${id}-${now}`]:{action:`${collection.slice(0,-1)}_${status}`,requestId:id,targetId,actorId:actor.uid,actorRole:verified.role,amount,createdAt:now}})
  return {id,status}
}

export async function updateEmployeeRecord(id, changes, actor) {
  const now=Date.now();const safe={name:changes.name,email:changes.email,salary:Number(changes.salary||0),responsibility:changes.responsibility,status:changes.status||'active',updatedAt:now};return update(ref(database),{[`employees/${id}`]:safe,[`users/${id}/name`]:safe.name,[`users/${id}/status`]:safe.status,[`auditLogs/employee-${id}-${now}`]:{action:'employee_updated',targetId:id,actorId:actor.uid,actorRole:actor.role,createdAt:now}})
}
export async function deactivateEmployee(id,actor) { const now=Date.now();return update(ref(database),{[`employees/${id}/status`]:'inactive',[`users/${id}/status`]:'inactive',[`auditLogs/employee-${id}-${now}`]:{action:'employee_deactivated',targetId:id,actorId:actor.uid,actorRole:actor.role,createdAt:now}}) }
