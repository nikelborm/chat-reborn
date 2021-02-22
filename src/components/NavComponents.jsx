/* eslint-disable jsx-a11y/anchor-is-valid */
import styled from "styled-components";
const NavWrapper = styled.div`
    width: 100%;
    height: 70px;
    padding-top: 30px;
    transition: all .5s ease;
`;
const NavUl = styled.ul`
    margin: 0px auto;
    width: fit-content;
    padding: 0;
`;
export const Menu = props => (
    <NavWrapper>
        <NavUl>
            { props.children }
        </NavUl>
    </NavWrapper>
);
const NavLi = styled.li`
    padding-left: 10px;
    font-size: 18px;
    display: inline;
    text-align: left;
    text-transform: uppercase;
    padding-right: 10px;
    color: #fff;
    & a {
        ${ props => props.isActive
            ? `
                padding-bottom: 10px;
                color: #fff;
                text-decoration: none;
                border-bottom: solid 2px #1059FF;
                cursor: pointer;
                transition: all .25s ease;
            `
            : `
                padding-bottom: 0;
                color: rgba(255, 255, 255, .3);
                text-decoration: none;
                border-bottom: none;
                cursor: pointer;
                transition: all .25s ease;
            `
        }
    }
`;
export const MenuItem = ({ isActive, children, ...rest }) => (
    <NavLi isActive={ isActive }>
        <a
            { ...rest }
            // TODO: Попытаться обработать клик нормально используя Link из react-router-dom
        >
            { children }
        </a>
    </NavLi>
);
