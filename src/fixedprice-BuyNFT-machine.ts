import { assign, createMachine } from "xstate";

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

const wallet_addr = "0x9b4c4286cd67f9E20e79B1f8Efd25350646f5b0B";

export const services = {
  fetchRounds: async () => {
    let results: any;
    await fetch(`/services/fixed-price/ampleia`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        console.log("fetch Rounds : ", res);
        results = res.results;
      });
    return results;
  },
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
  buyNFTRequest: async (context) => {
    await fetch(`/services/fixed-price/ampleia/presale-1/buy`, {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        accept: "application/json",
        Authorization: "Bearer xxxxx",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        buyer_address: wallet_addr,
        buy_order: [
          {
            contract_address: "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d",
            quantity: context.buy_order[0].quantity,
          },
          {
            contract_address: "0x2d677Dbe16752A066ef83e382DcC04D7003A61Ed ",
            quantity: context.buy_order[1].quantity,
          },
          {
            contract_address: "0xcdd02E7849CBBfeaF6401cfDc434999ff5fC0f04",
            quantity: context.buy_order[2].quantity,
          },
        ],
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log("buy log :", res);
      });
  },
};

export const buyNFTMachine = createMachine(
  {
    id: "BUYNFT",
    tsTypes: {} as import("./fixedprice-BuyNFT-machine.typegen").Typegen0,
    schema: {
      context: {} as {
        roundsInfo: any;
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
        fetchRounds: { data: any };
        checkWalletConnection: { data: string };
        fetchWhitelistStatus: { data: Whitelist };
      },
    },
    context: {
      roundsInfo: null,
      whitelistData: null,
      totalWeight: 0,
      buy_order: [
        { nftName: "silver", quantity: 0 },
        { nftName: "gold", quantity: 0 },
        { nftName: "platinum", quantity: 0 },
      ],
    },
    states: {
      loadRounds: {
        invoke: {
          id: "fetchRounds",
          src: "fetchRounds",
          onDone: {
            target: "checkWalletConnection",
            actions: "updateRoundsInfo",
          },
        },
      },
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
            { target: "canBuy", cond: "quotaRemains", actions: "resetContext" },
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
            actions: "increaseQuantity",
          },
          "QUANTITY.DECREASECLICKED": {
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
            target: "checkQuota",
          },
          onError: {
            target: "error",
          },
        },
      },
      complete: {},
      error: {},
    },
    initial: "loadRounds",
  },
  {
    services,
    actions: {
      updateRoundsInfo: assign((context, event) => {
        return { ...context, roundsInfo: event.data };
      }),
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
        //TODO : should - by weight of each box
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
      resetContext: assign((context) => {
        return {
          ...context,
          totalWeight: 0,
          buy_order: [
            { nftName: "silver", quantity: 0 },
            { nftName: "gold", quantity: 0 },
            { nftName: "platinum", quantity: 0 },
          ],
        };
      }),
    },
    guards: {
      quotaOff: (context) => context.whitelistData.remaining_quota < 1,
      quotaRemains: (context) => context.whitelistData.remaining_quota > 1,
    },
  }
);
