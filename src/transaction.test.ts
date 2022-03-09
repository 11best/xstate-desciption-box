import { interpret } from "xstate";
import { transactionMachine } from "./transaction-machine";

describe("test transaction", () => {
  test("at 'failed' RETRY to 'idle'", () => {
    const machine = transactionMachine.transition("failed", { type: "RETRY" });
    expect(machine.matches("idle")).toBeTruthy();
  });

  test("at 'closed' clicked should be 'opened'", () => {
    const machine = transactionMachine.transition("closed", {
      type: "TRANSACTION.CLICKED",
    });
    expect(machine.matches("opened")).toBeTruthy();
  });
  test("at 'opened' clicked should be 'closed'", () => {
    const machine = transactionMachine.transition("opened", {
      type: "TRANSACTION.CLICKED",
    });
    expect(machine.matches("closed")).toBeTruthy();
  });
});

describe("test invoke", () => {
  test("service can fetch data go to 'closed'", (done) => {
    const machine = interpret(transactionMachine).onTransition((state) => {
      if (state.matches("closed")) {
        try {
          expect(state.value).toBe("closed");
          done();
        } catch (e) {
          done(e);
        }
      }
    });
    machine.start();
  });

  test("service fetch error one time go to 'failed'", (done) => {
    const mockMachine = transactionMachine.withConfig({
      services: {
        fetchTransactionList: async () => {
          throw new Error();
        },
      },
    });

    const machine = interpret(mockMachine).onTransition((state) => {
      if (state.matches("failed")) {
        try {
          expect(state.value).toBe("failed");
          done();
        } catch (e) {
          done(e);
        }
      }
    });
    machine.start();
  });

  test("service fetch error more than 5 times go to 'end'", (done) => {
    const mockServcice = transactionMachine.withConfig({
      services: {
        fetchTransactionList: async () => {
          throw new Error();
        },
      },
    });

    const mockMachine = mockServcice.withContext({
      transactionList: [],
      failedCount: 5,
    });

    const machine = interpret(mockMachine).onTransition((state) => {
      if (state.matches("end")) {
        try {
          expect(state.value).toBe("end");
          done();
        } catch (e) {
          done(e);
        }
      }
    });
    machine.start();
  });
});
