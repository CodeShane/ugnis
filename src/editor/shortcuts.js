import { state, listen, setState } from 'lape'

// undo/redo
let stateStack = []
// implement state stack for every component separately
let stateStackHistory = {}

listen((state, oldState) => {
    const sameComponent = oldState.currentDefinitionId === state.currentDefinitionId
    const definitionChanged = oldState.definitionList[state.currentDefinitionId] !== state.definitionList[state.currentDefinitionId]
    const timeTravelling = stateStack.includes(state.definitionList[state.currentDefinitionId]) // not a new definition
    // changed which component is selected, switch current stateStack to the new components stack or if first time, create new
    if (!sameComponent) {
        if (stateStackHistory[state.currentDefinitionId]) {
            stateStack = stateStackHistory[state.currentDefinitionId]
        } else {
            stateStack = [state.definitionList[state.currentDefinitionId]]
            stateStackHistory[state.currentDefinitionId] = [state.definitionList[state.currentDefinitionId]]
        }
    }
    // add to state stack
    if (sameComponent && definitionChanged && !timeTravelling) {
        // add the new definition as the last definition
        const currentIndex = stateStack.findIndex(a => a === oldState.definitionList[state.currentDefinitionId])
        stateStack = stateStack.slice(0, currentIndex + 1).concat(state.definitionList[state.currentDefinitionId])
        stateStackHistory[state.currentDefinitionId] = stateStack
    }
})

document.addEventListener('keydown', e => {
    // 90 - z
    if (!e.shiftKey && e.which === 90 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
        e.preventDefault()
        const currentIndex = stateStack.findIndex(a => a === state.definitionList[state.currentDefinitionId])
        if (currentIndex > 0) {
            const newDefinition = stateStack[currentIndex - 1]
            setState({
                ...state,
                definitionList: {
                    ...state.definitionList,
                    [state.currentDefinitionId]: newDefinition,
                },
            })
        }
    }
    // 89 - y
    if (
        (e.which === 89 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) ||
        (e.shiftKey && e.which === 90 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey))
    ) {
        e.preventDefault()
        const currentIndex = stateStack.findIndex(a => a === state.definitionList[state.currentDefinitionId])
        if (currentIndex < stateStack.length - 1) {
            const newDefinition = stateStack[currentIndex + 1]
            setState({
                ...state,
                definitionList: {
                    ...state.definitionList,
                    [state.currentDefinitionId]: newDefinition,
                },
            })
        }
    }
    // 32 - space
    if (e.which === 32 && e.ctrlKey) {
        setState({ ...state, appIsFrozen: !state.appIsFrozen })
    }
    // 13 - enter
    if (e.which === 13) {
        setState({ ...state, editingTitleNodeId: '' })
    }
    // 27 - escape
    if (e.which === 27) {
        setState({ ...state, fullScreen: false })
    }
})
