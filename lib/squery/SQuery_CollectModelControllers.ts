import { ModelControllerCollectionInterface, SELECT } from "./Initialize";

export  function CollectModelControllers<T extends ModelControllerCollectionInterface>(controllers : T){
    const _controllers: any = {};
  
    for (const c in controllers) {
       if (Object.prototype.hasOwnProperty.call(controllers, c)) {
           const contoller = controllers[c];
           contoller.name
           //@ts-ignore
           _controllers[contoller.name] = contoller;
       }
    }
    type C= T
    type A ={
       [key in keyof C]: C[key]['name']&string
    };
    type D = A[keyof A];
    type ModelControllerType ={ 
       [n in D]: C[SELECT<A,n>];
    } & {    [p:string]: any}
   return _controllers  as  ModelControllerType
}