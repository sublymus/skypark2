import { ServerController } from './Start/Server';

import { Server, Socket } from 'socket.io';
import { SQuery_auth } from './SQuery_auth';
import { SQuery_cookies } from './SQuery_cookies';
import { SQuery_files } from './SQuery_files';
import { SQuery_init } from './SQuery_init';
import { SQuery_Schema } from './SQuery_schema';
import EventEmiter from './event/eventEmiter';
import { ControllerCollectionInterface, DescriptionSchema, SQueryMongooseSchema, UrlDataType } from './Initialize';
import { FlatRecord, ResolveSchemaOptions, SchemaOptions } from 'mongoose';
import { ContextSchema, DataSchema, authDataOptionSchema } from './Context';
import { ConfigInterface, defaultConfig } from './SQuery_config';
import { AutoExecuteDir } from './execAuto';
import { Controller } from './SQuery_controller';
import { Collect_Controllers } from './SQuery_CollectController';
import { ModelController } from './SQuery_ModelController';
import { CollectModelControllers } from './SQuery_CollectModelControllers';
import { ModelControllerCollectionInterface } from './Initialize';


export const SQuery ={

   Config : defaultConfig,
   IO : null as Server|null,
   Schema : SQuery_Schema,
   Auth : SQuery_auth,
   CollectControllers : Collect_Controllers,
   Controller : Controller,
   CollectModelControllers : CollectModelControllers,
   ModelController : ModelController,
   Cookies : SQuery_cookies,
   emiter : new EventEmiter(),
   Files : SQuery_files,
   FileType : {
        url: String,
        size: Number,
        extension: String,
    },
   init : SQuery_init,
    
    
}

