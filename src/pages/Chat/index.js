import React from "react";
import WindowArea from "./components/WindowArea";
import WindowTitle from "./components/layout/WindowTitle";
import "./styles/index.css";

function Chat() {
    return (
        <div className="window-wrapper">
            <WindowTitle />
            <WindowArea />
        </div>
    );
}
export default Chat;
