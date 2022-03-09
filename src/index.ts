import { inspect } from "@xstate/inspect";
import { interpret } from "xstate";
import { descriptionMachine, services } from "./description-machine";
// @ts-ignore
import { Elm as ElmDes } from "./DescriptionBox.elm";
// @ts-ignore
import { Elm as ElmTran } from "./TransactionBox.elm";

const elmDes = ElmDes.DescriptionBox.init({
  node: document.querySelector("main"),
  flags: {},
});

const elmTran = ElmTran.TransactionBox.init({
  node: document.getElementById("tran"),
  flags: {},
});

const machine = descriptionMachine(services);

inspect({
  // options
  // url: 'https://statecharts.io/inspect', // (default)
  iframe: false, // open in new window
});

const machineInterpreter = interpret(machine, {
  devTools: true,
});

machineInterpreter.onTransition((state) => {
  console.log("state change", state.value);
  elmDes.ports.stateChanged.send(state);
  if (state.matches("failed")) {
    machineInterpreter.send("RETRY");
  }
});

elmDes.ports.event.subscribe((event: any) => {
  machineInterpreter.send("DESCRIPTION.CLICKED");
});

machineInterpreter.start();
