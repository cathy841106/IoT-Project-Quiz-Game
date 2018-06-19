var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http)  //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var b = new Gpio(4, 'out'); //use GPIO pin 4 as output
var a = new Gpio(17, 'out'); //use GPIO pin 17 as output
var f = new Gpio(27, 'out'); //use GPIO pin 27 as output
var g = new Gpio(22, 'out'); //use GPIO pin 22 as output
var h = new Gpio(18, 'out'); //use GPIO pin 18 as output
var c = new Gpio(23, 'out'); //use GPIO pin 23 as output
var d = new Gpio(24, 'out'); //use GPIO pin 24 as output
var e = new Gpio(25, 'out'); //use GPIO pin 25 as output

http.listen(8080); //listen to port 8080

function handler (req, res) { //create server
  fs.readFile(__dirname + '/game.html', function(err, data) { //read file index.html in public folder
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
      return res.end("404 Not Found");
    } 
    res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
    res.write(data); //write data from game.html
    return res.end();
  })};


io.sockets.on('connection', function (socket) {// WebSocket Connection
  var score = 0; //static variable for current status
  socket.on('score', function(data) { //get score from client
    score = data;  
       if(score == 0){
          b.writeSync(1);
          a.writeSync(1);
          f.writeSync(1);
          g.writeSync(0);
          h.writeSync(1);
          c.writeSync(1);
          d.writeSync(1);
          e.writeSync(1);          
       }
       else if(score == 1){
          b.writeSync(1);
          a.writeSync(0);
          f.writeSync(0);
          g.writeSync(0);
          h.writeSync(0);
          c.writeSync(1);
          d.writeSync(0);
          e.writeSync(0);   
       }
       else if(score == 2){
          b.writeSync(1);
          a.writeSync(1);
          f.writeSync(0);
          g.writeSync(1);
          h.writeSync(0);
          c.writeSync(0);
          d.writeSync(1);
          e.writeSync(1);             
       }
       else if(score == 3){
          b.writeSync(1);
          a.writeSync(1);
          f.writeSync(0);
          g.writeSync(1);
          h.writeSync(1);
          c.writeSync(1);
          d.writeSync(1);
          e.writeSync(0);             
       }
       else if(score == 4){
          b.writeSync(1);
          a.writeSync(0);
          f.writeSync(1);
          g.writeSync(1);
          h.writeSync(1);
          c.writeSync(1);
          d.writeSync(0);
          e.writeSync(0);              
       }
       else if(score == 5){
          b.writeSync(0);
          a.writeSync(1);
          f.writeSync(1);
          g.writeSync(1);
          h.writeSync(1);
          c.writeSync(1);
          d.writeSync(1);
          e.writeSync(0);             
       }
       else if(score == 6){
          b.writeSync(0);
          a.writeSync(1);
          f.writeSync(1);
          g.writeSync(1);
          h.writeSync(1);
          c.writeSync(1);
          d.writeSync(1);
          e.writeSync(1);            
       }
       else if(score == 7){
          b.writeSync(1);
          a.writeSync(1);
          f.writeSync(0);
          g.writeSync(0);
          h.writeSync(1);
          c.writeSync(1);
          d.writeSync(0);
          e.writeSync(0);            
       }
       else if(score == 8){
          b.writeSync(1);
          a.writeSync(1);
          f.writeSync(1);
          g.writeSync(1);
          h.writeSync(1);
          c.writeSync(1);
          d.writeSync(1);
          e.writeSync(1);          
       }
    console.log(score); 
  });
});
