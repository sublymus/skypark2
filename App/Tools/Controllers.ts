import { SQuery } from "../../lib/squery/SQuery";
import {AppController} from "../Controllers/App";
import {ClientController} from "../Controllers/Client";
import {MessengerController} from "../Controllers/Messenger";
import {PostController} from "../Controllers/Post";


 export const Controllers = SQuery.CollectControllers({
    AppController,
    ClientController,
    MessengerController,
    PostController
});

Controllers.server.services.collector

