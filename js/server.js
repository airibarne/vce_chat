/* --------- NOTES -----------*/
/*  With server.connect() the user gets disconnected
    from the previous room (if any) and connected to
    the new one. A new ID is given to that user   */
var serverUrl = "tamats.com:55000";
var roomPrefix = "u164317_";
var roomObjects = {};
var report = {};

var msgSent = new Event('msgSent');
var roomMetaUpdate = new Event('roomMetaUpdate');

class Network {
    constructor() {
        this.rooms = {};
        this.report = {};
        this.activeRoom = "u164317_general";
        this.nick = "";
        this.users = {};
    }
    connect (room) {
        var that = this;
        var roomID = room.id;
        var server = new SillyClient();
        server.connect(serverUrl,roomID);
        server.on_ready = function(id) {
            room.me = id;
        };
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
                appendHist(histObj);
            }
        };
        server.on_user_connected = function (user_id) {
            // ask for the room info to see if we are the oldest ones here
            server.getRoomInfo(roomID, function(room_info){
                // update room metadata
                room.info = room_info;
                document.dispatchEvent(roomMetaUpdate);
                // check if I am the oldest
                var oldestUser = Math.min.apply(null, room_info.clients)
                if (room.me == oldestUser) {
                    var hist = room.history;
                    var histMsg = new Message("hist",JSON.stringify(hist));
                    room.server.sendMessage(JSON.stringify(histMsg),[user_id]);
                }
            })
        };
        room.server = server;
        this.rooms[roomID] = room;
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
    requestHist(screenName) {
        
    }
}

class Room {
    constructor(name,isProtected) {
        this.name = name;
        this.id = this.get_id(name);
        this.screenName = this.get_screenName(name);
        this.history = []; 
        this.users = {};
        this.isProtected = isProtected;
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