import { assign, createMachine } from "xstate";

interface Transaction {
  id: string;
  itemName: string;
  amount: number;
  price: number;
}

export const transactionMachine = createMachine(
  {
    id: "TRANSACTION",
    tsTypes: {} as import("./transaction-machine.typegen").Typegen0,
    schema: {
      context: {} as { transactionList: Transaction[]; failedCount: number },
      events: {} as { type: "TRANSACTION.CLICKED" } | { type: "RETRY" },
      services: {} as {
        fetchTransactionList: { data: Transaction[] };
      },
    },
    context: {
      transactionList: [],
      failedCount: 0,
    },
    states: {
      idle: {
        invoke: {
          id: "fetch-transactionList",
          src: "fetchTransactionList",
          onDone: {
            target: "closed",
            actions: "updateList",
          },
          onError: [
            {
              target: "end",
              cond: "failedGuard",
            },
            {
              target: "failed",
              actions: "updateFailedCount",
            },
          ],
        },
      },
      closed: {
        on: {
          "TRANSACTION.CLICKED": {
            target: "opened",
          },
        },
      },
      opened: {
        on: {
          "TRANSACTION.CLICKED": {
            target: "closed",
          },
        },
      },
      failed: {
        on: {
          RETRY: { target: "idle" },
        },
      },
      end: {},
    },
    initial: "idle",
  },
  {
    services: {
      fetchTransactionList: async () => {
        return [
          {
            id: "string",
            itemName: "string",
            amount: 3,
            price: 2,
          },
          {
            id: "dd",
            itemName: "sss",
            amount: 3,
            price: 11,
          },
        ];
      },
    },
    actions: {
      updateList: assign((context, event) => {
        return {
          ...context,
          transactionList: event.data,
        };
      }),
      updateFailedCount: assign((context, event) => {
        context.failedCount++;
        return { ...context, event };
      }),
    },
    guards: {
      failedGuard: (context) => context.failedCount > 4,
    },
  }
);
