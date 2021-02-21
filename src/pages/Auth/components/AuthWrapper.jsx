import bgimage from "./1.jpg";
import styled from "styled-components";
const AuthWrapper = styled.div`
    width: 100vw;
    height: 100vh;
    background: linear-gradient(#000a, #000a), url(${ bgimage }) no-repeat center center fixed;
    background-size: cover;
    display: grid;
    place-items: center center;

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

export default AuthWrapper;
