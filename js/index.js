var profImg = document.querySelector('#profile-img');
var statOpt = document.querySelector('#status-options');
var profile = document.querySelector('#profile');
var chrooms = document.querySelector('.contacts');
var roomTtl = document.querySelector('.content .contact-profile p');

// network init
var network = new Network();

/*  -----------------------------------  */
/*  -------------  Status  ------------  */
/*  -----------------------------------  */

profImg.addEventListener("click", function () {
	statOpt.classList.toggle("active");
}, false);

for (opt of document.querySelectorAll("#status-options ul li")) {
	opt.addEventListener("click",
	function () {
		profImg.className = "fa fa-user";
		for (opt of document.querySelectorAll("#status-options ul li")) {
			opt.classList.remove("active");
		}
		this.classList.add("active");

		if(document.querySelector('#status-online').classList.contains("active")) {
			profImg.classList.add("online");
		} else if (document.querySelector('#status-away').classList.contains("active")) {
			profImg.classList.add("away");
		} else if (document.querySelector('#status-busy').classList.contains("active")) {
			profImg.classList.add("busy");
		} else if (document.querySelector('#status-offline').classList.contains("active")) {
			profImg.classList.add("offline");
		} else {
			profImg.className = "";
		};
	},false);
}

/*  -----------------------------------  */
/*  -----------  User Info  -----------  */
/*  -----------------------------------  */

var userNickname = document.querySelector("#profile .wrap>p");
var expdBtn = document.querySelector('.expand-button');

onClickSelection = function(elm) {
	// on-click selection
	if (document.body.createTextRange) {
		range = document.body.createTextRange();
		range.moveToElementText(elm);
		range.select();
	} else if (window.getSelection) {
		selection = window.getSelection();
		range = document.createRange();
		range.selectNodeContents(elm);
		selection.removeAllRanges();
		selection.addRange(range);
	}
}

userNickname.addEventListener("click",function () {
	onClickSelection(this);
});
userNickname.addEventListener("keydown", function (e) {
	var charCode = (e.which) ? e.which : e.keyCode
    if (charCode == 13) { // enter key
		e.preventDefault();
		window.getSelection().removeAllRanges();
		network.nick = userNickname.innerText;
    }
});
userNickname.addEventListener("focusout", function (e) {
	network.nick = userNickname.innerText;
});

expdBtn.addEventListener("click", function () {
	profile.classList.toggle("expanded");
	chrooms.classList.toggle("expanded");
}, false);

for ( inp of document.querySelectorAll("#expanded input") ) {
	inp.addEventListener("click", 
	function () {
		this.select();
	}, false);
}

/*  -----------------------------------  */
/*  -----  Room/User Interaction  -----  */
/*  -----------------------------------  */

var rooms = document.querySelectorAll(".contacts .contact");
var roomsPanel = document.querySelector("#rooms");
var usersPanel = document.querySelector("#users");
var switchRoom = document.querySelector("#switchRoom");
var switchUser = document.querySelector("#switchUser");

switchRoom.addEventListener("click", function () {
	if(!switchRoom.classList.contains("active")) {
		switchRoom.classList.add("active");
		switchUser.classList.remove("active");
		roomsPanel.style.display = "";
		usersPanel.style.display = "none";
	}
});
switchUser.addEventListener("click", function () {
	if(!switchUser.classList.contains("active")) {
		switchUser.classList.add("active");
		switchRoom.classList.remove("active");
		usersPanel.style.display = "";
		roomsPanel.style.display = "none";
	}

});

// // var oldName
// roomTtl.addEventListener("click",function () {
// 	if (this.contentEditable=="true") {
// 		// oldName = roomTtl.innerText;
// 		onClickSelection(this);
// 	}
// });
// roomTtl.addEventListener("keydown", function (e) {
// 	var charCode = (e.which) ? e.which : e.keyCode
//     if (charCode == 13) { // enter key
// 		e.preventDefault();
// 		window.getSelection().removeAllRanges();
// 		network.nick = userNickname.innerText;
//     }
// });
// roomTtl.addEventListener("focusout", function (e) {
// 	network.nick = userNickname.innerText;
// });

appendRoom = function(roomName,roomID,isActive) {
	var name = document.createElement("p");
	name.classList.add("name");
	name.innerText = roomName;
	var prev = document.createElement("p");
	prev.classList.add("preview");
	prev.innerText = "Lorem Ipsum";

	var info = document.createElement("div");
	info.classList.add("meta");
	var icon = document.createElement("i");
	icon.className = "fa fa-joomla";
	var status = document.createElement("span");
	status.className = "contact-status online";
	info.appendChild(name);
	info.appendChild(prev);

	var wrap = document.createElement("div");
	wrap.classList.add("wrap");
	wrap.appendChild(status);
	wrap.appendChild(icon);
	wrap.appendChild(info);

	var contact = document.createElement("li");
	contact.classList.add("contact");
	contact.id = roomID;
	if (isActive) {
		contact.classList.add("active");
		roomTtl.innerText = roomName;
		// if (network.rooms[roomID].isProtected) {
		// 	roomTtl.contentEditable = false;
		// } else {
		// 	roomTtl.contentEditable = true;
		// }
	}
	contact.appendChild(wrap);
	contact.addEventListener("click", function () {
		var rooms = document.querySelectorAll(".contacts .contact");
		for (room of rooms) {
			room.classList.remove("active");
		}
		this.classList.add("active");
		roomTtl.innerText = roomName;
		// if (network.rooms[roomID].isProtected) {
		// 	roomTtl.contentEditable = false;
		// } else {
		// 	roomTtl.contentEditable = true;
		// }
		if (msgList.classList.contains("hidden")) {
			cnv.classList.add("hidden");
			msgList.classList.remove("hidden");
			textInput.removeAttribute("disabled");
			cnvBtn.classList.remove("fa-comments");
			cnvBtn.classList.add("fa-paint-brush");
		}
		network.activeRoom = roomID;
		clearMessages();
		appendHist(network.rooms[roomID].history);
	});

	var ul = document.querySelector(".contacts>ul");
	ul.appendChild(contact);
}
/*  ----------  Room Info   -----------  */


/*  -----------------------------------  */
/*  ------  Message Interaction  ------  */
/*  -----------------------------------  */

var msgWrap = document.querySelector('div.messages');
var textInput = document.querySelector('.message-input textarea');
var submitBtn = document.querySelector('.submit');
var msgList = document.querySelector('.messages ul');
var volBtn = document.querySelector("#volBtn");
var sentAudio = new Audio('mp3/your-turn.mp3');

/*  --------  Volume Control --------  */
volume = false;
volBtn.addEventListener("click", function () {
	if (this.classList.contains("fa-volume-off")) {
		this.classList.remove("fa-volume-off");
		this.classList.add("fa-volume-up");
		volume = true;
	} else {
		this.classList.remove("fa-volume-up");
		this.classList.add("fa-volume-off");
		volume = false;
	}
}); 

/*  --------  Screen Message  --------  */
appendMessage = function(msg) {
	// cambiar aquí el who por el nick si eso... 
	var who = "sent";
	if (msg.from != network.rooms[network.activeRoom].me) {
		who = "received";
	}
	var nodeS = document.createElement("span");
	nodeS.innerText = msg.when;
	var nodeP = document.createElement("p");
	if (who=="received") {
		var nodeS1 = document.createElement("span");
		if (msg.nick) {
			nodeS1.innerText = msg.nick;
		} else {
			nodeS1.innerText = "User "+msg.from;
		}
		nodeP.appendChild(nodeS1);
	}
	nodeT = document.createTextNode(msg.text);
	nodeP.appendChild(nodeT);
	var nodeLi = document.createElement('li');
  	nodeLi.className = who;
	nodeLi.appendChild(nodeS);
	nodeLi.appendChild(nodeP)
  	msgList.appendChild(nodeLi);
	msgWrap.scroll(0,msgWrap.scrollHeight);
}

appendHist = function (hist) {
	for (el of hist) {
		appendMessage(el);
	}
}

/*  -------  User Interaction  --------  */
document.addEventListener("msgSent", function() {
	textInput.value = "";
	if (volume) {sentAudio.play();}
})
submitBtn.addEventListener("click",function () {
	network.sendMessage(textInput.value);
});
textInput.addEventListener('keydown', function(e) {
	var charCode = (e.which) ? e.which : e.keyCode
    if (charCode == 13) { // enter key
        e.preventDefault();
        network.sendMessage(textInput.value);
    }
});

/*  -----------------------------------  */
/*  -------  Canvas Interaction  ------  */
/*  -----------------------------------  */

var cnv = document.querySelector(".messages canvas");
var ctx = cnv.getContext("2d");
var canvasx = 0; // will be the left offset
var canvasy = 0; // will be the top offset
var cnvBtn = document.querySelector("#cnvBtn");
var erase = document.querySelector("#eraseBtn");
erase.style.display = "none";

hideCanvas = function() {
	cnv.classList.add("hidden");
	msgList.classList.remove("hidden");
	textInput.removeAttribute("disabled");
	cnvBtn.classList.remove("fa-comments");
	cnvBtn.classList.add("fa-paint-brush");
	erase.style.display = "none";
}
showCanvas = function() {
	cnv.classList.remove("hidden");
	msgList.classList.add("hidden");
	textInput.disabled = "true";
	cnvBtn.classList.remove("fa-paint-brush");
	cnvBtn.classList.add("fa-comments");
	erase.style.display = "";
}

cnvBtn.addEventListener("click", function() {
	if (msgList.classList.contains("hidden")) {
		hideCanvas();
	} else {
		console.log("show canvas");
		showCanvas();
	}
	canvasx = cnv.getBoundingClientRect().x;
	canvasy = cnv.getBoundingClientRect().y;
});

erase.addEventListener("click", function () {
	ctx.clearRect(0, 0, cnv.width, cnv.height);
});

cnv.width = msgWrap.clientWidth;
cnv.height = msgWrap.clientHeight;
window.onresize = (e) => {
	cnv.width = msgWrap.clientWidth;
	cnv.height = msgWrap.clientHeight;
}

//Variables
var last_mousex = last_mousey = 0;
var mousex = mousey = 0;
var mousedown = false;
var tooltype = 'draw';

//Mousedown
cnv.addEventListener("mousedown", function(e) {
	last_mousex = mousex = parseInt(e.clientX-canvasx);
	last_mousey = mousey = parseInt(e.clientY-canvasy);
	mousedown = true;
});

//Mouseup
cnv.addEventListener("mouseup", function() {
	mousedown = false;
});

//Mousemove
cnv.addEventListener("mousemove", function(e) {
	mousex = parseInt(e.clientX-canvasx);
	mousey = parseInt(e.clientY-canvasy);
	if(mousedown) {
		ctx.beginPath();
		if(tooltype=='draw') {
			ctx.globalCompositeOperation = 'source-over';
			ctx.strokeStyle = "#cacaca";
			ctx.lineWidth = 3;
		} else {
			ctx.globalCompositeOperation = 'destination-out';
			ctx.lineWidth = 10;
		}
		ctx.moveTo(last_mousex,last_mousey);
    ctx.lineTo(mousex,mousey);
    ctx.lineJoin = ctx.lineCap = 'round';
		ctx.stroke();
	}
	last_mousex = mousex;
	last_mousey = mousey;
});


// every user is connected to general on login
newRoom = new Room("general",true);
roomName = network.connect(newRoom);
appendRoom(newRoom.screenName,newRoom.id,true);

newRoom = new Room("test",false);
roomName = network.connect(newRoom);
appendRoom(newRoom.screenName,newRoom.id,false);

document.addEventListener('roomMetaUpdate',function () {
	console.log(network.rooms[network.activeRoom].info);
})

window.onbeforeunload = function() {
	network.disconnect();
}

clearMessages = function() {
	var messages = document.querySelector("div.messages");
	messages.removeChild(messages.querySelector("ul"));
	var newUl = document.createElement("ul")
	messages.appendChild(newUl);
	msgList = document.querySelector('.messages ul');
}