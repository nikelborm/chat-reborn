/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import styled from "styled-components";

const ActiveTabContent = styled.ul`
    list-style: none;
	padding: 10px;
	color: #6e7f91;
`;

const TabsContainer = styled.ul`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    border-left: 1px solid #cfdae1;
    border-top: 1px solid #cfdae1;
    width: 175px;
`;

const SettingsSymbol = styled.i`
    position: absolute;
    bottom: 14px;
    right: 14px;
    color: #a0b4c0;
    font-size: 18px;
    cursor: pointer;
`;

const TabsIcons = styled.ul`
	list-style: none;
    overflow: hidden;

    & > li {
        float: left;
        width: 33.3%;
        text-align: center;
        border-bottom: 1px solid #cfdae1;
    }
    & > li > a {
        border-left: 1px solid #cfdae1;
        color: #72a3ff;
        display: block;
        background: #eef2f8;
        padding: 8px 0;
    }
    & > li.active {
        border-bottom: none;
    }
    & > li.active > a {
        background: #fff;
        color: #c3ccd3;
    }
    & > li:first-child > a {
        border-left: none;
    }
    & > li > a >i{
        font-size: 18px
    }
`;
// .member-list > li{
// 	padding: 5px 0;
// }
// .member-list > li .status{
// 	margin: 0 10px 0 0;
// 	font-size: 14px;
// }
// .member-list > li .status.online{
// 	color: #82cf85;
// }
// .member-list > li .status.idle{
// 	color: #ffac69;
// }
// .member-list > li .status.offline{
// 	color: #f57e7d;
// }
// .member-list > li .time{
// 	float: right;
// 	font-size: 9px;
// 	margin-top: 4px;
// }

// TODO: Сделать нормальные рабочие вкладки и пункты меню
const RightTabs = () => (
    <TabsContainer>
        <TabsIcons>
            <li className="active">
                <a href="#"><i className="fa fa-users"></i></a>
            </li>
            <li><a href="#"><i className="fa fa-paperclip"></i></a></li>
            <li><a href="#"><i className="fa fa-link"></i></a></li>
        </TabsIcons>
        <ActiveTabContent>
            {/* Рендерим список имён участников и их статусы активности */}
            {/* <ul className="member-list">
                <li><span className="status online"><i className="fa fa-circle-o"></i></span><span>Kristi Galeeva</span></li>
                <li><span className="status online"><i className="fa fa-circle-o"></i></span><span>Segey Bondar</span></li>
                <li><span className="status idle"><i className="fa fa-circle-o"></i></span><span>Gleb Kavrasky</span><span className="time">10:45 pm</span></li>
                <li><span className="status offline"><i className="fa fa-circle-o"></i></span><span>David Barto</span></li>
            </ul> */}
            {/* Либо отрендерить тут всякие вложения из чата */}
            {/* Либо ссылки из чата */}
            {/* Всё в зависимости от того какие вкладки я реализую */}
        </ActiveTabContent>
        <SettingsSymbol className="fa fa-cog"/>
    </TabsContainer>
)
export default React.memo( RightTabs );
