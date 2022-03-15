// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    updateWhitelistStatus: "done.invoke.fetch-whiteliststatus";
    increaseQuantity: "QUANTITY.INCREASECLICKED";
    decreaseQuantity: "QUANTITY.DECREASECLICKED";
  };
  internalEvents: {
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
    checkConnectWallet: "done.invoke.connectwallet";
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
    checkConnectWallet: "xstate.init";
    fetchWhitelistStatus: "done.invoke.connectwallet";
    buyNFTRequest: "BUYNFT.CLICKED";
  };
  eventsCausingGuards: {
    quotaOff: "QUOTA.CHECKED";
    quotaRemains: "QUOTA.CHECKED";
  };
  eventsCausingDelays: {};
  matchesStates:
    | "check_walletConnection"
    | "check_whitelist"
    | "check_quota"
    | "cannot_buy"
    | "ready_to_buy"
    | "pending"
    | "complete"
    | "error";
  tags: never;
}
