import { assign, createMachine } from "xstate";

export const buyNFTMachine = createMachine(
  {
    id: "BUYNFT",
    tsTypes: {} as import("./fixedprice-BuyNFT-machine.typegen").Typegen0,
    schema: {
      context: {} as { quantity: number },
      events: {} as
        | { type: "BUYNFT.CLICKED" }
        | { type: "QUANTITY.INCREASECLICKED" }
        | { type: "QUANTITY.DECREASECLICKED" },
      services: {} as {},
    },
    context: {
      quantity: 1,
    },
    states: {
      idle: {
        on: {
          "QUANTITY.INCREASECLICKED": {
            target: "idle",
            actions: "increaseQuantity",
          },
          "QUANTITY.DECREASECLICKED": {
            target: "idle",
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
    initial: "idle",
  },
  {
    actions: {
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
    services: {
      buyNFTRequest: async () => {
        throw new Error();
      },
    },
  }
);
