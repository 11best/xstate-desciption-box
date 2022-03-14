// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    increaseQuantity: "QUANTITY.INCREASECLICKED";
    decreaseQuantity: "QUANTITY.DECREASECLICKED";
  };
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
    "done.invoke.buyNFT-request": {
      type: "done.invoke.buyNFT-request";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.buyNFT-request": {
      type: "error.platform.buyNFT-request";
      data: unknown;
    };
  };
  invokeSrcNameMap: {
    buyNFTRequest: "done.invoke.buyNFT-request";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    buyNFTRequest: "BUYNFT.CLICKED";
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates: "idle" | "pending" | "complete" | "error";
  tags: never;
}
