const ConductorClient = require("conductor-client").default;

const conductorClient = new ConductorClient({});

const disallow = name => () => {
  throw new Error("Using " + name + " is not allowed!");
};

const createCon = () => {
  const con = { logs: [] };
  con.log = function () {
    con.logs.push(`${[...arguments]}`);
  };
  return con;
};

const NODE_MAJOR_VERSION = process.versions.node.split(".")[0];

const globals = {
  __dirname: null,
  __filename: null,
  clearImmediate: disallow("clearImmediate"),
  clearInterval: disallow("clearInterval"),
  clearTimeout: disallow("clearTimeout"),
  console: createCon(), // needs to be created on each call
  exports: null,
  global: {},
  module: null,
  process: null,
  queueMicrotask: disallow("queueMicrotask"), // since node 11
  require: disallow("require"),
  setImmediate: disallow("setImmediate"),
  setInterval: disallow("setInterval"),
  setTimeout: disallow("setTimeout"),
  TextDecoder: null,
  TextEncoder: null,
  //"URL",
  //"URLSearchParams",
  WebAssembly: null
  //"JSON",
};
const createSandbox = () => {
  return { ...globals, console: createCon() };
};

conductorClient.registerWatcher(
  "nodejs_" + NODE_MAJOR_VERSION,
  async (data, updater) => {
    try {
      console.log(data.taskType, data.inputData);

      if (!data.inputData || !data.inputData.scriptExpression) {
        updater.fail({
          reasonForIncompletion: "scriptExpression is missing from inputs"
        });
      }
      const sandbox = createSandbox();
      const functionArguments = ["$"],
        values = [data.inputData];
      Object.entries(sandbox).forEach(pair => {
        functionArguments.push(pair[0]);
        values.push(pair[1]);
      });
      functionArguments.push(data.inputData.scriptExpression);
      const script = new Function(...functionArguments);
      const result = script.apply(null, values);
      updater.complete({
        outputData: {
          result
        },
        logs: sandbox.console.logs
      });
    } catch (e) {
      updater.fail({
        reasonForIncompletion: e.message
      });
    }
  },
  { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
  true
);

console.log('Worker started...');