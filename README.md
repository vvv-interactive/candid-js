# js_candid_parser

Not finished.

AST parser.

Uses chevrotain library.

Visitor can be modified to get different output.

Example output:

```json
{
  "types": {
    "ComplexFunc": {
      "type": "func",
      "func": {
        "inputs": [
          {
            "type": "record",
            "fields": [
              {
                "name": "id",
                "type": "text"
              },
              {
                "name": "complexFunc",
                "type": "ComplexFunc"
              },
              {
                "name": "basicFunc",
                "type": {
                  "type": "func",
                  "func": {
                    "inputs": [
                      "text"
                    ],
                    "outputs": [
                      "text"
                    ],
                    "type": "query"
                  }
                }
              }
            ]
          }
        ],
        "outputs": [
          "nat64"
        ],
        "type": "update"
      }
    },
    "ManualReply": {
      "type": "variant",
      "fields": {
        "Ok": {
          "type": "func",
          "func": {
            "inputs": [
              {
                "type": "vec",
                "innerType": "nat8"
              }
            ],
            "outputs": [],
            "type": "oneway"
          }
        },
        "Err": "text"
      }
    },
```
