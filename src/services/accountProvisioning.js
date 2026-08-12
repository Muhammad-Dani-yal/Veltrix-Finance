import { deleteApp, initializeApp } from 'firebase/app'
import { createUserWithEmailAndPassword, deleteUser, getAuth, signOut, updateProfile } from 'firebase/auth'
import { ref, update } from 'firebase/database'
import { database, firebaseConfig } from './firebase'

async function provision(kind, form) {
  const secondary=initializeApp(firebaseConfig,`${kind}-provisioning-${Date.now()}`);const secondaryAuth=getAuth(secondary)
  try{
    const credential=await createUserWithEmailAndPassword(secondaryAuth,form.email,form.password);await updateProfile(credential.user,{displayName:form.name});const uid=credential.user.uid;const createdAt=Date.now()
    if(kind==='customer'){
      const customer={uid,name:form.name,email:form.email.toLowerCase(),accountNumber:form.accountNumber,balance:Number(form.balance||0),status:'active',createdAt}
      await update(ref(database),{[`users/${uid}`]:{name:customer.name,email:customer.email,role:'customer',status:'active',customerId:uid,createdAt},[`customers/${uid}`]:customer,[`accountNumbers/${customer.accountNumber}`]:uid,[`publicAccounts/${customer.accountNumber}`]:{uid,accountTitle:customer.name,status:customer.status},[`auditLogs/customer-${uid}-${createdAt}`]:{action:'customer_created',targetId:uid,actorId:form.actor?.uid,actorRole:form.actor?.role,createdAt}});return customer
    }
    const employee={uid,name:form.name,email:form.email.toLowerCase(),salary:Number(form.salary||0),responsibility:form.responsibility,status:'active',createdAt}
    await update(ref(database),{[`users/${uid}`]:{name:employee.name,email:employee.email,role:'employee',status:'active',employeeId:uid,createdAt},[`employees/${uid}`]:employee,[`auditLogs/employee-${uid}-${createdAt}`]:{action:'employee_created',targetId:uid,actorId:form.actor?.uid,actorRole:form.actor?.role,createdAt}});return employee
  }catch(error){if(secondaryAuth.currentUser)await deleteUser(secondaryAuth.currentUser).catch(()=>{});throw error}finally{await signOut(secondaryAuth).catch(()=>{});await deleteApp(secondary)}
}
export const provisionCustomerAccount=form=>provision('customer',form)
export const provisionEmployeeAccount=form=>provision('employee',form)
