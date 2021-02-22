import styled from "styled-components";
import frameBackgroundImage from "./m600x600.jpg";
export const AuthFrame = styled.div`
    width: 430px;
    background: linear-gradient(rgba(35, 43, 85, 0.65), rgba(35, 43, 85, 0.95)), url(${ frameBackgroundImage }) no-repeat center center;
    background-size: cover;
    border-radius: 8px;
    transition: all .3s ease;
    border: none;
    overflow: hidden;
    height: 465px;
    box-shadow: 0px 2px 7px rgba(0, 0, 0, 0.2);

    & * {
        box-sizing: border-box;
    }
    & .tippy-tooltip.error-theme {
        background-color: rgb(255, 78, 78);
        color: whitesmoke;
        user-select: none;
    }
    & .tippy-tooltip.error-theme[data-placement^='bottom'] .tippy-arrow {
        border-bottom-color: rgb(255, 78, 78);
    }
`;
// TODO: Возможно убрать !important
export const LongAuthFrame = styled( AuthFrame )`
    height: 615px;
`;
export const ShortAuthFrame = styled( AuthFrame )`
    height: 400px;
    box-shadow: 0px 2px 7px rgba(0, 0, 0, 0.1);
`;
