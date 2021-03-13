import React, { Component } from "react";

export function getPointerOnValueFromLink( tree, link ) {
    let miner = tree;
    for ( const branchToSlope of link ) {
        miner = miner[ branchToSlope ];
    }
    return miner;
}

export const isValuesOnLinksEqual = links => ( prevAppStateContainer, nextAppStateContainer ) => {
    for ( const link of links ) {
        if (
            getPointerOnValueFromLink( prevAppStateContainer.appState, link ) !==
            getPointerOnValueFromLink( nextAppStateContainer.appState, link )
        ) return false;
    }
    return true;
};

export function reassembleNode( what ) {
    return Object.prototype.toString.call( what ) === '[object Array]' ? [ ...what ] : { ...what };
}

export function reassembleAllNodesInLink( treein, link ) {
    let growingLink = [];
    const treeout = reassembleNode( treein );
    for ( const currentNodeName of link ) {
        let parentNode = getPointerOnValueFromLink( treeout, growingLink );
        parentNode[ currentNodeName ] = reassembleNode( parentNode[ currentNodeName ] );
        growingLink.push( currentNodeName );
    }
    return treeout;
}

export function setValueOnLink( treein, link, value ) {
    let treeout = reassembleAllNodesInLink( treein, link.slice( 0, -1 ) );
    let parentNode = getPointerOnValueFromLink( treeout, link.slice( 0, -1 ) );
    parentNode[ link[ link.length - 1 ] ] = value;
    return treeout;
}

export const getAppStateAndActionsRenderer = Context => {
    const AppStateAndActionsRendererWithKnownContext = ( { render } ) => (
        <Context.Consumer>
            { context => console.log(render)||render( context.appState, context.stateDependentActions ) }
        </Context.Consumer>
    );
    return AppStateAndActionsRendererWithKnownContext;
};

const AppStateAndActionsDistributor = ( { render, appState, stateDependentActions } ) => render( appState, stateDependentActions );

export const getGeneratorOfAppStateAndActionsConsumersWhichRerendersOnlyWhenValuesOnLinksChanged = Context => links => {
    const AppStateAndActionsDistributorWhichRerendersOnlyWhenValuesOnLinksChanged = React.memo(
        AppStateAndActionsDistributor,
        isValuesOnLinksEqual( links )
    );
    const AppStateAndActionsConsumerWhichRerendersOnlyWhenValuesOnLinksChanged = ( { render } ) => (
        <Context.Consumer>
            { ( { appState, stateDependentActions } ) => (
                React.createElement(
                    AppStateAndActionsDistributorWhichRerendersOnlyWhenValuesOnLinksChanged,
                    { appState, stateDependentActions, render }
                )
            ) }
        </Context.Consumer>
    );
    return AppStateAndActionsConsumerWhichRerendersOnlyWhenValuesOnLinksChanged;
};


export const getGeneratorOfComponentsSubscribedForLinks = Context => ( Component, links ) => {
    const AppStateAndActionsConsumerWhichRerendersOnlyWhenValuesOnLinksChanged = getGeneratorOfAppStateAndActionsConsumersWhichRerendersOnlyWhenValuesOnLinksChanged( Context )( links );
    const ComponentSubscribedForLinks = props => (
        <AppStateAndActionsConsumerWhichRerendersOnlyWhenValuesOnLinksChanged
            render={
                ( appState, stateDependentActions ) => React.createElement( Component, {...props, appState, stateDependentActions } )
            }
        />
    );
    return ComponentSubscribedForLinks;
};

export const getAppStateAndActionsProvider = Context => (
class extends Component {
    setStateNode = ( link, value ) => this.setState( prevState => setValueOnLink( prevState, link, value ) );
    getStateNode = link => getPointerOnValueFromLink( this.state, link );
    actions = {};
    state = {};
    render() {
        return React.createElement(
            Context.Provider,
            {
                value: {
                    appState: { ...this.state },
                    stateDependentActions: this.actions,
                }
            },
            this.props.children
        );
    }
}
);

export default function createNewKit() {
    const AppContext = React.createContext( {
        appState: {},
        stateDependentActions: {}
    } );
    return {
        // Поставщик состояния от которого надо наследоваться
        AppContextProvider: getAppStateAndActionsProvider( AppContext ),
        // при каждом рендере он будет вызывать render(appState, actions) из props
        AppContextRenderer: getAppStateAndActionsRenderer( AppContext ),
        // нужно задать ( Component, links ) и он в Component передаёт props = (appState, actions). Ререндерится только когда значения по ссылке изменились
        getComponentSubscribedForLinksWhichPassesAppStateAndActionsProps: getGeneratorOfComponentsSubscribedForLinks( AppContext ),
        // нужно задать ( links ) и при каждом рендере он будет вызывать функцию render(appState, actions) из props. Ререндерится только когда значения по ссылке изменились
        getAppContextRendererSubscribedForLinks: getGeneratorOfAppStateAndActionsConsumersWhichRerendersOnlyWhenValuesOnLinksChanged( AppContext )
    };
}
