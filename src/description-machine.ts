import { assign, createMachine } from "xstate";

export const services = {
  fetchDetail: async () => {
    return "detaildetaildetaildetaildetaildetail";
  },
};

type Services = typeof services;

export const descriptionMachine = (services: Services) =>
  createMachine(
    {
      id: "DESCRIPTION",
      tsTypes: {} as import("./description-machine.typegen").Typegen0,
      schema: {
        context: {} as { detail: string; failedCount: number },
        events: {} as { type: "DESCRIPTION.CLICKED" } | { type: "RETRY" },
        services: {} as {
          fetchDetail: { data: string };
        },
      },
      context: {
        detail: null,
        failedCount: 0,
      },
      states: {
        idle: {
          invoke: {
            id: "fetch-detail",
            src: "fetchDetail",
            onDone: {
              target: "closed",
              actions: "updateDetail",
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
            "DESCRIPTION.CLICKED": {
              target: "opened",
            },
          },
        },
        opened: {
          on: {
            "DESCRIPTION.CLICKED": {
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
      services,
      actions: {
        updateDetail: assign((context, event) => {
          return {
            ...context,
            detail: event.data,
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
