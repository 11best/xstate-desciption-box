// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    updateList: "done.invoke.fetch-transactionList";
    updateFailedCount: "error.platform.fetch-transactionList";
  };
  internalEvents: {
    "done.invoke.fetch-transactionList": {
      type: "done.invoke.fetch-transactionList";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.fetch-transactionList": {
      type: "error.platform.fetch-transactionList";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    fetchTransactionList: "done.invoke.fetch-transactionList";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    fetchTransactionList: "RETRY";
  };
  eventsCausingGuards: {
    failedGuard: "error.platform.fetch-transactionList";
  };
  eventsCausingDelays: {};
  matchesStates: "idle" | "closed" | "opened" | "failed" | "end";
  tags: never;
}
