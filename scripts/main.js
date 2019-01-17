/*  -----------------------------------  */
/*  -------  Server Connection  -------  */
/*  -----------------------------------  */
var server = new SillyClient();
var room = "ECV";
server.connect("ecv-esup.s.upf.edu:9000", room);

server.on_ready = function () {
    console.log('Joined the room ' + room);
    server.sendMessage("Hej, I just joined the room!");
}

/*  -----------------------------------  */
/*  ------  Message Interaction  ------  */
/*  -----------------------------------  */

var msg = document.querySelector('.messages')
var textInput = document.querySelector('.message-input textarea');
var submitBtn = document.querySelector('.submit');
var msgList = document.querySelector('.messages ul');

/*  --------  Screen Message  --------  */
appendMessage = function(message,who) {
    var nodeP = document.createElement("p");
    nodeP.innerText = message;
    var nodeLi = document.createElement('li');
    nodeLi.className = who;
    nodeLi.appendChild(nodeP);
    msgList.appendChild(nodeLi);
    msg.scroll(0,msg.scrollHeight);
}

/*  --------  Listen Messages  --------  */
server.on_message = function (author, msg) {
    appendMessage(msg,'received');
}

/*  ---------  Send Messages  ---------  */
sendMessage = function(msg) {
    if (msg) {
        appendMessage(msg,"sent");
        server.sendMessage(msg);
        return true;
    } else {
        return false;
    }
}

/*  -------  User Interaction  --------  */
onSubmit = function(e) {
    var isSent = sendMessage(textInput.value);
    if (isSent) {
        textInput.value = "";
    }
}
submitBtn.addEventListener("click",onSubmit);

onEnter = function(e) {
    var charCode = (e.which) ? e.which : e.keyCode
    if (charCode == 13) { // enter key
        e.preventDefault();
        var isSent = sendMessage(textInput.value);
        if (isSent) {
            textInput.value = ""
        }
    }
}
textInput.addEventListener('keydown', onEnter);