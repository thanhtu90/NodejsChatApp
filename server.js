let express = require("express");
let app = express();
let io = require("socket.io");
let http = require("http");

app.use(express.static("public"));
app.set("view engine","ejs");
app.set("views", "./views");

let server = http.Server(app);
io = io(server);

server.listen(3000);

let online_users = [];
let socket_array = [];

io.on("connection", function(socket){
    console.log("socket_id"+socket.id);
    socket_array.push(socket);

    // console.log("User "+socket.id+" Connected");
    socket.on("client-register-new-user", function(data){
        let user_name_is_used = online_users.reduce(function(flag, user){
            if (user.username == data.username){
                flag = true
            }
            return flag
        }, false);
        
        if (user_name_is_used){
            // register fail
            socket.emit("server-response-register-fail",{
                message: "Username has been used, Please choose another !!!"
            })
        }else{
            // register succeed
            online_users.push({
                userRoom: socket.id,
                username:data.username}
            );
            socket.Sender = data.username;
            socket.CurrentRoom = data.username;
            socket.emit("server-response-register-succeed",data);
            io.sockets.emit("server-send-online-user-list",online_users)
        }
    });

    socket.on("client-logout", function(data){
        let idx_item_to_remove = online_users.indexOf(socket.Sender);
        online_users.splice(idx_item_to_remove, 1);
        
        let idx_socket_to_remove = -1;
        for(let i=0;i<socket_array.length;i++){
            if (socket_array[i].id == socket.id){
                idx_socket_to_remove = i;
                break;
            }
        }
        socket_array.splice(
            idx_socket_to_remove,
            1
        )
        socket.emit("server-logout-success");
        socket.broadcast.emit("server-send-online-user-list", online_users);

        socket.disconnect()
    });

    // socket.on("client-send-message", function(data){
    //     io.sockets.emit("server-send-message", {
    //         sender: socket.Sender,
    //         message: data.message
    //     })
    // })

    socket.on("client-send-message", function(data){
        let time_formated = new Date().formated();
        io.to(data.room_id).emit("server-send-message", {
            room_id:data.room_id,
            sender: socket.Sender,
            message: data.message,
            time: time_formated
        })
    })


    socket.on("client-is-typing", function(){
        io.sockets.emit("server-inform-user-is-typing", {
            username: socket.Sender
        });
    });

    socket.on("client-stop-typing", function(){
        io.sockets.emit("server-inform-user-stop-typing", {
            username: socket.Sender
        });
    });

    socket.on("user-join-room", function(data){
        
        // user join room;
        data.users.sort();
        // create conversationId
        let conversationId = data.users.reduce(function(conId,user_socket_id){
            conId += ":"+user_socket_id;
            return conId
        },"");
        
        socket.join(conversationId);

        // receiver socket join conversation
        socket_array.map(function(socket_item){
            if (socket_item.id == data.receiver_socket_id){
                socket_item.join(conversationId)
                socket.emit("server-response-joined-room",{
                    room_id : conversationId,
                    receiver_name: socket_item.Sender
                });
            }
        })
    
        // console.log(socket.adapter.rooms[conversationId])

    })
})

app.get("/", function(req, res){
    res.render("index");
});


Date.prototype.formated = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
    let hh = this.getHours();
    let mi = this.getMinutes();
  
    return [
            (hh>9 ? '' : '0') + hh,
            ":",
            (mi>9 ? '' : '0') + mi,
            " ",
            (dd>9 ? '' : '0') + dd,
            "/",
            (mm>9 ? '' : '0') + mm,
            "/",
            this.getFullYear()
           ].join('');
  };