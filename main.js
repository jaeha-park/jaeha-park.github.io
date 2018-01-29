const socket = io('https://stream1802.herokuapp.com/');

$('#div-chat').hide();

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

socket.on('USER-CHECK', () => alert('same name exist'));


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


var peer = new Peer({key: 't6eghbkjshdgf1or'});

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
