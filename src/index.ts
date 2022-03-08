import { inspect } from "@xstate/inspect";
import { interpret } from "xstate";
import { descriptionMachine, services } from "./description-machine";
// @ts-ignore
import { Elm } from "./Main.elm";

const elm = Elm.Main.init({
  node: document.querySelector("main"),
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
  elm.ports.stateChanged.send(state);
});

elm.ports.event.subscribe((event: any) => {
  machineInterpreter.send("DESCRIPTION.CLICKED");
});

machineInterpreter.start();
