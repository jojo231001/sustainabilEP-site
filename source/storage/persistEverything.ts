import { Action } from 'Actions/actions'
import { RootState } from 'Reducers/rootReducer'
import { Store } from 'redux'
import { debounce, omit } from '../utils'
import safeLocalStorage from './safeLocalStorage'

const VERSION = 1

const LOCAL_STORAGE_KEY = 'ecolab-climat::global-state:v' + VERSION

type OptionsType = {
	except?: Array<string>
}
export const persistEverything =
	(options: OptionsType = {}) =>
	(store: Store<RootState, Action>): void => {
		const listener = () => {
			const state = store.getState()
			safeLocalStorage.setItem(
				LOCAL_STORAGE_KEY,
				JSON.stringify(omit(options.except || [], state))
			)
		}
		store.subscribe(debounce(1000, listener))
	}

export function retrievePersistedState(): RootState {
	const serializedState = safeLocalStorage.getItem(LOCAL_STORAGE_KEY)
	return serializedState ? JSON.parse(serializedState) : null
}
