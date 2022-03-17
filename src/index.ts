import { inspect } from "@xstate/inspect";
import { interpret } from "xstate";
//@ts-ignore
import { Elm as ElmBuy } from "./BuyNFT.elm";
import { descriptionMachine, services } from "./description-machine";
// @ts-ignore
import { Elm as ElmDes } from "./DescriptionBox.elm";
import { buyNFTMachine } from "./fixedprice-BuyNFT-machine";
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

const elmBuy = ElmBuy.BuyNFT.init({
  node: document.getElementById("buy"),
  flags: {},
});

const desMachine = descriptionMachine(services);

inspect({
  // options
  // url: 'https://statecharts.io/inspect', // (default)
  iframe: false, // open in new window
});

const desInterpreter = interpret(desMachine, {
  // devTools: true,
});
const tranInterpret = interpret(transactionMachine, {
  // devTools: true,
});
const buyInterpret = interpret(buyNFTMachine, {
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

buyInterpret.onTransition((state) => {
  console.log("buyNFT state change", state.value, state.context);
  if (state.matches("checkQuota")) {
    buyInterpret.send("QUOTA.CHECKED");
  }
  elmBuy.ports.stateChanged.send(state);
});

elmDes.ports.event.subscribe((event: any) => {
  desInterpreter.send("DESCRIPTION.CLICKED");
});

elmTran.ports.event.subscribe((event: any) => {
  tranInterpret.send("TRANSACTION.CLICKED");
});

elmBuy.ports.event.subscribe((event: any) => {
  console.log("buy event :", event);
  if (event.action === "decrease") {
    buyInterpret.send("QUANTITY.DECREASECLICKED", event);
  }
  if (event.action === "increase") {
    buyInterpret.send("QUANTITY.INCREASECLICKED", event);
  }
  if (event.action === "buy") {
    buyInterpret.send("BUYNFT.CLICKED");
  }
});

desInterpreter.start();
tranInterpret.start();
buyInterpret.start();
