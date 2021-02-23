/* eslint-disable no-useless-concat */
import React from "react";
import styled from "styled-components";
import getCookie from "../../../tools/getCookie";
import emptyAvatar from "../../../styles/unnamed.jpg";

const MyAccountInfoContainer = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 29px;
    padding: 8px;
    background: #445166;
`;

const AvatarContainer = styled.div`
    width: 30px;
    height: 30px;
    float: left;
    position: relative;

    & > i {
        color: #82cf85;
        position: absolute;
        top: -2px;
        right: -2px;
    }
`;

const Avatar = styled.img`
    width: 30px;
    height: 30px;
    border-radius: 30px;
`;

const NameAndStatus = styled.div`
    color: #fff;
    font-weight: 600;
    margin-left: 10px;
    float: left;
    cursor: pointer;

    & > i {
        font-weight: bold;
    }
`;

const MyAccountName = styled.span`
    overflow: hidden;
`;

const ProfileLifeStatus = styled.span`
    display: block;
    font-weight: normal;
    color: #8391a1;
    margin-top: 5px;
`;

// TODO: передавать данные не из куков, а с помощью потребителя контекста глобального состояния
const MyAccountInfo = () => (
    <MyAccountInfoContainer>
        <AvatarContainer>
            {/* TODO: Сделать чтобы при клике на аватарку открывалось меню её изменения */}
            <Avatar
                src={getCookie("avatarLink") || emptyAvatar}
                title="Аватар выбирается случайно"
                alt="User"
            />
            <i className={"fa fa-circle " + "online"}></i>
            {/* TODO: Сделать чтобы можно выбрать свой онлайн и он ставился после задержки: offline, online, idle */}
            {/* А не просто жёстко зашитый компонент и класс */}
        </AvatarContainer>
        <NameAndStatus>
            <MyAccountName title={getCookie("nickName") || "Error"}>
                { getCookie("fullName") || "Error" }{" "}
            </MyAccountName>
            <i className="fa fa-angle-down"></i>
            <ProfileLifeStatus>
                { getCookie("statusText") || "Error" }
            </ProfileLifeStatus>
        </NameAndStatus>
    </MyAccountInfoContainer>
);

export default React.memo( MyAccountInfo );
