var d3 = d3

var gameOptions = {
  height: 450,
  width: 700,
  nEnemies: 20,
  padding: 20
};

var gameStats = {
  score: 0,
  bestScore: 0,
  collisions: 0
};

var lastCollision = 0;

// add an svg to the screen
var svg = d3.select('.container').append('svg:svg')
  .attr('margin', '0 auto')
  .attr('width', gameOptions.width)
  .attr('height', gameOptions.height);

// instantiate game lists
var enemyList = [];
var playerList = [];
var scoreList = [];

// findRandomPosition returns an object with cx and cy properties
// cx and cy are randomly generated based on gameOptions
var findRandomPosition = function(){
  var coords = {};
  coords.cx = Math.floor(Math.random() * (gameOptions.width - 100)) + 50;
  coords.cy = Math.floor(Math.random() * (gameOptions.height - 100)) + 50;
  return coords;
};

// functional instantiator of Enemies
var createEnemy = function(){
  var newEnemy = findRandomPosition(); // this returns an obj {cx: #, cy: #}
  newEnemy.r = 7;
  newEnemy.stroke = 'black';
  newEnemy['stroke-width'] = 1;
  newEnemy.fill = 'black';
  return newEnemy;
};

// create player in the center of the container
var createPlayer = function () {
  var newPlayer = findRandomPosition(); // this returns an obj {cx: #, cy: #}
  newPlayer.r = 7;
  newPlayer.stroke = 'red';
  newPlayer['stroke-width'] = 1;
  newPlayer.fill = 'blue';
  return newPlayer;
};

// populates enemyList with the correct number of enemies
for (var i = 0; i < gameOptions.nEnemies; i ++) {
  enemyList.push(createEnemy());
}

// populate playerList with the one player
playerList.push(createPlayer());
scoreList.push(gameStats);

var tweenWithCollisionDetection = function(enemyData){

  var enemy = d3.select(this);

  var newX = enemyData.cx
  var oldX = parseFloat(enemy.attr('cx'));
  var newY = enemyData.cy
  var oldY = parseFloat(enemy.attr('cy'));

  return function (t) {
    // Alternative:
    // use getAttribute if you want a constant coordinate
    // console.log(this.getAttribute('cx'))

    var pathX = oldX + (newX - oldX) * t;
    var pathY = oldY + (newY - oldY) * t;

    var player = playerList[0]
    var diffX = pathX - player.cx;
    var diffY = pathY - player.cy;

    if (Math.sqrt(diffX * diffX + diffY * diffY) < (enemyData.r + player.r)) {
      console.log('collision!!!', pathX, player.cx);
      var rightNow = Date.now();
      if (rightNow - lastCollision > 1000){
        lastCollision = Date.now();
        gameStats.collisions += 1;
        updateScore(scoreList);
      }
    }
  };
};

var update = function(updateData) {

  // data join
  var enemyNodes = svg.selectAll('.enemy')
    .data(updateData, function(d, i) { return i;});

  // update
  // update old elements as needed
  enemyNodes
    .transition().duration(3000)
      .attr('cx', function(d){ return d.cx ;})
      .attr('cy', function(d){ return d.cy ;})
      .style("fill", "black")
      .tween('custom', tweenWithCollisionDetection);
  // enter
  // create new elements
  enemyNodes.enter().append('circle')
    .attr('class', 'enemy')
    .attr('cx', function(d){ return d.cx; })
    .attr('cy', function(d){ return d.cy; })
    .attr('fill', function(d){ return d.fill; })
    .attr('r', function(d){return d.r; })
    .attr('stroke', function(d){return d.stroke; })
    .attr('stroke-width', function(d){return d['stroke-width']; });

};

var updatePlayer = function(updateData) {

  // data join
  var playerNodes = svg.selectAll('.player')
    .data(updateData, function(d, i) { return i;});

  // enter
  // create new elements
  playerNodes.enter().append('circle')
    .attr('class', 'player')
    //.attr('cx', function(d){ return d.cx; })
    //.attr('cy', function(d){ return d.cy; })
    .attr("transform", function(d){
      return "translate(" + d.cx + "," + d.cy + ")"
    })
    .attr('fill', function(d){ return d.fill; })
    .attr('r', function(d){return d.r; })
    .attr('stroke', function(d){return d.stroke; })
    .attr('stroke-width', function(d){return d['stroke-width']; })
    .call(drag)
};

var updateScore = function(scoreData) {


  // data join
  var currentScoreText = d3.select('.current').selectAll('text')
    .data(scoreData, function(d, i) { return d;});

  // update
  currentScoreText
    .text(function(d){ return d.score ;});

  currentScoreText.enter().append('text')
    .text(function(d){ return d.score ;});

  // data join
  var bestScoreText = d3.select('.high').selectAll('text')
    .data(scoreData, function(d, i) { return d;});
  // update
  bestScoreText
    .text(function(d){ return d.bestScore ;});

  bestScoreText.enter().append('text')
    .text(function(d){ return d.bestScore ;});

    // data join
  var collisionsText = d3.select('.collisions').selectAll('text')
    .data(scoreData, function(d, i) { return d;});
  // update
  collisionsText
    .text(function(d){ return d.collisions ;});

  collisionsText.enter().append('text')
    .text(function(d){ return d.collisions ;});
};



// create initial enemies in game
update(enemyList);

var dragmove = function(d) {
  d.cx = d3.event.x;
  d.cy = d3.event.y;
  console.log('moving')
  d3.select(this).attr("transform", "translate(" + d.cx + "," + d.cy + ")");
};

var drag = d3.behavior.drag()
    .on('drag', dragmove);

var checkCollisions = function () {
  var player = playerList[0];
  for ( var i = 0 ; i < enemyList.length; i++) {
    var dheight= enemyList[i].cx - player.cx;
    var dwidth = enemyList[i].cy - player.cy;
    // check if distance between 2 circles is less than 2r
    if (Math.sqrt(dheight * dheight + dwidth * dwidth) < (2 * player.r)) {
      return true;
    }
  }
  return false;
};

var updateEnemyInterval = setInterval(function(){
  for (var i = 0; i < enemyList.length; i++) {
    var newPosition = findRandomPosition();
    enemyList[i].cx = newPosition.cx;
    enemyList[i].cy = newPosition.cy;
  }
  update(enemyList);
}, 3000);

var updateTick = setInterval(function(){
  updatePlayer(playerList);
}, 10);

var updateScoreBoardInterval = setInterval(function(){
  gameStats.score += 1;
  if (checkCollisions()) {
    // check if score > bestscore
    if (gameStats.score > gameStats.bestScore) {
      gameStats.bestScore = gameStats.score;
    }
    gameStats.score = 0;
  }
  updateScore(scoreList);
}, 30);
