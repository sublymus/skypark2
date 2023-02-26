import UidGenerator from '../uidGenerator/uidGenerator';
type EventInfo = {
    event: string;
    count: number;
    value: any;
    lastValue: any;
    uid: string;
};
type listenerSchema = ((value: any, e?: EventInfo) => void) & {
    uid?: string;
};
type constraintsShema = {
    events?: string[];
};
type T1 = {
    uid: string;
    event: string;
    listener?: listenerSchema;
    events?: string;
};
type T2 = {
    listener: listenerSchema;
    event: string;
    uid?: string;
    events?: string;
};
type T3 = {
    uid: string;
    events: string;
    listener?: listenerSchema;
    event?: string;
};
type T4 = {
    listener: listenerSchema;
    events: string;
    uid?: string;
    event?: string;
};
declare class EventEmiter extends UidGenerator {
    #private;
    private constraints?;
    private eventsManager;
    constructor(constraints?: constraintsShema);
    All(listener: listenerSchema, changeRequired?: boolean): EventEmiter;
    when(events: string, listener: listenerSchema, changeRequired?: boolean): EventEmiter;
    emit(events: string, value: any): void;
    remove(e: T1 | T2 | T3 | T4): void;
}
export default EventEmiter;
