import { ServerController } from './Start/Server';
import { ControllerCollectionInterface, SELECT } from "./Initialize";

export  function Collect_Controllers<T extends ControllerCollectionInterface>(controllers : T){
    const _controllers: ControllerCollectionInterface = {};
    const blend = { ...{ServerController},...controllers} satisfies {
     [p:string]:any
    };
    for (const c in blend) {
       if (Object.prototype.hasOwnProperty.call(blend, c)) {
           const contoller = blend[c];
           _controllers[contoller.name] = contoller;
       }
    }
    type C= typeof blend
    type A ={
       [key in keyof C]: C[key]['name']
    };
    type D = A[keyof A];
    type ControllersCollection ={
       [n in D]: C[SELECT<A,n>];
    }
   return _controllers  as  ControllersCollection;
  }