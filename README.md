# SQuery_server

SQuery est un outils qui gere les access au model de [mongoDB](https://www.mongodb.com/docs/). SQuery est specialement concu pour l'environement NodeJS

##Prerequies

> 👍 [mongoose : https://www.mongodb.com/docs/](https://www.mongodb.com/docs/)
> 👍 [socket.io : https://socket.io/fr/docs/v4/how-it-works/](https://socket.io/fr/docs/v4/how-it-works/)


## Installation
```bash
npm install squery
```
SQuery 1.0.4 est la version stable. 

## Importation
```javascript v
// Using Node.js `require()`
const SQuery = require('squery');

// Using ES6 imports
import SQuery from 'squery';
```
## Initialisation

Pour initialiser SQuery vous avez juste besoin d'un httpServer, de ce fait SQuery ne depend pas de expressJS vous pouvez utiliser les outils de votre choix.

`/server.ts`
```javascript a
import express from "express";
import { SQuery } from "squery";

const app = express();
// on recupere le httpServer
const httpServer = app.listen(3000, () => {});
// initialiser SQuery avec le httpServer.
const io = SQuery.io(httpServer);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Public/index.html"));
});
```

## Cree un model
les models dans SQuery sont les meme que dans mongoose.
`App/Model/MyModel.ts`
```javascript
import mongoose, { Schema } from "mongoose";
import { ContextSchema } from "squery/Context";
import { MakeModelCtlForm } from "squery/Inisialize";
import { SQuery } from "squery";

let mySchema = SQuery.Schema({
  //property description
  name: {
    type: String,
  },
  email: {
    type: String,
    trim: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g,
    unique: true,
    required: true,
  },
});
const MyModel = mongoose.model("mymodel", mySchema);
//... c'est simple 
```
```javascript
//...  ajouter a la suit du fichier
const maker = MakeModelCtlForm({
  schema: mySchema,
  model: MyModel,
  volatile: true,//le client peut cree et suprimer des instances du model
})
export default AccountModel;
```
MakeModelCtlForm est une function SQuery qui vous permet d'enregistrer vos controller de model.
## Teste model
le code suivant uitlise [SQueryClient.js]()
`/Public/index.js`
```html
 <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
 <script type='module'>
  import SQuery from "js/squeryClient/SQueryClient.js";

  const main = async ()=>{
    const model = await SQuery.model('mymodel');
    const instance = await this.model.create({
      name:'toto',
      email:'toto@gmail.com'
    })
    const name = await instance['name'];
    console.log({name})
  };

  main();
 </script>
```
si on met la proprieter `volatile:false`, le client ne poura pas cree d'instance de MyModel;

> c'est tous ce dons vous avez besoin pour cree un instance de votre model.



## Create Controllers
Dans SQuery il y a les Controllers et les ModelControllers   
 **Controllers** contient les controleurs que nous avons coder. En effet on peut coder nos propre controllers avec des services personnaliser.
> La function **CtrlManager** permert d'y ajouter des controllers.
```javascript
import { ContextSchema } from "squery/Context";
import { CtrlManager } from "squery/CtrlManager";
import { ControllerSchema, Controllers, ModelControllers, ModelInstanceSchema, ResponseSchema } from "squery/Initialize";
import {SQuery } from "squery";

const client: ControllerSchema = {
    currentUser: async (ctx: ContextSchema): ResponseSchema => {
        const token = await SQuery.cookies(ctx.socket, 'token');
        return {
            response: {
                signup: {
                    modelPath: token.__signupModelPath,
                    id: token.__signupId
                }
            },
            status: 200,
            code: "OPERATION_SUCCESS",
            message: 'ok ✅',
        }
    }
}

const maker = CtrlManager({
    ctrl: { client },
});
```
Pour savoir comment faire appele a un service depuis l'application client je vous invite a consulter ce lien: [SQueryClient Doc]()
## Pre / Post
le listener passer a `maker.pre` est appeler avant le service, avec le context `ctx` et un object  `more` 
`/App/Models/MyModel.ts`
```javascript
//...
const maker = MakeModelCtlForm({ /*...*/ });
        //service    listerner
maker.pre("create", async ({ ctx , more })=>{
 more.startTime = Date.now();  // ajouter une propierter
 more.afterCreate = (time)=> console.log('time = ',diff); // un callBack
 ctx.data.name = ctx.data.name.toUpperCase();//modeifier le data du client
});

maker.post("create", async ({ ctx ,res , more })=>{
  const endTime = Date.now();
  more.afterCreate(endTime - more.startTime);
  console.log(res); // reagir en fonctiont du res "result" avant l'envoit au client 
});
```

## Utiliser ModelControllers

La fonction **MakeModelCtlForm** permet d'ajouter un controller avec le meme nom que le model qu'il va gere, dans `ModelControllers`.
 `ModelControllers` contient l'ensemble des controllers de model que vous avez cree.
Utiliser ces differents services pour piloter votre base de donner.
```javascript
 await ModelControllers [ctrlName] () [service] (ctx);
```
```javascript
/*ctx.data = { name: toto, email:toto@gmail.com } */
const res = await ModelControllers['mymodel']()['create'](ctx);
console.log(res.response); // 49ea4eaceceba9a8675df134f // mongoose ObjectID

/*ctx.data = { id: 49ea4eaceceba9a8675df134f }*/
const res = await ModelControllers['mymodel']()['read'](ctx);
console.log(res.response); // { name: 'TOTO', email:'toto@gmail.com' } 

/*ctx.data = { name : 'titi' }*/
const res = await ModelControllers['mymodel']()['update'](ctx);
console.log(res.response); // { name : 'titi',email:toto@gmail.com }

/*ctx.data = { id: 49ea4eaceceba9a8675df134f }*/
const res = await ModelControllers['mymodel']()['delete'](ctx);
console.log(res.response); // 49ea4eaceceba9a8675df134f // mongoose ObjectID
```
### Array property in model
pour mieux comprendre le service list suivons l'exemple suivant:

```javascript
//...
let computerSchema = SQuery.Schema({
  //property description
  name: {
    type: String,
  },
  folders:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:'folder',
    alien:true,
  }]
});
const ComputerModel = mongoose.model("computer", computerSchema);
MakeModelCtlForm({
  schema: computerSchema,
  model: ComputerModel,
  volatile: true,//le client peut cree et suprimer des instances du model
})
export default ComputerModel;
```
### Create Instance with array property
```javascript
/*ctx.data = { 
  name : 'ascer A15c', 
  folders:[{
    name:'Folder A',
    link:'/home/ascer/folderA'
    count: 0
  }] }*/
const res = await ModelControllers['computer']()['create'](ctx);
console.log(res.response); // 98db2ce62001bcef13279acb 
```
### Use list service
```javascript
/*ctx.data = { 
  addId: ["3ef414..."], // ajouter un autre id, Forlder Z
  addNew:[
    {
      name:'Folder B',
      link:'/home/ascer/folderB'
      count: 9
    }
  ],
  remove:["e62001..."], // id du  Folder A 
  paging:{
    query:{
      //__parentModel: parentModel + '_' + parentId + '_' + property
      __parentModel: 'computer_98db2ce62001bcef13279acb_folders'
    }
  }
 } */
const res = await ModelControllers['folder']()['list'](ctx);
console.log(res.response);
/*
hasNextPage: true,
hasPrevPage: false,
items: [
  {
    name:'Folder Z',
    link:'/home/ascer/folderZ'
    count: 3
  },{
    name:'Folder B',
    link:'/home/ascer/folderB'
    count: 9
  }
],
limit: 5,
nextPage: 1,
page: 1,
pagingCounter: 1,
prevPage: null,
totalItems: 2,
totalPages: 1,
*/
```
tous les proprier du ctx.data sont facultatives. 
`addId, addNew, remove` modifie la list.
`ctx.data.paging` est un object qui determine le resultat de sortie

```javascript
ctx.data = {
  paging:{
    page: 1, // le 1er lot "page" d'item "modeInstance"  
    limit: 5, // nombre de d'item par lot
    sort: {
      name:1 // ordre par nom
    },
    select: ' -link -_id ' // recisez les propriter desirer.
    query:{
      count: { $gt: 0, $lt: 10 }, //mongoose query
      // __parentModel requis si on veut les items appartenemt a une list donnee
      //sinon on prend en compte tous les iteme cree par le client.
      __parentModel: 'computer_98db2ce62001bcef13279acb_folders'
    }
  }
}
```

## Tools

les tools sont des fontions qui envelloppe des Pre/Post dans le cadre d'un meme traitement.

le code suivant permt
```javascript
maker.pre("create", async ({ ctx , more })=>{
 more.startTime = Date.now();  // ajouter une propierter
 more.afterCreate = (time)=> console.log('time = ',diff); // un callBack
 ctx.data.name = ctx.data.name.toUpperCase();//modeifier le data du client
});

maker.post("create", async ({ ctx ,res , more })=>{
  const endTime = Date.now();
  more.afterCreate(endTime - more.startTime);
  console.log(res); // reagir en fonctiont du res "result" avant l'envoit au client 
});
```

Comme dans l'exemple p

## Architecture de fichier

vous etre libre de choisir l'architecture de fichier qui vous convient. Cependant nous vous recommandons l'architecture suivante:
```text
|-App
|  |-Controllers
|  |   |-MyCtrl.ts
|  |-Models
|  |   |-MyModel.ts
|  |-Tools
|      |-MyTools.ts
|-Public
|  |-index.js
|-Start
|  |-InitDB.ts
|  |-InitAuth.ts
|-squeryconfig.ts
```
Pour executer les fichier au demarage du server vous devez informer `Config.conf`
```javascript
import { Config } from "squery/Config";

declare module "squery/Config" {
  export interface ConfigInterface {
    //ajouter des proprier au Config.conf
    PORT:number,
  }
}

Config.conf ={
  //donner des valeur a vos propriters
    PORT:3500,
    // indiquer l'emplacement des dossiers suivant.
    execDir:['/App/Models','/App/Controllers','/App/Tools','/Start'],
}
``` 


## Support
Nous serons ravis de repondre a vos questions et preocupations dans les commentaire.

## Contributors 
Nous avons developper SQuery dans le cadre de nos projet pour envelopper les actions repetitive lors de la creation d'application.
>Collaborateurs : [Noga](https://github.com/sublymus) ; [Simeon](https://github.com/simeon619)

[^1]: My reference.
[^2]: To add line breaks within a footnote, prefix new lines with 2 spaces.
  This is a second line.