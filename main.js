const socket = io('https://stream1802.herokuapp.com/');


var room ="";
var name = "";
var num=0;
var text = "";
var customConfig;

$('#div-chat').hide();

$.ajax({
  url: "",
  data: {
    ident: "jaehaPark",
    secret: "c4de3e18-04b8-11e8-a664-7786df152cea",
    domain: "jaeha-park.github.io",
    application: "default",
    room: "default",
    secure: 1
  },
  success: function (data, status) {
    customConfig = data.d;
    console.log(customConfig);
  },
  async: false
});

socket.on('USER-INPUT',arrUserInfo =>{

  $('#div-chat').show();
  $('#div-sign').hide();

    console.log("user enter : "+arrUserInfo);
    arrUserInfo.forEach(user => {
        const { ten, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${ten}</li>`);
    });

    socket.on('USER-INFO',user =>{
      console.log(user);
          const {ten, peerId} = user;
          $('#ulUser').append(`<li id="${peerId}">${ten}</li>`);
    });

    socket.on('USER-DELETE',peerId => {
        $(`#${peerId}`).remove();
        console.log("user-delete : " +peerId);
      });
});

socket.on('USER-CHECK', () => {
  $('#div-sign').show();
  $('#div-chat').hide();
  alert('same name exist');
});


function openStream(){
  const config = {audio: true, video:true};
  return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag,stream){
  const video = document.getElementById(idVideoTag);
  video.srcObject = stream;
  video.play();
}

//openStream()
//.then(stream => playStream('localStream',stream));


var peer = new Peer({
  key: 'peerjs',
  host: 'mypeer1802.herokuapp.com',
  secure: true,
  port: 443,
  config: customConfig
});

peer.on('open', id => {
  $('#my-peer').append(id);
/*  $('#btnSignUp').click( () =>{
    //const username = $('#txtUsername').val();
    getName('room1',id);
    console.log("name : " + name + " peerid : "+ id);
    socket.emit('USER-CONNECT',{ ten: name, peerId: id });
  });
*/
$('.button_click').click( () =>{
    //const username = $('#txtUsername').val();
    const room = $(this).attr('id');
    getName(room,id);
    console.log("name : " + name + " peerid : "+ id);
    socket.emit('USER-CONNECT',{ ten: name, peerId: id });
  });
});

$('#ulUser').on('click','li', function(){
  const id = $(this).attr('id');
  openStream()
  .then(stream =>{
    playStream('localStream',stream);
    const call = peer.call(id,stream);
    call.on('stream',remoteStream => playStream('remoteStream',remoteStream));
  });
});

//caller
$('#btnCall').click(() =>{
  const id = $('#remoteId').val();
  openStream()
  .then(stream =>{
    playStream('localStream',stream);
    const call = peer.call(id,stream);
    call.on('stream',remoteStream => playStream('remoteStream',remoteStream));
  });
});

//callee
peer.on('call',call => {
  openStream()
  .then(stream=>{
    call.answer(stream);
    playStream('localStream',stream);
    call.on('stream',remoteStream => playStream('remoteStream',remoteStream));
  });
});

/////chat_msg
socket.on("server-send-rooms", function(data){
	 data.map(function(r){
	});
});

socket.on("server-send-room-socket", function(data){
  console.log("room-socket = : = "+data);
});

socket.on("server-chat",function(data){
  var count = data.length;
  console.log("data length = : = "+count);
   text =  text + data + "</p>"+"</div>";
  console.log("text--------->: "+text);
  $("#txtwindow").append(text);
  text="";
});

socket.on("server-name",function(data){

  console.log("chat-user-info = : ="+data+" / "+name);
  text="";
  dt = new Date();
  time = dt.getHours() + ":" + dt.getMinutes();
  console.log(time);
  //right
  if(data == name){
      text = "<div class='container darker'>"+'<span class="time-left">'+time+'</span>'+'<img src="/public/img/chat.png" alt="Avatar" style="width:80%;" class="right">'+"<p class='text_r'>" +name +"</p> <p class='text_or'>";
  //left
  }else{
    text = "<div class='container'>"+'<span class="time-right">'+time+'</span>'+'<img src="/public/img/chat.png" alt="Avatar" style="width:80%;">'+"<p class='text_l'>" +data +"</p> <p class='text_ol'>";
  }
});
/////////////////////////////////

////////////////////draw
var prepareCanvas = function () {
  var canDiv = document.getElementById("canvasDiv");
  var canvasWidth="400";
  var canvasHeight = "400";
  canvas     = document.createElement("canvas");
  canvas.setAttribute("width", canvasWidth);
  canvas.setAttribute("height", canvasHeight);
  canvas.setAttribute("id", 'canvas');
  canDiv.appendChild(canvas);
 context = canvas.getContext("2d");

  var clickX = new Array();
  var clickY = new Array();
  var clickDrag = new Array();

  var paint;

  function addClick(x,y,draggin){
    clickX.push(x);
    clickY.push(y);
    clickDrag.push(draggin);
  }

  function redraw(clickDrag,clickX,clickY){

    context.strokeStyle = "#df4b26";
    context.lineJoin    = "round";
    context.lineWidth   = 5;

    for(i = 0; i < clickX.length;i ++){
      context.beginPath();
      if(clickDrag[i] && i){
        context.moveTo(clickX[i-1], clickY[i-1]);
      }else{
        context.moveTo(clickX[i]-1, clickY[i]);
      }

     context.lineTo(clickX[i], clickY[i]);
     context.closePath();
     context.stroke();
    }
  }


socket.on("drawing",function(msg){
    redraw(msg.drag, msg.x, msg.y);
})

  $("#canvas").mousedown(function(e){
    var mouseX = e.pageX - this.offsetLeft;
    var mouseY = e.pageY - this.offsetTop;

    paint = true;
    addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
    redraw(clickDrag, clickX, clickY);
  });

  $("#canvas").mousemove(function(e){
    if(paint){
      addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
      redraw(clickDrag, clickX, clickY);
    }

  });

  $('#canvas').mouseup(function(e){
    paint = false;
    socket.emit("drawing", {drag : clickDrag, x : clickX, y : clickY});
  });

  $('#canvas').mouseleave(function(e){
    paint = false;
    socket.emit("drawing", {drag : clickDrag, x : clickX, y : clickY});
  });
}


///////////////////////////////


function getName(room,id){
name = prompt("이름을 입력하세요.", "");
  if(id != ""){
    socket.emit('USER-INFO', { ten: name, peerId: id });
    $("#room-connecter").html(room);
    socket.emit("room-num",room);
  }else{
    console.log("retry");
  }
}

/////main
$(document).ready(function(){

var out = document.getElementById("txtwindow");
var isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;

$("#flip").click(function(){
     $("#panel").slideToggle("slow");
     if(num ==0){
       num=1;
       $("#font").attr("class","glyphicon glyphicon-chevron-up");
     }else{
       num=0;
       $("#font").attr("class","glyphicon glyphicon-chevron-down");
     }
 });

function chat_msg(){
    socket.emit("user-name", name);
    socket.emit("user-chat", $("#txtMessage").val());
    console.log($("#txtMessage").val());
    $("#txtMessage").val("");
  }

  $('#txtMessage').keyup(function(e){
      textmsg = $(this).val();
      console.log("length: "+textmsg.length);
      if (e.keyCode == 13) chat_msg();
      if(isScrolledToBottom)
      out.scrollTop = out.scrollHeight - out.clientHeight;
  });

  $("#btnChat").click(function(){
      chat_msg();
      if(isScrolledToBottom)
    out.scrollTop = out.scrollHeight - out.clientHeight;
    $("#txtMessage").val("");
   });

   prepareCanvas();

});
