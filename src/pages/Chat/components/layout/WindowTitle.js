import React from "react";
import styled from "styled-components";

const WindowTitleContainer = styled.div`
    padding: 14px;
    position: relative;
`;

const DotsWrapper = styled.div`
    float: left;
    width: 50px;

    & > i {
        margin-right: 2px;
    }
    & > i:nth-child(1) {
        color: #f57e7d;
    }
    & > i:nth-child(2) {
        color: #ffc881;
    }
    & > i:nth-child(3) {
        color: #82cf85;
    }
`;

const TitleText = styled.div`
    overflow: hidden;
    text-align: center;
    font-weight: bold;
`;

const ExitButton = styled.div`
    position: absolute;
    right: 14px;
    top: 12px;

    i {
        color: #E62424;
        font-size: 22px;
        cursor: pointer;
    }
`;

const WindowTitle = () => (
    <WindowTitleContainer>
        <DotsWrapper>
            <i className="fa fa-circle"></i>
            <i className="fa fa-circle"></i>
            <i className="fa fa-circle"></i>
        </DotsWrapper>
        <TitleText>
            <span>Чат</span>
        </TitleText>
        <ExitButton title="Выйти из аккаунта">
            {/* TODO: отладить чтобы не было никаких казусов с react-router */}
            <i className="fa fa-times" onClick={() => document.location.assign("logout")}></i>
        </ExitButton>
    </WindowTitleContainer>
);
export default React.memo( WindowTitle );
