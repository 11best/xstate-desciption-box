// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    updateRoundsInfo: "done.invoke.fetchRounds";
    updateWhitelistStatus: "done.invoke.fetch-whiteliststatus";
    resetContext: "QUOTA.CHECKED";
    increaseQuantity: "QUANTITY.INCREASECLICKED";
    decreaseQuantity: "QUANTITY.DECREASECLICKED";
  };
  internalEvents: {
    "done.invoke.fetchRounds": {
      type: "done.invoke.fetchRounds";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.fetch-whiteliststatus": {
      type: "done.invoke.fetch-whiteliststatus";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.connectwallet": {
      type: "done.invoke.connectwallet";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "xstate.init": { type: "xstate.init" };
    "error.platform.fetchRounds": {
      type: "error.platform.fetchRounds";
      data: unknown;
    };
    "error.platform.connectwallet": {
      type: "error.platform.connectwallet";
      data: unknown;
    };
    "error.platform.fetch-whiteliststatus": {
      type: "error.platform.fetch-whiteliststatus";
      data: unknown;
    };
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
    fetchRounds: "done.invoke.fetchRounds";
    checkWalletConnection: "done.invoke.connectwallet";
    fetchWhitelistStatus: "done.invoke.fetch-whiteliststatus";
    buyNFTRequest: "done.invoke.buyNFT-request";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    fetchRounds: "xstate.init";
    checkWalletConnection: "done.invoke.fetchRounds" | "RETRY";
    fetchWhitelistStatus: "done.invoke.connectwallet";
    buyNFTRequest: "BUYNFT.CLICKED";
  };
  eventsCausingGuards: {
    quotaOff: "QUOTA.CHECKED";
    quotaRemains: "QUOTA.CHECKED";
  };
  eventsCausingDelays: {};
  matchesStates:
    | "loadRounds"
    | "checkWalletConnection"
    | "checkWhitelist"
    | "checkQuota"
    | "cannotBuy"
    | "canBuy"
    | "pending"
    | "complete"
    | "error";
  tags: never;
}
