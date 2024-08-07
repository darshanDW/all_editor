const mongoose = require("mongoose")
const Document = require("./Document")
require('dotenv').config();

const dburl = process.env.DB_URL;

mongoose.connect(dburl, {
    useNewUrlParser: true,


    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('connected', () => {
    console.log('online connected');
});
const express = require('express');
const app = express();
const port = process.env.PORT;

app.get('/', (req, res) => {
    console.log("express server");


});

const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// Add your existing socket.io code here
const io = require("socket.io")(server, {
    cors: {

        origin: "*",
        methods: ["GET", "POST"],
    },
});

const defaultValue = ""
io.on("connection", socket => {
    socket.send("hii");
    console.log("socket connected")
    socket.on("get-document", async documentId => {
        const document = await findorcreate(documentId);

        socket.join(documentId);
        socket.emit('load-document', document.data)


        socket.on('send-change', delta => {
            socket.broadcast.to(documentId).emit('recieve-change', delta)
        });
        socket.on('save-document', async data => {
            const doc = await Document.findOne({ id: documentId });
            await doc.updateOne({ data: data });
        })

    })

})
async function findorcreate(id) {
    if (id == null) {
        return;
    }
    const document = await Document.findOne({ id: id });
    if (document) {
        return document
    }
    return await Document.create({ id: id, data: defaultValue })
}