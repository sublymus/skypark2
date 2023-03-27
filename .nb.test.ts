/*

=======================================  access  ==================================================
=======================================   populate  ==================================================
=======================================   file  ==================================================
=======================================   impact  ==================================================
=======================================   SQuery.Auth  ==================================================
=======================================   SQuery.View  ==================================================
=======================================   SQuery.io  ==================================================
=======================================   SQuery.Schema  ==================================================
=======================================   SqueryConfig ==================================================
=======================================   Controllers  ==================================================
=======================================   ModelControllers ==================================================
=======================================   GlobalMiddleware ==================================================
=======================================   ServerCtrl  ==================================================
=======================================   AuthManager  ==================================================
=======================================   invalidation ==================================================
=======================================   __key  ==================================================
=======================================   permission ==================================================
=======================================  invalidation  ==================================================
=======================================   Alien  -   StrictAlien ==================================================
-on peut modifier l'id d'une property si ce dernier est alien ou strictAlien;
-si on remplace l'id pas newId et que impact est different de false on suprime le oldId, si la permission le permet;
-on peut ajouter l'id a la creation pour rule{ alien:true }, pour rule:{strictAlien:true} , un id est obligatoire;
-on peut mettre ref en prive mais cela ne suffi pas ca on peut toutfois acceder a la ref par son id il faut mettre les property de la ref qui son conserner en private
=> il est deonc mieux de se dire que seul les valeur fini on droit a un access(veritable);

-tout les ref modifiable doivent disposer alien ou de strictAlien + un access le permertant
-dans le cas d'un ref[] , rule:[{ alien:true}] > addId ou addNew ; rule:[{ strictAlien:true}] > addId ; rule:[{..}] > addNew  

*/