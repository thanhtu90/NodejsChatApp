let express = require("express");
let io = require("socket.io");
let app = express();
app.use(express.static("./public"));
app.set("view engine","ejs");
app.set("views", "./views");

let server = require("http").Server(app);
server.listen(3000);
io = io(server);
io.on("connection", function(socket){
    console.log("Co nguoi ket noi"+ socket.id);
    socket.on("disconnect", function(){
        console.log(socket.id+" ngat ket noi");
    });
    socket.on("client-send-data",function(data){
        data.res = parseInt(data.a) + parseInt(data.b);
        io.sockets.emit("server-send-data",data);
    });
    socket.on("client-change-color",function(data){
        io.sockets.emit("server-change-color",data);
    });
})


app.get("/", function(req, res){
    res.render("home", {title: "trang chu"});
});
