import React, { Component } from "react";
class TabsContainer extends Component {
    render() {
        // TODO: добавить нормальную работу с вкладками
        return (
            <ul className="tabs-container">
                <li className="active">
                    {/* <ul className="member-list">
                        <li><span className="status online"><i className="fa fa-circle-o"></i></span><span>Kristi Galeeva</span></li>
                        <li><span className="status online"><i className="fa fa-circle-o"></i></span><span>Segey Bondar</span></li>
                        <li><span className="status idle"><i className="fa fa-circle-o"></i></span><span>Gleb Kavrasky</span><span className="time">10:45 pm</span></li>
                        <li><span className="status offline"><i className="fa fa-circle-o"></i></span><span>David Barto</span></li>
                    </ul> */}
                </li>
                <li></li>
                <li></li>
            </ul>
        );
    }
}
export default TabsContainer;
