import EventEmiter from "../event/eventEmiter";
type ModelSchema = {
    [key: string]: any;
};
interface BaseElement extends HTMLElement {
    component: BaseComponent;
}
type FunctionSelecteCtrl = (first: BaseElement | null, second?: NodeListOf<BaseElement> | boolean | null, value?: ElementDataSchema) => void;
type ControllerSchema = {
    [key: string]: FunctionSelecteCtrl;
};
type MVCSchema = {
    _: ((TagName: string, attributes: string[] | string | {
        [p: string]: any;
    }, ...childrens: any[]) => BaseElement);
    viewName: string;
    $: (first: string | BaseElement, second?: string) => BaseElement | null;
    $All: (first: string | BaseElement, second?: string) => NodeListOf<BaseElement> | null;
};
type ElementDataSchema = {
    element: BaseElement;
    value: string;
    groupe: string;
    event: string;
    action: string;
    isSelected: boolean;
    tagName: string;
};
declare const Components: ComponentsSchema;
type ComponentsSchema = {
    [p: string]: {
        new (data?: ModelSchema): BaseComponent;
    };
};
declare class BaseComponent extends EventEmiter {
    #private;
    mvc: MVCSchema;
    private _view;
    get view(): BaseElement;
    set view(view: BaseElement);
    protected controller: ControllerSchema;
    private groupes;
    constructor(model: ModelSchema, data?: ModelSchema);
    getName(): string;
}
export { BaseComponent as default, Components };
