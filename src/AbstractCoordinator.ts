import Coordinator from "./Coordinator";

export default abstract class AbstractCoordinator implements Coordinator {
    private _uiState: any;

    protected get uiState(): any {
        return this._uiState;
    }

    protected set uiState(uiState: any) {
        this._uiState = uiState;
    }

    public abstract getUiState(): any;

    public abstract setUiState(uiState: any): void;
}