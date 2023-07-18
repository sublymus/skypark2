/*


BUG: ordre d'utilisation du model dans le schema.

BUG: le defaulte ne marche pas.

BUG: le backdestroy laisse a dessirer.

BUG: dans le cookies a la creation => io=XFNfoB5OjoTMuFSTAAAO;                   Max-Age=1689498209816;                  Max-Age=1689498214475;                 Max-Age=1689498214538;                Max-Age=1689498214597;               Max-Age=1689498214681;              Max-Age=1689498214748;             Max-Age=1689498214821;            Max-Age=1689498214878;           Max-Age=1689498214958;          Max-Age=1689498215112;         Max-Age=1689499251491;        Max-Age=1689499258093;       Max-Age=1689499258139;      Max-Age=1689499258190;     Max-Age=1689499258239;    Max-Age=1689499258275;   Max-Age=1689499258316;  Max-Age=1689499258347; squery_session=%22eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6eyJfX2tleSI6IjY0YjI2NGZhMjJjNmYzM2M0MzUxZWEyNyIsIl9fcGVybWlzc2lvbiI6ImNsaWVudDp1c2VyIiwiX19zaWdudXBJZCI6IjY0YjI2NGZhMjJjNmYzM2M0MzUxZWEyNiIsIl9fc2lnbnVwTW9kZWxQYXRoIjoidXNlciIsIl9fZW1haWwiOiJwYWQyLXUzQGdtYWlsLmNvbSIsIl9fbG9naW5JZCI6IjY0YjI2NGZhMjJjNmYzM2M0MzUxZWEyOCIsIl9fbG9naW5Nb2RlbFBhdGgiOiJhY2NvdW50In0sImlhdCI6MTY4OTMzNDQ5OH0.P7Dcm4Yb00x98RYpmSKJuo0OEjIleGK91HlmY-mHbwk%22; Max-Age=1689499258394 

BUG: token: {
    __key: '64b37c361cf5f8620b2acf4a',
    __permission: 'client:manager',
    __signupId: '64b37c361cf5f8620b2acf49',
    __signupModelPath: 'user',   < < <  = = = = = = = = = =  lors de la creation de manager dans la property managers de entreprise
    __email: 'm4@gmail.com',
    __loginId: '64b37c361cf5f8620b2acf4b',
    __loginModelPath: 'account'
  },
  iat: 1689482644

TODO: access controller

TODO: le generateur de Descrition.

TODO: first parent "ModelName"./soucre  -> "listeElement"./destination/property

TODO: pour les option du rule, les properties boolean doivent etre activer( passer a true) donc le nom doit correspondre a un truc a activer.

TODO: impact != false => dontImpact == true

TODO: le event du prepost doit suivre la forme suivante : " e1 e2 e3" 

TODO: access , seul a voir mais ne peut pas modifier.

TODO: proprieter virtuel qu'on peut pas modifier et qui est un ensemble de query , un object de proprieter queryObj ou une fonction  qui retourne un queryObj

TODO: auth add uptade cookies on singup

TODO: rassenmbler les n parent d'un model donner dans un tableau, du plus proche au plus eloigner













/////////////////////////////////////////////////////////////////////////////////////

socket map 

TODO: treminal=> npm squery create:controller
TODO: folder:{
    parentAccess:true,
    access:private,
}

#TODO: rule:{
    wacth:"pour suivre si une instance est suprimer on la suprime de la liste ou on rend le property undefined"
    observator:"/address/building => ../building" //
    // => binding
    // <=> bind bidirectionnal
    // configurer les symboles
}
TODO: befor after autoexecute ,
TODO: access permission shared  niveau Model 
TODO: et niveau Instance

__SQuery file access au fichier..

=======================================  access  ==================================================
-access:property {ref:modelPath,access:private} il est mieux de definir en plus les property du ref comme etant private
-le header contient le { __key , __permission , signupId , signupModelPath , loginId , loginModelPath} 
=======================================   populate  ==================================================
=======================================   file  ==================================================
*****delete 
-on suprime tous les fichier dont on dispose de l'url
=======================================   impact  ==================================================
=======================================   SQuery.Auth  ==================================================
- on ne peut pas creat un signupMode en avec le __key du ctx, tout creation d'un signupModel entre la creation d'un __key unique pour ce dernier;
- on peut ajouter un cookis dans le socket partout dans le code
SQuery.cookies(socket , 'property', value ); //clientCookies
SQuery.cookies(socket , 'property'); //value
SQuery.cookies(socket  ); // { property:value , ...}

=======================================   SQuery.View  ==================================================
=======================================   context  ==================================================
=======================================   SQuery.io  ==================================================
=======================================   SQuery.Schema  ==================================================
=======================================   SqueryConfig ==================================================
=======================================   Controllers  ==================================================
=======================================   ModelControllers ==================================================
*****create - store

*****read -show
*****list : 
arrayData.added

*****update
*****delete - destroy
-ref: s'il ya impact on peut tenter de suprimer.
-ref[]: on fait appel a list{remove:modelInstance[p]}
-__key: seul le celui qui a le __key peut suprimer un doc de la db 
-file: on suprime tous les fichier dont on dispose de l'url
=======================================   GlobalMiddleware ==================================================
=======================================   ServerCtrl  ==================================================
----- currentUser :  
response: {
                login: {
                    modelPath: token.__loginModelPath,
                    id: token.__loginId,
                },
                signup: {
                    modelPath: token.__signupModelPath,
                    id: token.__signupId
                }
            }

----- description: 
response:  DescriptionSchema,

----- descriptions : 
response: { modelPath : DescriptionSchema ,...}

----- extractor : 
ctx.data = {
     modelPath, id,
    extractorPath : 
    './'
    './ref/ref/ref'
    '../../'
    '../../ref/ref/ref'
}
response :{
    modelPath: currentModelPath,
    id: currentDoc._id.toString();
};
=======================================   AuthManager  ==================================================
----- login :
 ctx.data = {
    match1 : "matchValue1"
    match2 : "matchValue2"
    ...
}
 response: {
    login: {
        modelPath: token.__loginModelPath,
        id: token.__loginId,
    },
    signup: {
        modelPath: token.__signupModelPath,
        id: token.__signupId
    }
},
=======================================   __key  ==================================================
=======================================   __permission ==================================================
=======================================  invalidation  ==================================================
=======================================   Alien  -   StrictAlien ==================================================
-on peut modifier l'id d'une property si ce dernier est alien ou strictAlien;
-si on remplace l'id pas newId et que impact est different de false on suprime le oldId, si la permission le permet;
-on peut ajouter l'id a la creation pour rule{ alien:true }, pour rule:{strictAlien:true} , un id est obligatoire;
-on peut mettre ref en prive mais cela ne suffi pas ca on peut toutfois acceder a la ref par son id il faut mettre les property de la ref qui son conserner en private
=> il est deonc mieux de se dire que seul les valeur fini on droit a un access(veritable);

-tout les ref modifiable doivent disposer alien ou de strictAlien + un access le permertant
-dans le cas d'un ref[] , rule:[{ alien:true}] > addId ou addNew ; rule:[{ strictAlien:true}] > addId ; rule:[{..}] > addNew  
//////////////////************************** SQUERY Client Utilisation ******************************  //

SQuery.socket

SQuery.emit('event',data,callBack)

SQuery.emitNow('event',data,callBack) // if server conected

.. pour gerer les error => await SQuery.<methode>(...methodArg , (error,instance)=>{})
const lolModel = await SQuery.model('lolModelPath');   
const lolInstance = await lolModel.create(lolCreationData);   renvoie une instance si les information rentrer sont bonne, sinon renvoie null
const lolInstance = await lolModel.newInstance({id: lolId });    renvoie une instance si les information rentrer sont bonne, sinon renvoie null
const lolInstance = await lolModel.update(aUpdateData); renvoie une instance si les information rentrer sont bonne, sinon renvoie null
const isDeleted = lolModel.delete({id: lolId });

 const profile = await user.extractor('./account/profile')
 const building = await address.extractor('../../building')
 condt fileInstance = await profile['imgProfile];
fileInstance.urls
fileInstance.update({
    addFile:[{
        filedata
    }],
    remove:["url"] // server file access
})
post.comments
post.like
messenger.createDiscussion
messenger.removeDiscussion
*/
