import { assign, createMachine } from "xstate";

const wallet_addr = "0x9b4c4286cd67f9E20e79B1f8Efd25350646f5b0B";

export const services = {
  checkWalletConnection: async () => {
    return "wallet_address";
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

interface BuyOrder {
  nftName: string;
  // contract_address: string;
  quantity: number;
}

export const buyNFTMachine = createMachine(
  {
    id: "BUYNFT",
    tsTypes: {} as import("./fixedprice-BuyNFT-machine.typegen").Typegen0,
    schema: {
      context: {} as {
        whitelistData: Whitelist;
        totalWeight: number;
        buy_order: BuyOrder[];
      },
      events: {} as
        | { type: "BUYNFT.CLICKED" }
        | { type: "QUANTITY.INCREASECLICKED"; nftName: string }
        | { type: "QUANTITY.DECREASECLICKED"; nftName: string }
        | { type: "QUOTA.CHECKED" }
        | { type: "RETRY" },
      services: {} as {
        checkWalletConnection: { data: string };
        fetchWhitelistStatus: { data: Whitelist };
      },
    },
    context: {
      whitelistData: null,
      totalWeight: 0,
      buy_order: [
        { nftName: "silver", quantity: 0 },
        { nftName: "gold", quantity: 0 },
        { nftName: "platinum", quantity: 0 },
      ],
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
            // target: "checkQuota",
            actions: "increaseQuantity",
          },
          "QUANTITY.DECREASECLICKED": {
            // target: "checkQuota",
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
      increaseQuantity: assign((context, event) => {
        console.log("context", context, "event", event);
        //TODO : should + by weight of each box
        const weight =
          context.totalWeight === context.whitelistData.remaining_quota
            ? context.whitelistData.remaining_quota
            : context.totalWeight + 1;

        //update buy_order
        let list = context.buy_order;
        const getQuantity = list.find(
          (item) => item.nftName == event.nftName
        ).quantity;
        let updateList = { nftName: event.nftName, quantity: getQuantity + 1 };
        list.find((item) => item.nftName == updateList.nftName).quantity =
          updateList.quantity;

        return {
          ...context,
          totalWeight: weight,
          buy_order: list,
        };
      }),
      decreaseQuantity: assign((context, event) => {
        const weight = context.totalWeight > 0 ? context.totalWeight - 1 : 0;

        //update buy_order
        let list = context.buy_order;
        const getQuantity = list.find(
          (item) => item.nftName == event.nftName
        ).quantity;
        const currentQuantity = getQuantity > 0 ? getQuantity - 1 : 0;
        let updateList = { nftName: event.nftName, quantity: currentQuantity };
        list.find((item) => item.nftName == updateList.nftName).quantity =
          updateList.quantity;

        return {
          ...context,
          totalWeight: weight,
          buy_order: list,
        };
      }),
    },
    guards: {
      quotaOff: (context) => context.whitelistData.remaining_quota < 1,
      quotaRemains: (context) => context.whitelistData.remaining_quota > 1,
    },
  }
);
