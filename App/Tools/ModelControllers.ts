import { LabelController } from './../Models/LabelModel';
import { SurveyController } from './../Models/SurveyModel';
import { UserController } from './../Models/UserModel';
import { TestController } from './../Models/TestModel';
import { SupervisorController } from './../Models/SupervisorModel';
import { QuarterController } from './../Models/QuarterModel';
import { ProfileController } from './../Models/ProfileModel';
import { PostController } from './../Models/PostModel';
import { PadiezController } from './../Models/PadiezdModel';
import { MessengerController } from './../Models/MessengerModel';
import { MessageController } from './../Models/MessageModel';
import { ManagerController } from './../Models/ManagerModel';
import { FolderController } from './../Models/FolderModel';
import { FavoritesController } from './../Models/FavoritesModel';
import { EntrepriseController } from './../Models/EntrepriseModel';
import { DiscussionController } from './../Models/DiscussionModel';
import { BuildingController } from './../Models/BuildingModel';
import { AppController } from './../Models/AppModel';
import { AdminController } from './../Models/AdminModel';
import { AddressController } from './../Models/AddressModel';
import { ActivityController } from './../Models/ActivityModel';
import { AccountController } from './../Models/AccountModel';
import { SQuery } from "../../lib/squery/SQuery";

// remplir automaiquement
export const ModelControllers = SQuery.CollectModelControllers({
   AccountController,
   ActivityController,
   AddressController,
   AdminController,
   AppController,
   BuildingController,
   DiscussionController,
   EntrepriseController,
   FavoritesController,
   FolderController,
   ManagerController,
   MessageController,
   LabelController,
   MessengerController,
   PadiezController,
   PostController,
   ProfileController,
   QuarterController,
   SupervisorController,
   TestController,
   UserController,
   SurveyController,
})


