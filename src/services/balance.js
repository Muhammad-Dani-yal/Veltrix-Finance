export function availableBalance(customer, loans = [], transactions = [], transfers = []) {
  if (!customer) return 0
  const customerId = customer.id || customer.uid
  const issuedLoans = loans.filter(item => item.customerId === customerId && item.status === 'approved').reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const movements = transactions.filter(item => item.customerId === customerId && item.status === 'approved').reduce((sum, item) => {
    const amount = Number(item.amount || 0)
    return sum + (['withdrawal', 'donation', 'zakat'].includes(item.type) ? -amount : amount)
  }, 0)
  const transferMovement = transfers.filter(item => ['completed','approved'].includes(item.status)).reduce((sum,item)=>{
    if(item.senderId===customerId)return sum-Number(item.amount||0)
    if(item.recipientId===customerId)return sum+Number(item.amount||0)
    return sum
  },0)
  return Number(customer.balance || 0) + issuedLoans + movements + transferMovement
}
