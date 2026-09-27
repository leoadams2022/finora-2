# TODO:

- [ ] At the moment the account balance is being calculated when needed as follow (Opening Balance + Income/Refunds - Expenses/Fees) by going over all the lines that are for that account on the "transactionLines" store, which would take a long time when the data is too big

- [ ] we need to create a debt payment transaction card and edite modal that shows the data of the related bedt to the transaction

- [ ] we need to NOT count transfers as income on the home page (Income This Month)
- [ ] we need to NOT count the Loaned Out amounts as expencs on the home page
- [ ] we need to add a section to home page to show expences/income by Categories & Subcategories and another section by tags as will

- [ ] we need to add a unversal date filter for the transaction and transfers to show them by month

- [ ] we need to create a text input component with autocomplet it will take in the options of the history of expansces or debts based on what is being added

- [ ] we need to add a List of things to buy PAGE

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
- [x] when adding a transfer form EGP to USD the Exchange Rate math is not right we need to show the Exchange Rate usd => egp
      1$ = 51.8 E£ ====> 200$ = 10360 E£ but 1$ = 0.0193 E£ ====> 10360 E£ = 199.95 $ !!!
- [x] we an Debt Payment is Received we need to show the related debt to it on the card and the deatils modal
- [x] if the user delete a debt payment the debt will show the Remaining is 0 (or whatever is left) and Total Paid wont change but the amount will be dedcted form the account the payment was made to (same for both "I Owe" and "They Owe" debts)
- [x] at the moment if we delete a debt after it was paied the debt payment transaction is being deleted but the amount on the effected account is not chageing and i dont knwo if it should on not
- [x] at the moment we can spend money we dont have in the account and it can have a - value
- [x] we need to be able to reorder accounts categories Subcategories Currencies People/Entities and tags
