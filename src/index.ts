import { inspect } from "@xstate/inspect";
import { interpret } from "xstate";
import { descriptionMachine, services } from "./description-machine";
// @ts-ignore
import { Elm as ElmDes } from "./DescriptionBox.elm";
import { transactionMachine } from "./transaction-machine";
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

const desMachine = descriptionMachine(services);

inspect({
  // options
  // url: 'https://statecharts.io/inspect', // (default)
  iframe: false, // open in new window
});

const desInterpreter = interpret(desMachine, {
  devTools: true,
});
const tranInterpret = interpret(transactionMachine, {
  devTools: true,
});

desInterpreter.onTransition((state) => {
  console.log("description state change", state.value);

  elmDes.ports.stateChanged.send(state);
  if (state.matches("failed")) {
    desInterpreter.send("RETRY");
  }
});

tranInterpret.onTransition((state) => {
  console.log("transaction state change", state.value);

  elmTran.ports.stateChanged.send(state);
  if (state.matches("failed")) {
    tranInterpret.send("RETRY");
  }
});

elmDes.ports.event.subscribe((event: any) => {
  desInterpreter.send("DESCRIPTION.CLICKED");
});

elmTran.ports.event.subscribe((event: any) => {
  tranInterpret.send("TRANSACTION.CLICKED");
});

desInterpreter.start();
tranInterpret.start();
