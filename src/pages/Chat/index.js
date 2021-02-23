import React from "react";
import WindowArea from "./components/WindowArea";
import WindowTitle from "./components/layout/WindowTitle";
import styled from "styled-components";
import { withRouter } from "react-router-dom";

// TODO: добавить ленивую предзагрузку как самого чата, так и дополнительную предзагрузку всех шрифтов, картинок, иконок, иконочных шрифтов, свгшечек прямо в код public/index.html страницы https://habr.com/ru/post/445264/
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
    font-family: 'Open Sans', Arial, sans-serif;
    line-height: 1;

    & ::-webkit-scrollbar-track {
        background-color: #DBDBDB;
    }
    & ::-webkit-scrollbar-thumb {
        border-radius: 10px;
        background-color:#A1AFC4;
        cursor: pointer;
    }
    & ::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.6);
    }
    & ::-webkit-scrollbar-thumb:active {
        background: rgba(0, 0, 0, 0.8);
    }
    & ::-webkit-scrollbar{
        width: 8px;
    }
    & .tippy-tooltip.emoji-theme {
        background-color: #6d828f;
        user-select: none
    }
    & .tippy-tooltip.emoji-theme[data-placement^='bottom'] .tippy-arrow {
        border-bottom-color: rgb(255, 78, 78)
    }
`;
const Chat = props => (
    <WindowWrapper>
        <WindowTitle />
        <WindowArea />
    </WindowWrapper>
);
export default withRouter( Chat );
