const { info } = require('console');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = new require("socket.io")(server);
var nbJoueursMax=2;
var Joueurs=[];

server.listen(8888, () => {console.log('Le serveur écoute sur le port 8888');});

app.get('/', (request, response) => {
    response.sendFile('client_socket.io.html', {root: __dirname});
});

io.on('connection', (socket) => {
    socket.on('test', data => {
        console.log("Message reçu du client :", data);
        socket.emit('test', {'quiterepond': 'le serveur !'})
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
            socket.emit('information',"");
            socket.emit('NewName',data);
        }else{
            console.log("J'ai bien reçu le nom de joueur, mais la partie est pleine !");
            socket.emit('information',"Partie pleine !");
            io.emit('enter',Joueurs);
        }
    })
    socket.on('exit',data => {
        if (Joueurs.indexOf(data)==0){
            Joueurs.shift()
        }else{
            Joueurs.pop()
        }
        io.emit('enter',Joueurs);
        io.emit('information',"free")
    })
    socket.on('message',data => {
        io.emit('message',(data[1]+" : "+data[0]+"\n"))
    })
});