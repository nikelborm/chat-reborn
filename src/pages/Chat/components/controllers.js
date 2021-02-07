import { createContext } from "react";
function providerNOTfound(caller) {
    return (...args) => console.log(caller, args);
}
export const Controllers = createContext({
    onSelectChat: providerNOTfound("onSelectChat"),
    onExpandChange: providerNOTfound("onExpandChange"),
    onMuteChange: providerNOTfound("onMuteChange"),
    onDeleteChat: providerNOTfound("onDeleteChat")
});
