let socket = io("playground.thanhtu.com.vn:3000",{forceNew: true});
let conversations = {};

function join_room(user_to_chat){
    socket.emit("user-join-room",{
        users:[user_to_chat,socket.id],
        receiver_socket_id: user_to_chat
    })
}

function getUserTemplate(userRoom, username){
    return '\
    <div class="useronline row container" >\
        <div class="col-sm-6 nopadding">\
            <img src="./img/avatar.jpeg" class="avatar img-circle img-responsive center-block">\
        </div>\
        <div class="col-sm-6 nopadding">\
            <p class="nopadding joinRoom white-text" \
            onclick="join_room(\''+userRoom+'\')">\
                <strong>'+username+'</strong>\
            </p>\
            <p>\
              <span class="circle inlineblock"></span>\
              <span class="inlineblock gray-text">online</span>\
            </p>\
        </div>\
    </div>\
    ';
}

function getChatTemplate(item){
    return '\
    <div class="wrap-chat">\
        <p>'+item.sender+' ('+item.time+')</p>\
        <div class="speech-bubble white-text">'+item.message+'</div>\
    </div>\
    ';
}

function getRightChatTemplate(item){
    return '\
    <div class="wrap-chat">\
        <p class="right-text">('+item.time+') '+item.sender+'</p>\
        <div class="blue-speech-bubble white-text">'+item.message+'</div>\
    </div>\
    ';
}

socket.on("server-response-register-succeed", function(data){
    $("#currentUser").html(data.username);
    $("#loginForm").hide(2000);
    $("#chatForm").show(1000);
});

socket.on("server-send-online-user-list", function(data){
    let childs = "";
    data.forEach(function(element) {
        let child = getUserTemplate(element.userRoom, element.username);
        childs += child;
    }, this);
    $("#boxContent").html(childs);
})

socket.on("server-response-register-fail", function(data){
    alert(data.message);
})

socket.on("server-logout-success", function(){
    $("#loginForm").show(2000);
    $("#chatForm").hide(1000);
})

// socket.on("server-send-message", function(data){
//     let message_item = '\
//         <div><p>'+data.sender+' : '+data.message+'</p></div>\
//     '
//     $("#listMessages").append(message_item);
// })

socket.on("server-send-message", function(data){
    let active_room_id = $("#active_room_id").val();
    
    // save local
    if (conversations.hasOwnProperty(data.room_id)){
        conversations[data.room_id].push(
            {
                sender:data.sender,
                message: data.message,
                time: data.time
            })
    }else{
        conversations[data.room_id] = [{
            sender:data.sender,
            message: data.message,
            time: data.time
        }]
    }

    if (active_room_id == data.room_id){
        
        let myself = document.getElementById("currentUser").innerHTML;
        let message_item = "";
        if ( data.sender == myself ){
            message_item= getRightChatTemplate(data)
        }else{
            message_item = getChatTemplate(data)
        }
        $("#listMessages").append(message_item);
        autoScrollDown();
    }

    return

})

socket.on("server-inform-user-is-typing", function(data){
    $("#isTyping").html("<p>"+data.username+" is typing </p>");
})

socket.on("server-inform-user-stop-typing", function(data){
    $("#isTyping").html('<p class="white-text">.</p>');
})

socket.on("server-response-joined-room", function(data){
    $("#active_room_id").val("");
    $("#active_room_id").val(data.room_id);
    $("#room_id").val(data.room_id);
    $("#userToChatWith").html(data.receiver_name);
    let myself = document.getElementById("currentUser").innerHTML;

    // active chat
    $("#txtMessage").prop('disabled', false);
    // alert(data.receiver_name);
    if (conversations[data.room_id]) {
        $("#listMessages").html("");
        // load history chat
        conversations[data.room_id].map(function(item){
            let message_item = "";
            if ( item.sender == myself ){
                message_item= getRightChatTemplate(item)
            }else{
                message_item = getChatTemplate(item)
            }
            
            $("#listMessages").append(message_item);
        })
    }else{
        $("#listMessages").html("");
    }
})

$(document).ready(function(){
    $("#loginForm").show();
    $("#chatForm").hide();

    $("#txtMessage").prop('disabled', true);
    $("#btnRegister").click(function(event){
        event.preventDefault();
        let username = $("#username").val();
        socket.emit("client-register-new-user", {
            username
        })
    });

    $("#btnLogout").click(function(event){
        event.preventDefault();
        socket.emit("client-logout")
    });

    $("#btnSendMessage").click(function(){
        let message = $("#txtMessage").val();
        if ( message != ""){
            let room_id = $("#room_id").val();
            socket.emit("client-send-message", {
                message,
                room_id
            });
            $("#txtMessage").val("");
        }
    });

    $("#txtMessage").focus(function(){
        socket.emit("client-is-typing");
    });

    $("#txtMessage").focusout(function(){
        socket.emit("client-stop-typing");
    });

});

function autoScrollDown(){
    let myDiv = $("#listMessages");
    myDiv.animate({ scrollTop: myDiv[0].scrollHeight - myDiv.height() });
}