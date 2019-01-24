var serverUrl = "tamats.com:55000";
var roomPrefix = "1412312_";

var msgSent = new Event('msgSent');

class Network {
    constructor() {
        this.rooms = {};
        this.report = {};
        this.activeRoom = "";
        this.nick = "";
        this.users = {};
    }
    connect (room) {
        var that = this; // store context
        this.rooms[room.id] = room; // add room to network
        if(room.is_active) {
            this.activeRoom = room.id;
        }
        
        var server = new SillyClient(); 
        server.connect(serverUrl,room.id); //connect to server
        room.server = server; // add server to room

        server.on_ready = function(id) {
            room.me = id; // my user_id in the room
        };
        server.on_room_info = function (info) {
            for (var client of info.clients) {
                room.users[client] = new User(client);
            }
        }
        server.on_message = function(author_id,msg) {
            var msgObj = JSON.parse(msg);
            if (msgObj.type=="msg") {
                if (room.id == that.activeRoom) {
                    appendMessage(msgObj)
                }
                room.append_in_history(msgObj);
            } else if (msgObj.type=="hist") {
                var histObj = JSON.parse(msgObj.text);
                room.history = histObj;
                if (room.id==that.activeRoom) {
                    appendHist(histObj); // on reload hist append
                }
            } else if (msgObj.type=="new_room") {
                that.roomListUpdate(msgObj.text);
            }
        };
        server.on_user_connected = function (user_id) {
            // ask for the room info to see if we are the oldest ones here
            room.users[user_id] = new User(user_id);
            server.getRoomInfo(room.id, function(room_info){
                // update room metadata
                room.info = room_info;
                document.dispatchEvent(roomMetaUpdate);
                // check if I am the oldest
                var oldestUser = Math.min.apply(null, room_info.clients)
                // console.log("oldest "+oldestUser);
                if (room.me == oldestUser) {
                    var hist = room.history;
                    var histMsg = new Message("hist",JSON.stringify(hist));
                    room.server.sendMessage(JSON.stringify(histMsg),[user_id]);
                }
            })
        };
        server.on_user_disconnected = function (user_id) {
            delete room.users[user_id];
        }
    }
    disconnect(roomId) {
        if (roomId) {
            this.rooms[roomId].server.close();
            delete this.rooms[roomId];
        } else {
            for (var room in this.rooms) {
                this.rooms[room].server.close();
            }
        }
    }
    sendMessage(msgText,user) {
        if (msgText) {
            var d = new Date();
            var when = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2)
            var msg = new Message("msg",msgText,this.rooms[this.activeRoom].me,when);
            if (this.nick) {msg.nick = this.nick;}
            var roomName = this.activeRoom; 
            this.rooms[roomName].server.sendMessage(JSON.stringify(msg),user);
            if (msg.type=="msg") {
                appendMessage(msg);
                this.rooms[roomName].append_in_history(msg);
            }
            document.dispatchEvent(msgSent);
        }
    }
    broadcastNewRoom(room_name) {  
        // ojo hardcode first elmt because it'll be always #general
        // and everybody is in general  
        var srv = network.rooms[roomPrefix+"general"].server;
        var msg = new Message("new_room",room_name);
        srv.sendMessage(JSON.stringify(msg));
    }
    roomListUpdate(room_name) {
        var new_room = new Room(room_name);
        new_room.offline = true;
        appendRoom(new_room);
    }
}

class Room {
    constructor(name,is_active) {
        this.name = name;
        this.id = this.get_id(name);
        this.screenName = this.get_screenName(name);
        this.history = []; 
        this.users = {};
        this.is_active = is_active;
    }
    get_id (name) {
        return roomPrefix+this.name; 
    }
    get_screenName (name) {
        return "#"+name;
    }
    append_in_history(msg) {
        if (msg.type == "msg") {
            this.history.push(msg);
        }
    }
}

class Message {
    constructor(type,msg,from,when) {
        this.type = type;
        this.text = msg;
        this.from = from;
        this.when = when;
        this.nick = "";
    }
}

class User {
    constructor (user_id) {
        this.user_id = user_id;
    }
}