import React, { Component } from "react";
import createNewKit, { getPointerOnValueFromLink } from "./StateManagementLibrary";

const {
    AppContextProvider,
    AppContextRenderer,
    getComponentSubscribedForLinksWhichPassesAppStateAndActionsProps,
    getAppContextRendererSubscribedForLinks
} = createNewKit();

const regStatusLink = [ "isRegAllowed" ];


const RegistrationAvailabilityDependentUnsubscribedComponent = ({ appState }) => (
    <div>
        Registration status: {
            getPointerOnValueFromLink( appState, regStatusLink ) /* isRegAllowed */
                ? "Available"
                : "Not available"
        }
    </div>
);
class RegistrationAvailabilityDependentUnsubscribedClassComponent extends Component {
    somethingElseFunctionality;
    render() {
        return (
            <div>
                Registration status: {
                    getPointerOnValueFromLink( this.props.appState, regStatusLink ) /* isRegAllowed */
                        ? "Available"
                        : "Not available"
                }
            </div>
        );
    }
}
const RegistrationAvailabilityDependentComponent1 = getComponentSubscribedForLinksWhichPassesAppStateAndActionsProps(
    RegistrationAvailabilityDependentUnsubscribedComponent,
    [ regStatusLink ]
);

const RegistrationAvailabilityDependentComponent2 = getComponentSubscribedForLinksWhichPassesAppStateAndActionsProps(
    RegistrationAvailabilityDependentUnsubscribedClassComponent,
    [ regStatusLink ]
);


const RendererSubscribedForLinks = getAppContextRendererSubscribedForLinks( [ regStatusLink ] );
const RegistrationAvailabilityDependentComponent3 = () => (
    <RendererSubscribedForLinks render={
        appState /* { ( { isRegAllowed } ) */ => <div>
            Registration status: {
                getPointerOnValueFromLink( appState, regStatusLink ) /* isRegAllowed */
                    ? "Available"
                    : "Not available"
            }
        </div>
    } />
);


const RegistrationAvailabilityDependentComponent4 = () => (
    <RendererSubscribedForLinks render={
        appState => RegistrationAvailabilityDependentUnsubscribedComponent( { appState } )
    } />
);

const RegistrationAvailabilityDependentComponent5 = () => (
    <RendererSubscribedForLinks render={
        appState => React.createElement(
            RegistrationAvailabilityDependentUnsubscribedComponent,
            { appState }
        )
    } />
);
const RegistrationAvailabilityDependentComponent6 = () => (
    <RendererSubscribedForLinks render={
        appState => <RegistrationAvailabilityDependentUnsubscribedComponent appState={ appState }/>
    } />
);

const RegistrationAvailabilityDependentComponent7 = () => (
    <RendererSubscribedForLinks render={
        appState => React.createElement(
            RegistrationAvailabilityDependentUnsubscribedClassComponent,
            { appState }
        )
    } />
);



class GlobalAppStateAndActionsProvider extends AppContextProvider {
    state = {
        isRegAllowed: false
    }
    actions = {
        revertRegStatus: () => this.setState( prevState => ({
            isRegAllowed: !prevState.isRegAllowed
        }) )
    }
    updaterq = () => {
        this.setState( () => ({
            isRegAllowed: true
        }) );
    };
    componentDidMount() {
        setInterval( this.updaterq, 5000 );
    }
}
function App() {
    return (
        <div>
            <GlobalAppStateAndActionsProvider>
                <RegistrationAvailabilityDependentComponent1/>
                <RegistrationAvailabilityDependentComponent2/>
                asdasd
            </GlobalAppStateAndActionsProvider>
        </div>
    );
}

export default App;
