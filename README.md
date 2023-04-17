# candid-js

Candid AST parser using Chevrotain library.

Input: candid
Output: azle | candid | json

### Usage CLI:

```
npx candid-js@latest some.did azle
```

### Usage JS:

```
import {transpile} from "candid-js"

let output = transpile(didText, "json")
```

Testing strategy:
Candid -> AST -> Candid -> didc check

Notice:

- The json output may change
- Candid import not implemented
- Candid edge cases may not transpile properly, however most SDK generated Candid should be fine
- Visitor can be easily modified to get different output.

Example output:

```json
{
  "types": [
    { "type": "nat", "name": "TxId" },
    {
      "type": {
        "type": "record",
        "fields": [
          { "type": "principal", "name": "owner" },
          { "type": { "type": "opt", "inner": "blob" }, "name": "subaccount" }
        ]
      },
      "name": "Account"
    },
    { "type": "blob", "name": "SubAccount" },
    {
      "type": {
        "type": "record",
        "fields": [
          { "type": "text", "name": "kind" },
          {
            "type": {
              "type": "opt",
              "inner": {
                "type": "record",
                "fields": [
                  { "type": "nat", "name": "amount" },
                  { "type": "Account", "name": "to" },
                  {
                    "type": { "type": "opt", "inner": "blob" },
                    "name": "memo"
                  },
                  {
                    "type": { "type": "opt", "inner": "nat64" },
                    "name": "created_at_time"
                  }
                ]
              }
            },
            "name": "mint"
          },
          {
            "type": {
              "type": "opt",
              "inner": {
                "type": "record",
                "fields": [
                  { "type": "nat", "name": "amount" },
                  { "type": "Account", "name": "from" },
                  {
                    "type": { "type": "opt", "inner": "blob" },
                    "name": "memo"
                  },
                  {
                    "type": { "type": "opt", "inner": "nat64" },
                    "name": "created_at_time"
                  }
                ]
              }
            },
            "name": "burn"
          },
          {
            "type": {
              "type": "opt",
              "inner": {
                "type": "record",
                "fields": [
                  { "type": "nat", "name": "amount" },
                  { "type": "Account", "name": "from" },
                  { "type": "Account", "name": "to" },
                  {
                    "type": { "type": "opt", "inner": "blob" },
                    "name": "memo"
                  },
                  {
                    "type": { "type": "opt", "inner": "nat64" },
                    "name": "created_at_time"
                  },
                  { "type": { "type": "opt", "inner": "nat" }, "name": "fee" }
                ]
              }
            },
            "name": "transfer"
          },
          { "type": "nat64", "name": "timestamp" }
        ]
      },
      "name": "Transaction"
    },
    {
      "type": {
        "type": "record",
        "fields": [
          { "type": "Account", "name": "account" },
          { "type": { "type": "opt", "inner": "TxId" }, "name": "start" },
          { "type": "nat", "name": "max_results" }
        ]
      },
      "name": "GetAccountTransactionsArgs"
    },
    {
      "type": {
        "type": "record",
        "fields": [
          { "type": "TxId", "name": "id" },
          { "type": "Transaction", "name": "transaction" }
        ]
      },
      "name": "TransactionWithId"
    },
    {
      "type": {
        "type": "record",
        "fields": [
          {
            "type": { "type": "vec", "inner": "TransactionWithId" },
            "name": "transactions"
          },
          { "type": { "type": "opt", "inner": "TxId" }, "name": "oldest_tx_id" }
        ]
      },
      "name": "GetTransactions"
    },
    {
      "type": {
        "type": "record",
        "fields": [{ "type": "text", "name": "message" }]
      },
      "name": "GetTransactionsErr"
    },
    {
      "type": {
        "type": "variant",
        "fields": [
          { "type": "GetTransactions", "name": "Ok" },
          { "type": "GetTransactionsErr", "name": "Err" }
        ]
      },
      "name": "GetTransactionsResult"
    },
    {
      "type": {
        "type": "record",
        "fields": [
          { "type": "principal", "name": "owner" },
          { "type": { "type": "opt", "inner": "SubAccount" }, "name": "start" }
        ]
      },
      "name": "ListSubaccountsArgs"
    },
    {
      "type": {
        "type": "record",
        "fields": [{ "type": "principal", "name": "ledger_id" }]
      },
      "name": "InitArgs"
    }
  ],
  "service": {
    "type": "service",
    "arg": ["InitArgs"],
    "inner": [
      {
        "name": "get_account_transactions",
        "func": {
          "inputs": ["GetAccountTransactionsArgs"],
          "outputs": ["GetTransactionsResult"]
        }
      },
      {
        "name": "ledger_id",
        "func": { "inputs": [], "outputs": ["principal"], "type": "query" }
      },
      {
        "name": "list_subaccounts",
        "func": {
          "inputs": ["ListSubaccountsArgs"],
          "outputs": [{ "type": "vec", "inner": "SubAccount" }],
          "type": "query"
        }
      }
    ]
  }
}
```
