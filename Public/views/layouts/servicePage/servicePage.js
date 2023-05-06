import { load } from '../../p.js';
import BaseComponent, { Components } from '../../ts_lib/baseComponent/baseComponent.js';
import SQuery from '../../ts_lib/SQueryClient.js';

const inspectorIsOpen = function() {
    let isOpen = false;
    
    if ((window.outerWidth - window.innerWidth) > 100) {
        isOpen = true;
    }
    
    return isOpen;
  }
  
export class ServicePage extends BaseComponent {
    constructor(data) {
        super({
            ctrl: 'server',
            service: 'validId',
        }, data);
        const { _, $, $All, viewName } = this.mvc;
        this.view = _('div', viewName,
            _('h1', 'title', 'Service'),
            _('input@modelInput', ['type:text', 'class:model-input', 'placeholder:model path']),
            _('div', 'input-ctn',
                _("textarea@area", ["rows:100", "cols:450"])
            ),
            _('div@send', 'send', 'Send'),
        );
        this.controller = {
            ['@area:change']: (area) => {
                console.log('ATRAYTUYIAOP{A',area.value);
                localStorage.setItem('servicePage:textArea', area.value);

                console.log('Valuejhgach_____{A',area.value);
            },
            ['@modelInput:change']: (input) => {
                try {
                    if (input.value.includes('.')) {
                        const parts = input.value.split('.');
                        this.ctrl = parts[0];
                        this.service = parts[1];
                        //console.log('input.value : ', input.value, parts);
                    } else {
                        this.ctrl = input.value;
                        //console.log('input.value : ', input.value);
                    }
                    const data =  load[this.ctrl]?.[this.service];
                    localStorage.setItem('servicePage:input', input.value)
                    localStorage.setItem('servicePage:textArea', $("textarea").value)
                    if(data){
                        $("textarea").value = localStorage.getItem('servicePage:textArea') || JSON.stringify(data)
                        .split("")
                        .map((c) => {
                            return c == "}" ? "\n}" : c == "{" ? "{\n" : c == "," ? ",\n" : c;
                        }).join("");
                    }
                } catch (error) {
                    alert('Not found : ' + input.value)
                }
            },
            ['@send:click']: async () => {
                console.log('wertyuioiuytrertyui');
                try {
                    console.log(this.ctrl+":"+this.service);
                    SQuery.emit(this.ctrl+":"+this.service,JSON.parse($('textarea').value),(res)=>{
                       
                        console.log(res)
                        if(!inspectorIsOpen()) alert('Open Your Inspector to see the result')
                        $('.title').textContent = window.outerWidth +"<-outer   inner->"+ window.innerWidth+" = "+inspectorIsOpen()
                    })
                } catch (error) {
                    alert('ERROR_SEND')
                }
            },
            [viewName]: () => {
                window.onresize = inspectorIsOpen;
                $("textarea").value =  localStorage.getItem('servicePage:textArea');
                $("input").value = localStorage.getItem('servicePage:input');
                this.emit('@modelInput:change', $('.model-input'))
                
                this.when('error', (error) => {
                    alert(error);
                });

            }
        }
    }
}
Components.ServicePage = ServicePage;
