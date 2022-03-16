import { assign, createMachine } from "xstate";

const wallet_addr = "0x9b4c4286cd67f9E20e79B1f8Efd25350646f5b0B";

export const services = {
  checkWalletConnection: async () => {
    return true;
  },
  fetchWhitelistStatus: async () => {
    let results: Whitelist;
    await fetch(
      `/services/fixed-price/ampleia/presale-1/whitelist/${wallet_addr}`,
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
        | { type: "QUOTA.CHECKED" }
        | { type: "RETRY" },
      services: {} as {
        fetchWhitelistStatus: { data: Whitelist };
      },
    },
    context: {
      whitelistData: null,
      quantity: 1,
    },
    states: {
      checkWalletConnection: {
        invoke: {
          id: "connectwallet",
          src: "checkWalletConnection",
          onDone: {
            target: "checkWhitelist",
          },
          onError: {
            target: "cannotBuy",
          },
        },
      },
      checkWhitelist: {
        invoke: {
          id: "fetch-whiteliststatus",
          src: "fetchWhitelistStatus",
          onDone: {
            target: "checkQuota",
            actions: "updateWhitelistStatus",
          },
          onError: {
            target: "cannotBuy",
          },
        },
      },
      checkQuota: {
        on: {
          "QUOTA.CHECKED": [
            { target: "cannotBuy", cond: "quotaOff" },
            { target: "canBuy", cond: "quotaRemains" },
          ],
        },
      },
      cannotBuy: {
        on: {
          RETRY: {
            target: "checkWalletConnection",
          },
        },
      },
      canBuy: {
        on: {
          "QUANTITY.INCREASECLICKED": {
            target: "checkQuota",
            actions: "increaseQuantity",
          },
          "QUANTITY.DECREASECLICKED": {
            target: "checkQuota",
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
    initial: "checkWalletConnection",
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
        const q =
          context.quantity === context.whitelistData.remaining_quota
            ? context.whitelistData.remaining_quota
            : context.quantity + 1;
        return {
          ...context,
          quantity: q,
        };
      }),
      decreaseQuantity: assign((context) => {
        const q = context.quantity > 1 ? context.quantity - 1 : 1;
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
