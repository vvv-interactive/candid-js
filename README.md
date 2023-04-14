# js_candid_parser

Not finished.

Currently given test.did produces:

{"types":{"TxId":"nat","Account":{"type":"record","properties":{"owner":"principal","subaccount":{"optional":true,"type":"opt"}}},"SubAccount":"blob","Transaction":{"type":"record","properties":{"kind":"text","mint":{"optional":true,"type":"opt"},"burn":{"optional":true,"type":"opt"},"transfer":{"optional":true,"type":"opt"},"timestamp":"nat64"}},"GetAccountTransactionsArgs":{"type":"record","properties":{"account":"Account","start":{"optional":true,"type":"opt"},"max_results":"nat"}},"TransactionWithId":{"type":"record","properties":{"id":"TxId","transaction":"Transaction"}},"GetTransactions":{"type":"record","properties":{"transactions":{"type":"vec","innerType":"TransactionWithId"},"oldest_tx_id":{"optional":true,"type":"opt"}}},"GetTransactionsErr":{"type":"record","properties":{"message":"text"}},"GetTransactionsResult":{"type":"variant","properties":{"Ok":"GetTransactions","Err":"GetTransactionsErr"}},"ListSubaccountsArgs":{"type":"record","properties":{"owner":"principal","start":{"optional":true,"type":"opt"}}},"InitArgs":{"type":"record","properties":{"ledger_id":"principal"}}},"services":{"get_account_transactions":{"input":"GetAccountTransactionsArgs","output":"GetTransactionsResult"},"ledger_id":{"input":"principal"},"list_subaccounts":{"input":"ListSubaccountsArgs","output":{"type":"vec","innerType":"SubAccount"}}}}

A lot of tokens missing and rules aren't perfect
