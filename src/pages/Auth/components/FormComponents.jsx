import styled from "styled-components";

export const Form = styled.form`
    width: 430px;
    font-size: 16px;
    font-weight: 300;
    padding: 30px 37px;
`;

const Input = styled.input`
    color: #fff;
    font-size: 13px;
    width: 100%;
    height: 35px;
    padding-left: 15px;
    border: none;
    border-radius: 20px;
    margin-bottom: 20px;
    background: rgba(255, 255, 255, .2);
    &:not([type="submit"]):focus {
        background: rgba(255, 255, 255, .3);
        border: none;
        padding-right: 40px;
        transition: background .5s ease;
    }

    &:focus {
        outline: none;
    }
`;

const InputReadyForBecomeCheckbox = styled.input`
    color: #fff;
    font-size: 13px;
    &:focus {
        outline: none;
    }

    &:not(:checked),
    &:checked {
        position: absolute;
        display: none;
    }

    &:not(:checked)+label,
    &:checked+label {
        position: relative;
        padding-left: 85px;
        padding-top: 2px;
        cursor: pointer;
        margin-top: 4px;
    }

    &:not(:checked)+label:before,
    &:checked+label:before,
    &:not(:checked)+label:after,
    &:checked+label:after {
        content: '';
        position: absolute;
    }

    &:not(:checked)+label:before,
    &:checked+label:before {
        width: 65px;
        height: 30px;
        background: rgba(255, 255, 255, .2);
        border-radius: 15px;
        left: 0;
        top: -3px;
        transition: all .2s ease;
    }

    &:not(:checked)+label:after,
    &:checked+label:after {
        width: 10px;
        height: 10px;
        background: rgba(255, 255, 255, .7);
        border-radius: 50%;
        top: 7px;
        left: 10px;
        transition: all .2s ease;
    }

    &:checked+label:before {
        background: #0F4FE6;
    }

    &:checked+label:after {
        background: #fff;
        top: 7px;
        left: 45px;
    }

    &:checked+label .ui,
    &:not(:checked)+label .ui:before,
    &:checked+label .ui:after {
        position: absolute;
        left: 6px;
        width: 65px;
        border-radius: 15px;
        font-size: 14px;
        font-weight: bold;
        line-height: 22px;
        transition: all .2s ease;
    }

    &:not(:checked)+label .ui:before {
        content: "no";
        left: 32px;
        color: rgba(255, 255, 255, .7);
    }

    &:checked+label .ui:after {
        content: "yes";
        color: #fff;
    }
    &+label .labeltext {
        display: inline-block;
        padding-top: 4px;
    }

    &:focus+label:before {
        box-sizing: border-box;
        margin-top: -1px;
    }
`;

const Label = styled.label`
    font-weight: 400;
    text-transform: uppercase;
    font-size: 13px;
    padding-left: 15px;
    padding-bottom: 10px;
    color: rgba(255, 255, 255, .7);
    display: block;
`;

export const CheckboxField = ({ children, name, ...rest }) => (
    <>
        <InputReadyForBecomeCheckbox type="checkbox" id={ name } name={ name } { ...rest }/>
        <Label htmlFor={ name }><span className="ui"></span><span className="labeltext">{ children }</span></Label>
    </>
);

export const Field = ({ children, name, ...rest }) => (
    <>
        <Label htmlFor={ name }>{ children }</Label>
        <Input id={ name } name={ name } { ...rest }/>
    </>
);

const ButtonWrapper = styled.div`
    width: 100%;
    height: 35px;
    border: none;
    border-radius: 20px;
    margin-top: 23px;
`;

const ButtonInput = styled( Input )`
    font-weight: 700;
    text-transform: uppercase;
    width: 356px;
    height: 35px;
    border: none;
    border-radius: 20px;
    background-color: rgba(16, 89, 255, 1);

    &:hover {
        cursor: pointer;
        background-color: #0F4FE6;
        transition: background-color .5s;
    }
`;

export const ConfirmButton = props => (
    <ButtonWrapper>
        <ButtonInput type="submit" value={ props.children }/>
    </ButtonWrapper>
);
