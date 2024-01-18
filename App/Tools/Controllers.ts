import { SQuery } from "../../lib/squery/SQuery";
import {AppController} from "../Controllers/App";
import {ClientController} from "../Controllers/Client";
import {MessengerController} from "../Controllers/Messenger";
import {PostController} from "../Controllers/Post";
import {TrouveController} from "../Controllers/Trouve";

 export const Controllers = SQuery.CollectControllers({
    AppController,
    ClientController,
    MessengerController,
    PostController,
    TrouveController
});


