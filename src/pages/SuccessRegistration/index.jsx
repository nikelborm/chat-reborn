/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import styled from "styled-components";
import { ShortAuthFrame } from "../../components/Frames";
import { withRouter } from "react-router-dom";
const CentererWrapper = styled.div`
    width: 100%;
    height: 100%;
    text-align: center;
    transition: all .8s .4s ease;
    display: grid;
    place-items: center center;
`;
const TextContainer = styled.div`
    color: #fff;
    font-size: 19px;
    font-weight: 300;
    width: 70%;
    letter-spacing: 1px;
    line-height: 31px;
`;

const SuccessRegistration = props => (
    <ShortAuthFrame>
        <CentererWrapper>
            <TextContainer>
                Благодарим за регистрацию! Перейдите по ссылке из письма, чтобы завершить создание аккаунта.
            </TextContainer>
        </CentererWrapper>
    </ShortAuthFrame>
);
export default withRouter( SuccessRegistration );
