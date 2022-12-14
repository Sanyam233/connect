const app = require('./app');
const socketio = require('socket.io');
const mongoose = require('mongoose');

//Connecting to MongoDB
const mongodbURL = process.env.MONGODB_URL.replace(
    '<password>',
    process.env.MONGODB_PASSWORD
);

mongoose
    .connect(mongodbURL)
    .then(() => {
        console.log('DB connection successful');
    })
    .catch((e) => {
        console.log(e.message);
    });

const server = app.listen(process.env.PORT, () => {
    console.log(`App running on PORT ${process.env.PORT}`);
});

const io = socketio(server);

io.on('connection', (socket) => {});
