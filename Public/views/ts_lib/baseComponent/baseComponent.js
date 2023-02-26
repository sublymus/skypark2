import EventEmiter from "../event/eventEmiter.js";
const BASE_LINK = "../views";
const Components = {};
class BaseComponent extends EventEmiter {
    mvc;
    _view;
    get view() {
        return this._view;
    }
    set view(view) {
        view.component = this;
        this._view = view;
    }
    controller;
    groupes = {};
    constructor(model, data) {
        super();
        this.mvc = {
            _: this.#create,
            viewName: this.getName(),
            $: this.#selector,
            $All: this.#selectorAll,
        };
        const { _, viewName, $, $All } = this.mvc;
        this._view = _("div", viewName, _('h1', 'title', 'By Sublymus'));
        this.controller = {
            ['title']: (title) => {
                title?.addEventListener('click', () => {
                    title.textContent = '';
                    setTimeout(() => {
                        title.textContent = 'By Sublymus';
                    }, 100);
                });
            }
        };
        for (const key in model) {
            if (Object.hasOwnProperty.call(model, key)) {
                //
                Object.defineProperties(this, {
                    [key]: {
                        get: function () {
                            return model[key];
                        },
                        set: function (value) {
                            model[key] = value;
                            this.emit(key, value);
                        },
                    },
                });
            }
        }
        if (data) {
            for (const key in model) {
                if (Object.hasOwnProperty.call(data, key)) {
                    if (data[key] != undefined) {
                        this[key] = data[key];
                    }
                }
            }
        }
        ///////////// call all actions  when Component charged/////////////////////////
        function isMounted(node) {
            if (node === document.body)
                return true;
            if (node.parentNode == undefined)
                return false;
            return isMounted(node.parentNode);
        }
        new Promise((resolve, reject) => {
            const id = setInterval(() => {
                if (isMounted(this.view)) {
                    resolve(this.view);
                    clearInterval(id);
                }
            });
        }).then(() => {
            (this.view && { component: this }).component = this;
            this.#callControllers(model, this.controller);
        });
    }
    #callControllers(model, controller) {
        for (const selector in controller) {
            if (Object.hasOwnProperty.call(controller, selector)) {
                if (!(selector.startsWith('@') && selector.includes(':'))) {
                    controller[selector](this.#selector(selector), this.#selectorAll(selector));
                    continue;
                }
                ////// on gere le groupe
                const parts = selector.replace('@', '').split(':');
                const groupe = parts[0];
                const action = parts[1];
                this.when(selector, (data) => {
          if (data instanceof HTMLElement) data = { element: data, events: {} };
                    if (!(data?.element instanceof HTMLElement))
                        throw new Error('type :"' + typeof data?.element + '" selected element is not assignable to HTMLElement');
                    this.groupes[groupe].forEach(elemenDdata => {
                        const isSelected = elemenDdata.element == data.element;
                        const element = elemenDdata.element;
                        const e = {
                            ...elemenDdata,
                            action,
                            eventName: selector,
                            event: data.event,
                            isSelected,
                        };
                        controller[selector](element, isSelected, e);
                    });
                });
            }
        }
        //////////////  emite all model property ///////////////////
        for (const key in model) {
            if (Object.hasOwnProperty.call(model, key)) {
                this.emit(key, model[key]);
            }
        }
    }
    #selector = (first, second) => {
        let elem = null;
        if (typeof first == 'string') {
            elem = this.view.querySelector(first);
        }
        else {
            elem = second ? first.querySelector(second) : null;
        }
        return elem;
    };
    #selectorAll = (first, second) => {
        let elem = null;
        if (typeof first == 'string') {
            elem = this.view.querySelectorAll(first);
        }
        else {
            elem = second ? first.querySelectorAll(second) : null;
        }
        return elem;
    };
    #create = (tag, attributes, ...childrens) => {
        let tagName = '';
        let groupe = '';
        let value = '';
        if (tag.includes('@')) {
            const parts = tag.split('@');
            tagName = parts[0];
            groupe = parts[1];
            if (groupe.includes('=')) {
                const part2 = groupe.split('=');
                groupe = part2[0];
                value = part2[1];
            }
        }
        else {
            tagName = tag;
        }
        let component;
        if (Components[tagName]) {
            component = new Components[tagName]({ ...attributes, childrens });
        }
        let elem;
        if (!component) {
            elem = (document.createElement(tagName));
            if (attributes instanceof Array) {
                attributes.forEach((attribute) => {
                    let [attr, value] = attribute.split(":");
                    if (attr == "")
                        return;
                    value = value ? value : attr;
                    elem.setAttribute(attr, value);
                });
            }
            else if (attributes) {
                elem.className = attributes;
            }
            elem.append(...childrens);
        }
        else {
            const comp = component;
            elem = comp.view;
            comp.view.append(...childrens);
        }
        if (groupe) {
            if (!this.groupes[groupe]) {
                this.groupes[groupe] = [];
            }
            this.groupes[groupe].push({
                element: elem,
                value,
                groupe,
                event: '',
                action: '',
                isSelected: false,
                tagName
            });
            const events = [
                'click', 'mouseover', 'mouseout', 'mousedown', 'mouseup', 'mousemove',
                'keydown', 'keyup',
                'focus', 'submit', 'blur', 'change',
                'load', 'unload', 'resize' //window
            ];
            events.forEach(event => {
                elem.addEventListener(event, (e) => {
                    this.emit('@' + groupe + ':' + event, { element: elem, event: e });
                });
            });
        }
        return elem;
    };
    getName() {
        let name = this.constructor.name;
        return name
            .split("")
            .map((l, i) => {
            const lower = l.toLocaleLowerCase();
            return lower > l && i != 0 ? "-" + lower : lower;
        })
            .join("");
        ;
    }
}
export { BaseComponent as default, Components };
//# sourceMappingURL=baseComponent.js.map