/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
// import unnamed from '../../components/unnamed.jpg';
import bgimage from '../../components/m600x600.jpg';
import styled from "styled-components";
import { ShortAuthFrame } from "../../components/Frames";
import { withRouter } from "react-router-dom";

const ProfilePhoto = styled.div`
    height: 125px;
    width: 125px;
    position: relative;
    border-radius: 70px;
    top: -62.5px;
    margin: auto;
    transition: top 1.5s ease 0.35s, opacity .75s ease .5s;
    border: solid 3px #fff;
`;

const CoverPhoto = styled.div`
    height: 150px;
    background: linear-gradient(rgba(35, 43, 85, 0.45), rgba(35, 43, 85, 0.85)), url(${ bgimage });
    background-size: cover;
    transition: all 1.5s ease 0.55s;
`;

const WelcomeWrapper = styled.div`
    height: 100%;
    background-color: #fff;
`;

const WelcomeText = styled.h1`
    // h1
    color: #fff;
    font-size: 35px;
    font-weight: 300;
    text-align: center;

    // #welcome
    width: 100%;
    position: relative;
    color: rgba(35, 43, 85, 0.75);
    bottom: 55px;
    transition: transform 1.5s ease .25s, opacity .1s ease 1s;

`;

class Welcome extends Component {
    // componentDidMount() { // TODO: Либо доделать такую штуку с редиректом сначала на welcome а потом на чат. ИЛИ можно сделать чтобы компонент welcome показывался чисто пока загружаются все компоненты чата типа lazy load
    //     setTimeout( ()=> { this.props.history.push( "/chat" ) },5000 );
    // }
    render() {
        // TODO: Сделать чтобы подтягивалось из глобального контекста
        const { avatarStyle, fullName } = this.props;
        return (
            <ShortAuthFrame>
                <WelcomeWrapper>
                    <CoverPhoto/>
                    <ProfilePhoto style={ avatarStyle }/>
                    <WelcomeText>Welcome,<br/>{ fullName }</WelcomeText>
                </WelcomeWrapper>
            </ShortAuthFrame>
        );
    }
}

export default withRouter( Welcome );
