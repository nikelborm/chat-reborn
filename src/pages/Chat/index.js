import React from "react";
import WindowArea from "./components/WindowArea";
import WindowTitle from "./components/layout/WindowTitle";
import "./styles/index.css";
import styled from "styled-components";

const WindowWrapper = styled.div`
    background: #fff;
    width: 780px;
    margin: 30px auto;
    border-radius: 6px;
    box-shadow: 0 0 6px rgba(0,0,0,0.3);
    overflow: hidden;
    min-height: 530px;
    position: relative;
    font-size: 12px;
    color: #333f4d;
`;
function Chat() {
    return (
        <WindowWrapper>
            <WindowTitle />
            <WindowArea />
        </WindowWrapper>
    );
}
export default Chat;
