import { assign, createMachine } from "xstate";

export const services = {
  checkConnectWallet: async () => {},
  fetchWhitelistStatus: async (wallet_address) => {
    let results: Whitelist;
    fetch(
      "/services/fixed-price/ampleia/presale-1/whitelist/0x9b4c4286cd67f9E20e79B1f8Efd25350646f5b0B",
      {
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "*",
          accept: "application/json",
          Authorization: "Bearer xxxxx",
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        console.log("whitelist res :", res);
        results = res;
      });
    return results;
  },
  buyNFTRequest: async () => {
    throw new Error();
  },
};

interface Whitelist {
  project_id: string;
  round_id: string;
  wallet_address: string;
  total_quota: number;
  remaining_quota: number;
  meta: {
    tier: string;
    point: string;
    level: string;
  };
}

export const buyNFTMachine = createMachine(
  {
    id: "BUYNFT",
    tsTypes: {} as import("./fixedprice-BuyNFT-machine.typegen").Typegen0,
    schema: {
      context: {} as { whitelistData: Whitelist; quantity: number },
      events: {} as
        | { type: "BUYNFT.CLICKED" }
        | { type: "QUANTITY.INCREASECLICKED" }
        | { type: "QUANTITY.DECREASECLICKED" }
        | { type: "QUOTA.CHECKED" },
      services: {} as {
        fetchWhitelistStatus: { data: Whitelist };
      },
    },
    context: {
      whitelistData: null,
      quantity: 1,
    },
    states: {
      check_walletConnection: {
        invoke: {
          id: "connectwallet",
          src: "checkConnectWallet",
          onDone: {
            target: "check_whitelist",
          },
          onError: {
            target: "cannot_buy",
          },
        },
      },
      check_whitelist: {
        invoke: {
          id: "fetch-whiteliststatus",
          src: "fetchWhitelistStatus",
          onDone: {
            target: "check_quota",
            actions: "updateWhitelistStatus",
          },
          onError: {
            target: "cannot_buy",
          },
        },
      },
      check_quota: {
        on: {
          "QUOTA.CHECKED": [
            { target: "cannot_buy", cond: "quotaOff" },
            { target: "ready_to_buy", cond: "quotaRemains" },
          ],
        },
      },
      cannot_buy: {},
      ready_to_buy: {
        on: {
          "QUANTITY.INCREASECLICKED": {
            target: "ready_to_buy",
            actions: "increaseQuantity",
          },
          "QUANTITY.DECREASECLICKED": {
            target: "ready_to_buy",
            actions: "decreaseQuantity",
          },
          "BUYNFT.CLICKED": {
            target: "pending",
          },
        },
      },
      pending: {
        invoke: {
          id: "buyNFT-request",
          src: "buyNFTRequest",
          onDone: {
            target: "complete",
          },
          onError: {
            target: "error",
          },
        },
      },
      complete: {},
      error: {},
    },
    initial: "check_walletConnection",
  },
  {
    services,
    actions: {
      updateWhitelistStatus: assign((context, event) => {
        return {
          ...context,
          whitelistData: event.data,
        };
      }),
      increaseQuantity: assign((context) => {
        const q = context.quantity === 10 ? 10 : context.quantity + 1;
        console.log("increase action", q);
        return {
          ...context,
          quantity: q,
        };
      }),
      decreaseQuantity: assign((context) => {
        const q = context.quantity > 1 ? context.quantity - 1 : 1;
        console.log("decrease action", q);
        return {
          ...context,
          quantity: q,
        };
      }),
    },
    guards: {
      quotaOff: (context) => context.whitelistData.remaining_quota < 1,
      quotaRemains: (context) => context.whitelistData.remaining_quota > 1,
    },
  }
);
