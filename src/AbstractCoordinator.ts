import Coordinator from "./Coordinator";

export default abstract class AbstractCoordinator implements Coordinator {
    private _state: any;

    protected get state(): any {
        return this._state;
    }

    protected set state(uiState: any) {
        this._state = uiState;
    }

    public abstract getState(): any;

    public abstract setState(state: any): void;
}