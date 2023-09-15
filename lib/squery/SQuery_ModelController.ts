import mongoose from "mongoose"
import { ContextSchema } from "./Context"
import { DescriptionSchema, EventPostSchema, EventPreSchema, ListenerPostSchema, ListenerPreSchema, ModelControllerInterface, ModelOptionInterface, ModelServiceAllowed, MoreSchema, ResponseSchema, ResultSchema, SQueryMongooseSchema, superD } from "./Initialize"
import Log from "sublymus_logger"
import { createFactory } from "./Model_Create"
import { readFactory } from "./Model_read"
import { updateFactory } from "./Model_update"
import { listFactory } from "./Model_list"
import { deleteFactory } from "./Model_delete"

class ModelServices< S extends any ,N extends string = string , D extends extractD<S>= extractD<S>>{
  
  

    create(ctx:ContextSchema,more?:MoreSchema){
       return createFactory(this.controller, this.callPost, this.callPre)(ctx ,more)
    }
    
    read(ctx:ContextSchema,more?:MoreSchema){
       return readFactory(this.controller, this.callPost, this.callPre)(ctx ,more)
    }
    
    update(ctx:ContextSchema,more?:MoreSchema){
       return updateFactory(this.controller,  this.callPost, this.callPre)(ctx ,more)
    }
 
    list(ctx:ContextSchema,more?:MoreSchema){
       return listFactory(this.controller,  this.callPost, this.callPre)(ctx ,more)
    }
 
    delete(ctx:ContextSchema,more?:MoreSchema){
       return deleteFactory(this.controller, this.callPost, this.callPre)(ctx ,more)
    }
 
    constructor(private controller :ModelController<any, any,any> ,  private callPost: (e: EventPostSchema) => ResponseSchema  , private callPre:(e: EventPreSchema) => Promise<void | ResultSchema> ){
 
    }
 }
 
 type extractD<T> = T extends SQueryMongooseSchema<infer U>  ? U :DescriptionSchema
 export class ModelController< S extends any = any,N extends string = string , D extends extractD<S> = extractD<S>> implements ModelControllerInterface<any, N, any,D >{
 
    name = '' as N;
    volatile = true;
    schema: SQueryMongooseSchema<D>;
    servicesDescription = {
      create:{
         data:{} as {[key:string]:any},
         result:{}
      },
      read:{
         data:{} as {[key:string]:any},
         result:{}
      },
      list:{
         data:{} as {[key:string]:any},
         result:{}
      },
      update:{
         data:{} as {[key:string]:any},
         result:{}
      },
      delete:{
         data:{} as {[key:string]:any},
         result:{}
      }
    };
   
    services : ModelServices<S,N> ; 
    model = {} as mongoose.Model<superD<D>> & {schema: {description:D}}&{[k:string]:any}
    constructor(private option:ModelOptionInterface<S,N>){
       this.schema = option.schema as any as SQueryMongooseSchema<D>;
       this.name = this.option.name as N;
       this.volatile = this.option.volatile??true;
       this.model = mongoose.model(this.name,this.option.schema as mongoose.Schema) as any as mongoose.Model<superD<D>> & {schema: {description:D}}
       //this.schemaDescrition = this.model.schema.description;
       this.services = new ModelServices(this,this.#callPost,this.#callPre);
    }

    #EventManager: {
       [p: string]: {
         pre: ListenerPreSchema[];
         post: ListenerPostSchema[];
       };
     } = {};
 
     #callPre: (e: EventPreSchema) => Promise<void | ResultSchema> = async (
       e: EventPreSchema
     ) => {
       if (!this.#EventManager[e.ctx.service]?.pre) return;
 
       for (const listener of this.#EventManager[e.ctx.service].pre) {
         try {
           const res = await listener(e);
           if (res) return res;
         } catch (error) {
           Log("ERROR_callPre", error);
         }
       }
     };
     #callPost: (e: EventPostSchema) => ResponseSchema = async (
       e: EventPostSchema
     ) => {
       try {
         if (!this.#EventManager[e.ctx.service]?.post) return e.res;
         for (const listener of this.#EventManager[e.ctx.service].post) {
           if (listener) {
             const r = await listener(e);
             Log('res__', r);
 
             if (r) return r;
           }
         }
         Log('res__', e.res);
         return e.res;
       } catch (error) {
         Log("ERROR_callPost", error);
       }
       Log('res__', e.res);
       return e.res;
     };
 
 
    pre(service: ModelServiceAllowed,listener: ListenerPreSchema){
       if (!this.#EventManager[service]) {
          this.#EventManager[service] = {
           pre: [],
           post: [],
         };
       }
       this.#EventManager[service].pre.push(listener);
       return this;
    }
     post (service: ModelServiceAllowed,listener: ListenerPostSchema) {
       if (!this.#EventManager[service]) {
          this.#EventManager[service] = {
           pre: [],
           post: [],
         };
       }
       this.#EventManager[service].post.push(listener);
       return this;
     };
    
 }
 
 