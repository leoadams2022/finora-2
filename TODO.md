# TODO:

- [ ] we need to add a unversal date filter for the transaction and transfers to show them by month
- [ ] we an Debt Payment is Received we need to show the related debt to it on the card and the deatils modal
- [ ] we need to be able to reorder accounts Categories Subcategories Currencies and People/Entities
- [ ] we need to NOT count transfers as income on the home page (Income This Month)
- [ ] we need to NOT count the Loaned Out amounts as expencs on the home page
- [ ] we need to add a section to home page to show expences/income by Categories & Subcategories and another section by tags as will

# DONE:

- [x] we need to add edit action to the transfers
- [x] we need to add the "Include Transfer Fee (Expense)" to the transfer tab on the quick actions component
- [x] we need to add edit action to the debts
- [x] on the trnasaction page we need to show diffrent actions based on the type of the transaction so if its a debt we will
- [x] on the transactions page we need to show the feeAmount when the transation is a transfer and the feeAmount is there
- [x] make the "Link to Account (Optional cash inflow/outflow)" requaird on the debt modal and quick action modal
- [x] we need to pull the Exchange Rate for the currany store when doing Cross-Currency Transfer and set it is an init value
- [x] we need to fix the attachment viewr on the debt view details modal
- [x] remove the date selector on the transaction modal
- [x] we need to fix the accounts select elemnets init value on the new transfer modal and the quick action modal
- [x] we need to use local storage to save the view mode in the transactions page
- [x] we need to set the init exchange rate on the debt payment modal using the getTriangulatedExchangeRate from conversions
- [x] sort the debts on the bedt page by createdAt insted of start date to see the real order
- [x] we need to add sorting and filltering to the bedt page
- [x] we need add a view to the debts page for the bedts to be grouped by the Person / Entity
- [x] we need to brack the table, compact view card, filters section into thier own components in the transactions and debts pages
- [x] we need to create currency page and take it out of the settings page
- [x] we need to add an history or audit page to show all the transactions
- [x] on the transfers page we need to sort by created at by default
- [x] we need to add the option in the settings to reset all data
- [x] we need to make the settings page has a list of links to (People & Entities Categories & Subcategories Tags and currency ) on click it will load the page in full screen with a go back button at the top
- [x] we need to fix the latest transaction view on the home page to use the transfer and debt cards components not just the transaction card component
- [x] we need to groub debts by person or entity
- [x] we need to support adding transfers fees as subof the the ttl amount not just added on top on it
