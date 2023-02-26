import BaseComponent, { Components } from "../../ts_lib/baseComponent/baseComponent.js";

export default class ItemList extends BaseComponent {

    constructor(data) {
        super({
            itemsData: [],
            class: '',
            columns: ['id', 'name', 'age'],
            childrens: [],
            items:[]
        }, data)

        const { _, viewName, $, $All } = this.mvc;

        this.view = _('div', viewName,
            _('div','title-bar'),
            _('div','items-container')
        );
        this.controller = {
            
            ['@item:mouseover']: (itemElem, isSelected) => {
               itemElem.component.emit('mouseover',isSelected)
            },
            ['@item:mouseout']: (itemElem, isSelected) => {
                itemElem.component.emit('mouseout',isSelected) 
            },
            ['@item:click']:  (itemElem, isSelected) => {
                itemElem.component.emit('click',isSelected) 
                if(isSelected){
                    this.emit('selected',itemElem.component)
                    console.log('selected',itemElem);
                }
            },
            [viewName]: () => {
                this.when('itemsData', itemsData => {
                    itemsData.forEach(itemData => {
                        const itemElem = _(this.class+'@item',itemData)
                       $('.items-container').append(itemElem);
                    });
                })
                this.when('columns', columns => {
                    columns.forEach(column => {
                        $('.title-bar').append(
                            _('span',column+' title',column)
                        )
                    });
                })
            }
        }
    }
}
Components.ItemList = ItemList;
