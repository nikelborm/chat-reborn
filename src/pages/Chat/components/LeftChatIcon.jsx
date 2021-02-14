import styled from "styled-components";
const colormap = {
    "online" : "#82cf85",
    "idle" : "#ffac69",
    "offline" : "#f57e7d"
};

export const LeftChatIcon = styled.i`
    color: ${ props => props.onlineStatus in colormap ? colormap[ props.onlineStatus ] : "#79889d" };
    // font-size: 1.2em;
`;
