const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getDatabase } = require('firebase-admin/database')
initializeApp()

async function actorOf(request) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Authentication required.')
  const snapshot = await getDatabase().ref(`users/${request.auth.uid}`).get()
  const actor = snapshot.val()
  if (!actor) throw new HttpsError('permission-denied', 'Authorized profile not found.')
  return { uid: request.auth.uid, ...actor }
}
function requireRole(actor, roles) { if (!roles.includes(actor.role)) throw new HttpsError('permission-denied', 'Your role cannot perform this action.') }
function text(value, field) { const result=String(value||'').trim(); if(!result)throw new HttpsError('invalid-argument',`${field} is required.`); return result }

exports.createCustomer = onCall(async request => {
  const actor=await actorOf(request);requireRole(actor,['employee','manager']);const {name,email,password,balance=0,accountNumber}=request.data||{}
  if(Number(balance)<0)throw new HttpsError('invalid-argument','Starting balance cannot be negative.')
  const user=await getAuth().createUser({email:text(email,'Email'),password:text(password,'Password'),displayName:text(name,'Name')})
  try{const createdAt=Date.now();const customer={uid:user.uid,name:name.trim(),email:email.trim().toLowerCase(),accountNumber:text(accountNumber,'Account number'),balance:Number(balance),status:'active',createdAt};await getDatabase().ref().update({[`users/${user.uid}`]:{name:customer.name,email:customer.email,role:'customer',status:'active',customerId:user.uid,createdAt},[`customers/${user.uid}`]:customer,[`auditLogs/customer-${user.uid}-${createdAt}`]:{action:'customer_created',targetId:user.uid,actorId:actor.uid,actorRole:actor.role,createdAt}});return customer}catch(error){await getAuth().deleteUser(user.uid);throw error}
})

exports.createEmployee = onCall(async request => {
  const actor=await actorOf(request);requireRole(actor,['manager']);const {name,email,password,salary=0,responsibility}=request.data||{}
  if(Number(salary)<0)throw new HttpsError('invalid-argument','Salary cannot be negative.')
  const user=await getAuth().createUser({email:text(email,'Email'),password:text(password,'Password'),displayName:text(name,'Name')})
  try{const createdAt=Date.now();const employee={uid:user.uid,name:name.trim(),email:email.trim().toLowerCase(),salary:Number(salary),responsibility:text(responsibility,'Responsibility'),status:'active',createdAt};await getDatabase().ref().update({[`users/${user.uid}`]:{name:employee.name,email:employee.email,role:'employee',status:'active',employeeId:user.uid,createdAt},[`employees/${user.uid}`]:employee,[`auditLogs/employee-${user.uid}-${createdAt}`]:{action:'employee_created',targetId:user.uid,actorId:actor.uid,actorRole:actor.role,createdAt}});return employee}catch(error){await getAuth().deleteUser(user.uid);throw error}
})

exports.decideFinancialRequest = onCall(async request => {
  const actor=await actorOf(request);requireRole(actor,['employee','manager']);const {collection,id,status}=request.data||{}
  if(!['loans','transactions'].includes(collection)||!['approved','rejected'].includes(status))throw new HttpsError('invalid-argument','Invalid request decision.')
  let failure='Request is unavailable.'
  const outcome=await getDatabase().ref().transaction(root=>{if(!root)return;const item=root[collection]?.[id];if(!item||item.status!=='pending'){failure='Request was already processed.';return}const amount=Number(item.amount);if(collection==='loans'){const high=amount>1000000;if(high&&actor.role!=='manager'){failure='Manager approval is required.';return}if(!high&&actor.role!=='employee'){failure='Low-value loans are assigned to employees.';return}}const customer=root.customers?.[item.customerId];if(!customer){failure='Customer account was not found.';return}if(status==='approved'){const deduction=collection==='transactions'&&['withdrawal','donation','zakat'].includes(item.type);if(deduction&&Number(customer.balance||0)<amount){failure='Customer has insufficient balance.';return}customer.balance=Number(customer.balance||0)+(deduction?-amount:amount);customer.updatedAt=Date.now()}const now=Date.now();item.status=status;item.decidedBy=actor.uid;item.decidedByRole=actor.role;item.decidedAt=now;item.updatedAt=now;root.auditLogs=root.auditLogs||{};root.auditLogs[`${collection}-${id}-${now}`]={action:`${collection.slice(0,-1)}_${status}`,requestId:id,targetId:item.customerId,actorId:actor.uid,actorRole:actor.role,amount,createdAt:now};return root},{applyLocally:false})
  if(!outcome.committed)throw new HttpsError('failed-precondition',failure);return {id,status}
})

exports.updateEmployee = onCall(async request => {const actor=await actorOf(request);requireRole(actor,['manager']);const {id,changes={}}=request.data||{};const current=(await getDatabase().ref(`employees/${id}`).get()).val();if(!current)throw new HttpsError('not-found','Employee not found.');const safe={...current,name:text(changes.name,'Name'),salary:Number(changes.salary||0),responsibility:text(changes.responsibility,'Responsibility'),status:changes.status==='inactive'?'inactive':'active',updatedAt:Date.now()};await getDatabase().ref().update({[`employees/${id}`]:safe,[`users/${id}/name`]:safe.name,[`users/${id}/status`]:safe.status,[`auditLogs/employee-${id}-${Date.now()}`]:{action:'employee_updated',targetId:id,actorId:actor.uid,actorRole:actor.role,createdAt:Date.now()}});await getAuth().updateUser(id,{displayName:safe.name,disabled:safe.status==='inactive'});return safe})
exports.deactivateEmployee = onCall(async request => {const actor=await actorOf(request);requireRole(actor,['manager']);const {id}=request.data||{};await getAuth().updateUser(id,{disabled:true});const now=Date.now();await getDatabase().ref().update({[`employees/${id}/status`]:'inactive',[`users/${id}/status`]:'inactive',[`auditLogs/employee-${id}-${now}`]:{action:'employee_deactivated',targetId:id,actorId:actor.uid,actorRole:actor.role,createdAt:now}});return {id,status:'inactive'}})
