/* eslint-disable no-useless-concat */
import React, { Component } from "react";
import getCookie from "../../../tools/getCookie";
import emptyAvatar from "../styles/unnamed.jpg";

class MyAccountInfo extends Component {
    shouldComponentUpdate() {
        return false;
        // TODO: Как только добавится возможность редактировать свои данные, обновить это и изменить на PureComponent
    }
    render() {
        return (
            <div className="my-account">
                <div className="image">
                    <img src={getCookie("avatarLink") || emptyAvatar} title="Аватар выбирается случайно" alt="User"/>
                    {/* TODO: Сделать чтобы при клике на аватарку открывалось меню её изменения */}
                    <i className={"fa fa-circle " + "online"}></i>
                    {/* TODO: Сделать чтобы можно выбрать свой онлайн и он ставился после задержки: offline, online, idle */}
                </div>
                <div className="name">
                    <span id="myName" title={getCookie("nickName") || "Error"}>
                        {getCookie("fullName") || "Error"}{" "}
                    </span>
                    <i className="fa fa-angle-down"></i>
                    <span className="availability">
                        {getCookie("statusText") || "Error"}
                    </span>
                </div>
            </div>
        );
    }
}
export default MyAccountInfo;
