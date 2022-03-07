import { interpret } from "xstate";
import { descriptionMachine } from "./description-machine";

describe("test transition", () => {
  const services = {
    fetchDetail: async () => "datadata",
  };

  const machine = descriptionMachine(services);

  it("at 'failed' when retry should back to 'idle'", () => {
    const ac = machine.transition("failed", { type: "RETRY" });
    expect(ac.matches("idle")).toBeTruthy();
  });

  it("at 'closed' when clicked should be 'opened'", () => {
    const ac = machine.transition("closed", { type: "DESCRIPTION.CLICKED" });
    expect(ac.matches("opened")).toBeTruthy();
  });

  it("at 'opend' when clicked should be 'closed'", () => {
    const ac = machine.transition("opened", { type: "DESCRIPTION.CLICKED" });
    expect(ac.matches("closed")).toBeTruthy();
  });
});

describe("test invoke", () => {
  test("services return null should be 'failed'", (done) => {
    const services = {
      fetchDetail: async () => {
        throw new Error();
      },
    };

    const machine = descriptionMachine(services);

    interpret(machine)
      .onTransition((state) => {
        if (state.matches("failed")) {
          try {
            expect(state.value).toBe("failed");
            done();
          } catch (e) {
            done(e);
          }
        }
      })
      .start();
  });

  test("services return notnull should be 'closed'", (done) => {
    const services = {
      fetchDetail: async () => "notnull",
    };

    const machine = descriptionMachine(services);

    interpret(machine)
      .onTransition((state) => {
        if (state.matches("closed")) {
          try {
            expect(state.value).toBe("closed");
            done();
          } catch (e) {
            done(e);
          }
        }
      })
      .start();
  });

  test("services failed more than 5 times", (done) => {
    const services = {
      fetchDetail: async () => {
        throw new Error("testError");
      },
    };

    const machine = descriptionMachine(services);

    const mock = machine.withContext({ detail: null, failedCount: 5 });

    interpret(mock)
      .onTransition((state) => {
        if (state.matches("end")) {
          try {
            expect(state.value).toBe("end");
            done();
          } catch (e) {
            done(e);
          }
        }
      })
      .start();
  });
});
