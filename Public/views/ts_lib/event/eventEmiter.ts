import UidGenerator from '../uidGenerator/uidGenerator';

type EventInfo = {
    event: string,
    count: number,
    value: any,
    lastValue: any,
    uid: string
}

type listenerSchema = ((value: any, e?: EventInfo) => void) & { uid?: string };

type constraintsShema = {
    events?: string[],
}
type wrapperSchema = {
    listener: listenerSchema,
    count: number,
    lastCall: Date
}
type wrapperCollectionSchema = {
    [key: string]: wrapperSchema,
};
type eventDataSchema = {
    wrapperCollection: wrapperCollectionSchema,
    lastValue: any,
}
type ManagerSchema = {
    [key: string]: eventDataSchema
}

type T1 = {
    uid: string,
    event: string,
    listener?: listenerSchema,
    events?: string,
}

type T2 = {
    listener: listenerSchema,
    event: string,
    uid?: string,
    events?: string,
}
type T3 = {
    uid: string,
    events: string,
    listener?: listenerSchema,
    event?: string,
}

type T4 = {
    listener: listenerSchema,
    events: string,
    uid?: string,
    event?: string,
}


class EventEmiter extends UidGenerator {

    private eventsManager: ManagerSchema = {};

    constructor(private constraints?: constraintsShema) {
        super();
    }

    #avalaible(event: string): boolean {

        if (this.constraints?.events) {
            if (this.constraints?.events.indexOf(event) == -1) {
                throw new Error(`event : <<${event}>>  is not supported`);
            } else {
                return true;
            }
        }
        return true;
    }

    All(listener: listenerSchema, changeRequired?: boolean): EventEmiter {
        return this.when('__all__', listener, changeRequired);
    }

    when(events: string, listener: listenerSchema, changeRequired?: boolean): EventEmiter {

        let uid = this.validatedUid(listener?.uid) ? listener.uid + '' : listener.uid = (changeRequired ? '#' : '') + this.generateUid();

        events.trim().split(' ').forEach(event => {
            if (event == '') return;

            this.#avalaible(event);

            let eventData = this.eventsManager[event];

            eventData = eventData ? eventData : this.eventsManager[event] = { // first listen
                wrapperCollection: {},
                lastValue: undefined,
            };
            const wrapper: wrapperSchema = {
                listener,
                count: 0,
                lastCall: new Date()
            }
            eventData.wrapperCollection[uid] = wrapper;
        });
        return this;
    }

    emit(events: string, value: any): void {
        events.trim().split(' ').forEach(event => {
            if (event == '') return;
            this.#avalaible(event);
            this.#emitEvent(event, value);
            this.#emitEvent('__all__', value, event);
        });
    }

    #emitEvent(event: string, value: any, originalEvent?:string) {
        let eventData = this.eventsManager[event];
        if (eventData == undefined) return;         // this event is not yet listened
        if (value === undefined) {
            value = eventData.lastValue;
        }
        const changed = eventData.lastValue !== value;
        const wrapperCollection = eventData.wrapperCollection;     // event listener recovery
        for (const uid in wrapperCollection) {

            if ((uid.charAt(0) == '#') && !changed) continue;
            
            eventData.lastValue = value;
            new Promise(resolve => {
                resolve(wrapperCollection[uid].listener(value, {
                    event:originalEvent||event,
                    count: wrapperCollection[uid].count,
                    value,
                    lastValue: eventData.lastValue,
                    uid
                }));
                wrapperCollection[uid].lastCall = new Date();
                wrapperCollection[uid].count = wrapperCollection[uid].count + 1;
            });
        }
        
    }

    remove(e: T1 | T2 | T3 | T4) {
        const uid = e.uid || e.listener?.uid;

        const events = e.event || e.events || '';

        if (events == '') {
            throw new Error(`Impossible d\'identifier un event dans '' `)
        }
        events.split(' ').forEach((event) => {
            //this.#avalaible(e.event);
            const eventData = this.eventsManager[event];
            if (eventData == undefined) return;        // this event is not yet listened to
            const wrapperCollection = eventData.wrapperCollection;
            const wrapper = wrapperCollection[uid as string];
            if (wrapper == undefined) return;
            delete wrapperCollection[uid as string];
        });
    }
}
export default EventEmiter;







