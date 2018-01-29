const socket = io('https://stream1802.herokuapp.com/');
//const socket = io('https://localhost:3000');

var room ="";
var name = "";
var num=0;

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


var peer = new Peer({key: 'peerjs', host: 'mypeer1802.herokuapp.com', secure: true , port: 443 });

peer.on('open', id => {
  $('#my-peer').append(id);
  $('#btnSignUp').click( () =>{
    const username = $('#txtUsername').val();
    console.log("peerId client = : "+id);
    socket.emit('USER-CONNECT',{ ten: username, peerId: id });
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
	  // $("#dsRoom").html("");
	 data.map(function(r){
	   //$("#dsRoom").append(name+"<h4 class=''>"+r+"</h4>");
	});
});

socket.on("server-send-room-socket", function(data){
  console.log(data);
	//$("#room-connecter").html(data);
});

socket.on("server-chat",function(data){
  var count = data.length;
  console.log("data length = : = "+count);
   text =  text + data + "</p>"+"</div>";
  console.log("text--------->: "+text);
  $("#txtwindow").append(text);
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
	//alert(data);
});
/////////////////////////////////

function getName(room,id){
name = prompt("이름을 입력하세요.", "");
  if(id != ""){
    socket.emit('USER-INFO', { ten: name, peerId: id });
    $("#room-connecter").html(room);
    socket.emit("room-num",room);
    $('#room_enter').show();    // 값 입력 후 stream video channel 로 enter
    $('#room-list').hide();     // 입장시 id 입력 창
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
    socket.emit("user-chat", $("#txtMessage").val());
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
   });
//prepareCanvas();
});
