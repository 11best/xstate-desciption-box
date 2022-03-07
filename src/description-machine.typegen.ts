// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    updateDetail: "done.invoke.fetch-detail";
    updateFailedCount: "error.platform.fetch-detail";
  };
  internalEvents: {
    "done.invoke.fetch-detail": {
      type: "done.invoke.fetch-detail";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.fetch-detail": {
      type: "error.platform.fetch-detail";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    fetchDetail: "done.invoke.fetch-detail";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    fetchDetail: "RETRY";
  };
  eventsCausingGuards: {
    failedGuard: "error.platform.fetch-detail";
  };
  eventsCausingDelays: {};
  matchesStates: "idle" | "closed" | "opened" | "failed" | "end";
  tags: never;
}
