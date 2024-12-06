const { info } = require('console');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = new require("socket.io")(server);
var nbJoueursMax=2;
var Joueurs=[];
var Historique = [];    /*initialisation historique*/
var PartieEnCours = false; /* Pour savoir si il y a une partie qui à commencé ou non */
var CompteARebours = null;
var Token;
var size=-1;

server.listen(8888, () => {console.log('Le serveur écoute sur le port 8888');});

app.get('/', (request, response) => {
    response.sendFile('client_socket.io.html', {root: __dirname});
});

io.on('connection', (socket) => {
    socket.on('MyConnect', data => {                       // Première connexion !
        var ok=0;
        if (size==-1){
            size=data;
            console.log("Première personne connecté, taille du tablier :" + size)
        }else if (size==data){ // Taille de tablier correspondante
            console.log("Joueur connecté avec comme taille du tablier : " + size)
        }else{
            ok=1; // Il y a un problème...
            console.log("Essaie de connection avec une taille de tablier erroné ("+size+")")
        }
        socket.emit('MyConnect', ok);
        io.emit('enter',Joueurs);
    });

    socket.on('enter', data => {
        if (Joueurs.length<nbJoueursMax){
            if(Joueurs.length!=0 && Joueurs.includes(data)){
                data=data+"("+Joueurs.length+")"
            }
            Joueurs = Joueurs.concat([data]);
            console.log("J'ai bien reçu le nom de joueur et l'ai ajouté à la liste des joueurs");
            console.log("Nombre de joueurs : " + Joueurs.length);
            io.emit('enter',Joueurs);
            socket.emit('NewName',data);
            if (Joueurs.length==nbJoueursMax){          /*check si la partie peut commencé*/
                io.emit('information', "starting");     /*prévient que la partie va commencé */
                CompteARebours = setTimeout(function(){
                    io.emit('information', "started");  /*compte à rebours puis prévient que la partie a commencé*/
                    PartieEnCours = true; 
                    Token=0;
                } ,5000);
                console.log(CompteARebours)
            }
        }else{
            console.log("J'ai bien reçu le nom de joueur, mais la partie est pleine !");
            socket.emit('information',"full");
        }
    })

    socket.on('exit',data => {
        if (Joueurs.indexOf(data)==0){
            Joueurs.shift()
        }else{
            Joueurs.pop()
        }
        io.emit('enter',Joueurs);
        io.emit('information',"free")
        if (CompteARebours){                        // Maybe false
            clearTimeout(CompteARebours);
            console.log(CompteARebours)
            io.emit('information', "cancel");
        }
    })

    socket.on('message',data => {
        io.emit('message',(data[1]+" : "+data[0]+"\n"))
    })

    socket.on('numplayer',data => {
        if (Joueurs.includes(data)==1){
            if (Joueurs.indexOf(data)==0){
                socket.emit('numplayer',0);
            }else{
                socket.emit('numplayer',1);
            }
        }else{
            socket.emit('numplayer',-1);
        }
    })



    // ============================================= CODE BY ILAN

    socket.on('action', data => {                       /*traitement des actions*/
        var numJ = Joueurs.indexOf(data[0]);            /*récup des datas*/
        var numC = data[1];
        var dejafait = false;
        var i = 0;
        while(i<Historique.length&&(!dejafait)){        /*cherche si l'action à déjà été fait*/
            if (Historique[i][1]==numC){
                dejafait=true;
            }
            i++;
            console.log(i)
            console.log(Historique.length)
        }
        if (!dejafait&&PartieEnCours&&numJ==Token){                  /*réalise l'action*/
            Historique.push([numJ, numC]);
            if (Token==0){
                Token=1;
            } else if(Token==1){
                Token=0;
            }
            console.log(Historique)
            io.emit('action', [numJ, numC]);
        }
    })

    socket.on('demandeH', data =>{                      /*demande l'historique actuel*/
        socket.emit('demandeH',Historique);
    })

    function victoire(P,C){
        var disco=[];
        var group=[];
        
    }
});