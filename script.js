(function (){
    var idInput = document.getElementById('idInput');
    var message = document.getElementById('idMessage');
    var conn = null;
    var sendButton = document.getElementById('send');
    var chat = document.getElementById('chat');
    var messages = "";
    var status = document.getElementById('status');

    function initialize() {
        // Create own peer object with connection to shared PeerJS server
        peer = new Peer(null, {
            debug: 2
        });
        peer.on('open', function (id) {
            document.getElementById('myId').innerHTML = id;

            // Workaround for peer.reconnect deleting previous id
            if (peer.id === null) {
                console.log('Received null id from peer open');
                peer.id = lastPeerId;
            } else {
                lastPeerId = peer.id;
            }
            console.log('ID: ' + peer.id);
         
        });
        peer.on('connection', function (c) {
            // Allow only a single connection
            if (conn) {
                c.on('open', function() {
                    c.send("Already connected to another client");
                    setTimeout(function() { c.close(); }, 500);
                });
                return;
            }
            conn = c;
            console.log("Connected to: " + conn.peer);
            status.innerHTML = "Connected to " + conn.peer;
            ready();
        });
    }

    function ready(){
        conn.on('data', function(data){
            console.log('Received data: ' + data);
            var formatedReceived =  'Peer: ' + data + '</br>'
            messages = messages + formatedReceived;
            chat.innerHTML = messages;
        });
    }
   
    function join(){
        // Close old connection
        if (conn) {
            conn.close();
        }

        conn = peer.connect(idInput.value,{
            reliable: true
        });

        conn.on('open', function (){
            console.log("Conected to " + conn.peer);
            status.innerHTML = "Connected to " + conn.peer;

        });

        conn.on('data', function(data){
            console.log('Received data: ' + data);
            var formatedReceived =  'Peer: ' + data + '</br>'
            messages = messages + formatedReceived;
            chat.innerHTML = messages;
        });
    }

   sendButton.onclick = function(){
        console.log('Sent: ' + message.value)

        if(conn.open){
            conn.send(message.value);
            var formatedMessage =  'You: ' + message.value + '</br>'
            messages = messages + formatedMessage;
            chat.innerHTML = messages
        }
    }

    document.getElementById("connect").addEventListener("click", join); 

    initialize();

} ())