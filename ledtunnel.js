const net = require("net");
const Gpio = require("onoff").Gpio;
const led = new Gpio(17, "out");
require("dotenv").config();

process.on("uncaughtException", (err) => console.error(err));

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        try {
            const obj = JSON.parse(data.toString());
            if (obj) {
                const command = obj.command;
                if (command && typeof command === "string") {
                    if (command === "Turn on LED") {
                        if (led.readSync() === 0) {
                            led.writeSync(1);
                            socket.write(JSON.stringify({ error: false }));
                        } else socket.write(JSON.stringify({ error: true }));
                    } else if (command === "Turn off LED") {
                        if (led.readSync() !== 0) {
                            led.writeSync(0);
                            socket.write(JSON.stringify({ error: false }));
                        } else socket.write(JSON.stringify({ error: true }));
                    } else socket.write(JSON.stringify({ error: true }));
                } else socket.write(JSON.stringify({ error: true }));
            } else socket.write(JSON.stringify({ error: true }));
        } catch (err) {
            socket.write(JSON.stringify({ error: true }));
        }
    });
});

server.listen(process.env.PORT, process.env.HOST, () => console.log("Server listening actively..."));

process.on("SIGINT", () => {
    led.unexport();
    process.exit();
});
