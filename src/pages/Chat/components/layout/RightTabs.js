/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from "react";
import TabsContainer from "./TabsContainer";
// TODO: Сделать нормальные рабочие вкладки и пункты меню
class RightTabs extends Component {
    shouldComponentUpdate() {
        return false;
    }
    render() {
        return (
            <div className="right-tabs">
                <ul className="tabs">
                    <li className="active">
                        <a href="#"><i className="fa fa-users"></i></a>
                    </li>
                    <li><a href="#"><i className="fa fa-paperclip"></i></a></li>
                    <li><a href="#"><i className="fa fa-link"></i></a></li>
                </ul>
                <TabsContainer />
                <i className="fa fa-cog"></i>
            </div>
        );
    }
}
export default RightTabs;
