# NodeJS Conductor Worker 

Run NodeJS scripts from your workflow with ease!
- Can use the latest ES6 syntax, everything your NodeJs supports.
- Sandboxed environment (you can't use node's require and other functions, see `index.js` for full list)
- Every `console.log` will be added to the task's log (can be seen in Conductor's UI or by fetching the status from the API)

## Running

1. Clone this repository
2. Run `npm install`
3. Run `npm start`

## Inputs and Outputs

**Inputs**
|Parameter|Required|Type|Description
|---|---|---|---
|scriptExpression|Yes|String|The script to execute, needs to be in the form of a function body (return a value at the end of it, see example below)

**Outputs**
|Parameter|Type|Description
|---|---|---
|result|Any|The returned value from the task will be mapped to the `result` field of the task's output (e.g. `${js_1.output.result}`)

## Test

You can test the worker by running the following workflow definition dynamically:
* **Notice** my example is using NodeJS 12. If you use a different version (you can check by running `node --version`), then change the **name** of the **task** and its **taskDefinition** to `nodejs_<VERSION>` (where <VERSION> is your node's major version).

`POST` to `http://localhost:8080/api/workflow` the following:

```json
{
    "name": "adhoc_test_nodejs_worker",
    "version": 1,
    "correlationId": "c2e8f1de-dd8b-4ed3-beeb-08b6b17c1356",
    "input": {
      "name": "Eli"
    },
    "workflowDef": {
      "schemaVersion": 2,
      "name": "test_nodejs_worker",
      "ownerEmail": "eli@example.com",
      "version": 1,
      "inputParameters": [
        "name"
      ],
      "outputParameters": {
        "result": "${js_1.output.result}"
      },
      "tasks": [
        {
          "type": "SIMPLE",
          "name": "nodejs_12",
          "taskReferenceName": "js_1",
          "startDelay": 0,
          "optional": false,
          "inputParameters": {
            "name": "${workflow.input.name}",
            "scriptExpression": "console.log('this is a log'); return 'hello ' + $.name;"
          },
          "taskDefinition": {
            "name": "nodejs_12",
            "ownerEmail": "eli@example.com",
            "retryCount": 0,
            "inputKeys": [
              "scriptExpression"
            ],
            "outputKeys": [
              "result"
            ]
          }
        }
      ]
    }
  }
```

# Author

[Eli Sherer](https://github.com/elisherer)

# License

MIT License

Copyright (c) 2020 Eli Sherer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
