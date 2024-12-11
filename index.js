const express = require('express');
const app = express();
const WebSocket = require("ws");

require('dotenv').config()



const port = process.env.PORT || 5000;


app.use(express.json());

const server = require('http').createServer(app);
// Create a WebSocket server
const wss = new WebSocket.Server({ server });

let users = [
    { userId: 1, userName: "user1", password: "123456", auth_key: "zUS5p7adCQrT16oO9gvNnCRwHrkCYSqTSaDr6aFElIciNsnqQdMLIgiIFKg9WZ8Y", },
    { userId: 2, userName: "user2", password: "123456", auth_key: "Ivgwf4AWmA1SdH7rHc0uVmzKKemXHkmm8jTAqza1uMIUAOGFGz6cJpCKcMVpqjct", },
    { userId: 3, userName: "user3", password: "123456", auth_key: "a2Q9hlLOAMfXzTtecs8Fx9M2sKUF7VPm8cssJmIBqaFXeQeJT9rcewoTRr1XICEs", },
    { userId: 4, userName: "user4", password: "123456", auth_key: "8ydiAVjoRO0JcgvdWIRsuQK9Cu06kfcVf98QpbSZN4wgjZMwdMK7cdqisfhbzSrC", },
    { userId: 5, userName: "user5", password: "123456", auth_key: "tvO2ZIe9f2LESF2QvBPRFWPGelNzztX5C55H6do383fxItXjEUgAjuLgR4DEhvRi", },
    { userId: 6, userName: "user6", password: "123456", auth_key: "KCO1RLl9hH6k2JUv2Kg4isGMfq8MtT5p1PYXPtHHJGngb0IbtgDfOn8OtX1n2sM7" ,},
];


app.get("/", (req, res) => {
    res.send("Welcome to Oxdo Technologies");
});

app.get("/getAllUsers", (req, res) => {
    res.send(users);
});

app.post("/login", (req, res) => {
    try {
        const { userName, password} = req.body;
        const key = req.headers["owner"];

        if (!key || key !== "oxdo") {
            return res.status(401).send("Authentication failed");
        }

        console.log(userName);
        console.log(password);


        const token = authenticateUser(userName, password);



        if (token) {
            res.send({ token: token });
        } else {
            res.status(401).send("No user present with this userName and Password");
        }



    } catch (error) {
        con1sole.log(error);
        res.status(400).send(error);
    }
})


const clients =  [];

wss.on("connection", (ws, req) => {

    const auth_key = req.headers["authorization"];
    const name = req.headers["name"]

    console.log(auth_key);

    if (!auth_key) {
        console.log("no auth key");
        ws.send("no auth key");
        ws.close(4001, "invalid authenticationkey");
        return;
    }


    const userName = checkUserAuthKey(auth_key)

    if (!userName) {
        ws.send("auth key is not valid");
        console.log("auth key is not valid");
        ws.close(4001, "invalid authenticationkey");
        return;
    }

    const newClient = {
        ws:ws,
        userName:userName
    }

    //clients.add(newClient);
     const clientAddResult  = addingClient(newClient);

     if(!clientAddResult){
        ws.send(` ${userName} connected already`)
        ws.close(4001, "invalid authenticationkey");
        return;
     }






    ws.send(`Welcome, connected to ${userName}}`);




    console.log("new client connected ");

    ws.on("message", (message) => {
       broadcast({message:message,name:name})
    })


    ws.on('close', () => {
        console.log('Client disconnected');

    });



})





server.listen(port, () => console.log(`App is running on the port ${port}`));










function authenticateUser(userName, password) {
    const user = users.find(u => u.userName === userName && u.password === password);
    return user ? user.auth_key : null;
}

function checkUserAuthKey(auth_key) {

    if (auth_key && auth_key.startsWith("Bearer ")) {
        const token = auth_key.split(" ")[1];

        const user = users.find(
            (user) => user.auth_key == token
        );
        if (user) {
            return user.userName;
        } else {
            return false;
        }

    } else {
        return false;
    }

}


function broadcast(recievedMessage) {
    clients.forEach((client) => {
        const ws = client.ws;
        const userName = client.userName;
        const message = recievedMessage.message.toString();
        const name = !(recievedMessage.name) ? userName : recievedMessage.name;
        const json = JSON.stringify({name:name,message:message,dateTime:new Date()})
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(json);
        }
    });
}

function addingClient(client){
    const exists = clients.some(
        user=>user.userName===client.userName
    )

    if(exists){
        return false;
    }

    clients.push(client)
    return true;
}