import styled from "styled-components";
import frameBackgroundImage from "./m600x600.jpg";
export const Frame = styled.div`
    height: 465px;
    width: 430px;
    background: linear-gradient(rgba(35, 43, 85, 0.65), rgba(35, 43, 85, 0.95)), url(${ frameBackgroundImage }) no-repeat center center;
    background-size: cover;
    border-radius: 8px;
    box-shadow: 0px 2px 7px rgba(0, 0, 0, 0.2);
    transition: all .3s ease;
    border: none;
    overflow: hidden;
`;
// TODO: Возможно убрать !important
export const LongFrame = styled( Frame )`
    height: 615px !important;
`;
export const ShortFrame = styled( Frame )`
    height: 400px !important;
    box-shadow: 0px 2px 7px rgba(0, 0, 0, 0.1) !important;
`;
