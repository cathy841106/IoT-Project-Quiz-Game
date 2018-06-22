# QUIZ Game

### Introduction
This game is a simple quiz game that combines image recognition and IoT technology. Player can set their favorite gestures , and then during the game using their own gestures to answer. The game has 8 questions, player should answer in time, answering correctly can get 1 score. Each time a question is completed, the score will be dynamically displayed on the seven-segment display.

---

### Things Needed

#### Hardware
  - A Raspberry Pi with Raspian, internet, SSH, with Node.js installed
  - BreadBoard x1
  - Seven segment display x1
  - Camera x1 (can be webcam USB or rpi camera etc.)
  - T-Cobbler Breakout + GPIO Cable for RPI
  - Male-to-Male DuPont Line x9
  - carbon-film resistor x1
 ##### BreadBoard Layout:
![image](https://github.com/cathy841106/IoT-Project-Quiz-Game/blob/master/ReadMe%20picture/Breadboard%20Layout.png)
#### Software
  - onoff module for Node.js
  - socket.io module for Node.js
  - [Resemble.js](https://github.com/HuddleEng/Resemble.js?files=1) module for image recognition
  
---
  
### Get Pi Camera or Webcam Ready
Camera is important for our project, you can insert webcam USB or Pi Camera.
Here we use Pi Noir Camera for example.
1. First, insert Noir Camera's cable line into Raspberry Pi port (blue part should face web port, like picture below):
![image](https://github.com/cathy841106/IoT-Project-Quiz-Game/blob/master/ReadMe%20picture/camera.jpg)
2. Then, to make camera available in Pi, install V4L2 driver into your Raspberry Pi.
* First download v4l-utils from [v4l-utils](https://github.com/Distrotech/v4l-utils) to your pi.
* Follow [Official V4L2 driver](https://www.raspberrypi.org/forums/viewtopic.php?t=62364) tutorial to install V4L2 driver
3. Create an html file, add below code to ckeck if camera can be detected:

```  
if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
   console.log("enumerateDevices() not supported.");
}

// List cameras and microphones.
navigator.mediaDevices.enumerateDevices()
.then(function(devices) {
  devices.forEach(function(device) {
   console.log(device.kind + ": " + device.label + " id = " + device.deviceId);  
   });
 })
.catch(function(err) {
  console.log(err.name + ": " + err.message);
});
```
---
### Install Node.js

1. Update your system package list:
```
pi@cathy:~ $ sudo apt-get update
```

2. Upgrade all your installed packages to their latest version:
```
pi@cathy:~ $ sudo apt-get dist-upgrade
```

3. To download and install newest version of Node.js, use the following command:
```
pi@cathy:~ $ curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
```

4. Now install it by running:
```
pi@cathy:~ $ sudo apt-get install -y nodejs
```

5. Check that the installation was successful, and the version number of Node.js with:
```
pi@cathy:~ $ node -v
```
---
### Install Socket.io 
In our project, we will use websocket to pass our score to webserver dynamically. To use websocket, we should install socket.io package.

1. Create a new directory to put  package and static html file:
```
pi@cathy:~ $ mkdir project
```
2. Change path to our project directory:
```
pi@cathy:~ $ cd project
```
3. Create a new directory to put socket.io.js:
```
pi@cathy:~/project $ mkdir socket.io
```
4. Change to socket.io directory, then create a new js file:
```
pi@cathy:~/project $ cd socket.io
```
```
pi@cathy:~/project/socket.io $ nano socket.io.js
```
5. Go to following link [socket.io](https://cdnjs.com/libraries/socket.io) to copy the code, and paste to socket.io.js.

---
### Install onoff package
To interact with Raspberry Pi GPIO, install onoff package.

1. First remember to update and upgrade, then use npm to install:
```
pi@cathy:~/project $ sudo npm install onoff
```
---
### Install Resemble.js
We will use image recognition technology to compare gesture similarity, here we use Resemble.js to fulfill our need.

1. Download Resemble.js from following Github link [Resemble.js](https://github.com/HuddleEng/Resemble.js?files=1), remember to put directory in our project directory.

---
### Create game.html

1. Check if your path is in project directory, if not, change path to project directory:
```
pi@cathy:~$ cd project
```
2. Create game.html file:
```
pi@cathy:~/project $ nano game.html
```
3. Copy following code to game.html:
```
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Quiz Game</title>
    <script src="Resemble.js/resemble.js"></script>
    <script src="socket.io/socket.io.js"></script>
</head>
<body>
    <h1 id="topTitle" style="text-align:center;">Take a picture of gesture you want for the game!</h1>
    <div>    
       <div id="innerFrame1" style="text-align:center;background-color:#FFAC55;">    
         <video id="video" width="420" height="300" autoplay="autoplay"></video>
         <button id="snapBtn">Take Picture</button>
       </div>
       <div id="innerFrame2" style="text-align:center;background-color:#CCEEFF;">   
         <canvas id="canvas" width="420" height="300"></canvas>
         <button id="startBtn">Start Game!</button>
       </div>
       <div id="innerFrame3" style="text-align:center;background-color:#CCAAAA;">   
           <b id="anstext" style="font-size:20px;display:none;">你的回答:</b>
           <input type="text" id="ansIp" style="display:none;">
           <button id="ansBtn" style="display:none;">Send</button>
       </div>
    </div>
    
    <script type="text/javascript" >   
	  var socket = io.connect('http://localhost:8080', {transports: ['websocket', 'polling', 'flashsocket']}); //load socket.io-client and connect to the host that serves the page
      var video = document.getElementById('video');  
      var video2;  
      var canvas2;
      var context2;
      var startBtn = document.getElementById('startBtn');
      var topTitle = document.getElementById('topTitle');
      var splitIV;
      var countdownIV;
      var gesture1;
      var gesture2;
      var g1URL;
      var g2URL;
      var anstext = anstext = document.getElementById('anstext');        
      var ansIp = document.getElementById('ansIp');
      var ansBtn = document.getElementById('ansBtn');
      var quiz = ["有個病人到醫院去做檢查,結果醫生告訴病人說你要看開一點,請問這個病人得了什麼病?","什麼樣的桶子永遠裝不滿?","什麼路不能走?"
                 ,"想在台灣從政,除了台語、國語還要會哪一種語言?","聖女貞德是哪一國人?","打什麼東西,不必花力氣?","什麼球不能踢?","為什麼蝙蝠會經常倒吊著? "];
      var ans = ["鬥雞眼","馬桶","網路","肢體語言","天國","打瞌睡","鉛球","胃下垂"];
      var q = 0;
      var t = 20;
      var score = 0;
      
      startBtn.disabled = true;
      getMedia(video);

      //Elements for taking the snapshot
      var canvas = document.getElementById('canvas');
      var context = canvas.getContext('2d');

      //Trigger photo take button
      document.getElementById("snapBtn").addEventListener("click", function() {
        context.drawImage(video, 0, 0, 420, 300);
        startBtn.disabled = false;
        //save picture
        gesture1 = document.createElement('img');
        gesture1.src = canvas.toDataURL('image/png');
        g1URL = gesture1.src;
       });
       
      //Trigger start game button
      startBtn.addEventListener("click", function() {
        topTitle.textContent = "Game Start!";
        document.getElementById('innerFrame1').innerHTML = '<p id="quiz" style="font-size:25px;">' + quiz[q] + '</p>';
        document.getElementById('innerFrame2').innerHTML = '<p style="font-size:20px;">make gestures toward the camera to answer!</p>' 
                                          +'<video id="video2" width="420" height="300" autoplay="autoplay"></video>' 
                                          +'<canvas id="canvas2" width="420" height="300" style="display:none;"></canvas>'
                                          +'<b id="countdown" style="font-size:25px;">10</b>';                               
          
        video2 = document.getElementById('video2');
        gesture2 = document.createElement('img');
        canvas2 = document.getElementById('canvas2');
        context2 = canvas2.getContext('2d');
        getMedia(video2); 
        
        splitIV = window.setInterval("getSplit()",250);  
        countdownIV = window.setInterval("showTime()",1000);
        
       });
        
      //Trigger answer button
      ansBtn.addEventListener("click", function() {
        window.clearInterval(countdownIV);
        if(ansIp.value == ans[q]){  //answer right
            alert("答案正確!");
            score++;   //分數加1  
            console.log("score:" + score);
        }
        else{
            alert("答案錯誤!正確答案是'" + ans[q] + "'");
        }
        
        socket.emit("score", score);
        anstext.style.display = "none";
        ansIp.style.display = "none";
        ansBtn.style.display = "none"; 
          
        if(q<8){  //still have quistion
            q+=1;  
            document.getElementById('quiz').innerHTML = quiz[q];  
            //gesture2.src = "";
            splitIV = window.setInterval("getSplit()",250);  
            t=20;
            countdownIV = window.setInterval("showTime()",1000);
        }
        else{
            topTitle.textContent = "Game Over!";
            document.getElementById('innerFrame1').innerHTML = '<p style="font-size:25px;">Your score:</p>' + score;
            document.getElementById('innerFrame2').innerHTML = ''; 
        }
      });
        
      // Get access to the camera
      function getMedia(v){
        navigator.mediaDevices.getUserMedia({ audio:false,video:true })
        .then(function(stream) {
           v.srcObject = stream;
           v.play();
        })
        .catch(function(err){
           prompt(err.name + ": " + err.message);
         });
       }
        
      function getSplit()
      {
          context2.drawImage(video2, 0, 0, 420, 300);
          gesture2.src = canvas2.toDataURL('image/png');
          g2URL = gesture2.src;
                             
          resemble(g1URL).compareTo(g2URL).ignoreColors().onComplete(function(data){  
              console.log("misMatchPercentage:" + data.misMatchPercentage);
              if(data.misMatchPercentage <= 20){   
                  console.log("misMatchPercentage<=20:" + data.misMatchPercentage);
                  anstext.style.display = "block";
                  ansIp.style.display = "block";
                  ansBtn.style.display = "block";    
                  window.clearInterval(splitIV);     
              }
              else{
                  console.log("misMatchPercentage>20");
              }
          });
            
      }
               
      //show countdown
      function showTime() {
       if(q<8){          
         t-=1;
         document.getElementById('countdown').innerHTML= t;
    
         if(t==0) {
            alert("時間到!");
            socket.emit("score", score);
            t=20;
            q+=1;  
            document.getElementById('quiz').innerHTML = quiz[q];    
         }
       }
       else{
         window.clearInterval(splitIV);
         topTitle.textContent = "Game Over!";
         document.getElementById('innerFrame1').innerHTML = '<p style="font-size:25px;">Your score:</p>' + score;
         document.getElementById('innerFrame2').innerHTML = '';
       }          
      }       
       
    </script>

      
</body>
</html>
```
---
### Create webserver.js
1. Create webserver.js file:
```
pi@cathy:~/project $ nano webserver.js
```
2. Copy following code to webserver.js:
```
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
```
---
### Run Webserver And Start Our Game

1. Open command line, input below command to execute webserver:
```
pi@cathy:~\project$ node webserver.js
```
If command line display nothing, webserver is running.

2. Open game.html to start our game, You should see website like below:
![image](https://github.com/cathy841106/IoT-Project-Quiz-Game/blob/master/ReadMe%20picture/run%20game.png)








