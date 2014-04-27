var gameOptions = {
  // height: 450,
  // width: 700,
  height: window.innerHeight,
  width: window.innerWidth,
  nEnemies: 20,
  padding: 20
};

var gameStats = {
  score: 0,
  bestScore: 0,
  collisions: 0
};

var lastCollision = 0;

// instantiate game lists
var enemyList = [];
var playerList = [];
var scoreList = [];

// add an svg to the screen
var svg = d3.select('.container').append('svg:svg')
  .attr('width', gameOptions.width * .93)
  .attr('height', gameOptions.height * .75);

// ------------------------- HELPER FUNCTIONS TO HELP THINGS ------------------------- //

// findRandomPosition returns an object with cx and cy properties
// cx and cy are randomly generated based on gameOptions
var findRandomPosition = function(){
  var coords = {};
  coords.cx = Math.floor(Math.random() * (gameOptions.width - 100)) + 50;
  coords.cy = Math.floor(Math.random() * (gameOptions.height - 100)) + 50;
  return coords;
};

// callback used for collision detection during updates
var tweenWithCollisionDetection = function(enemyData){

  var enemy = d3.select(this);

  var newX = enemyData.cx;
  var oldX = parseFloat(enemy.attr('cx'));
  var newY = enemyData.cy;
  var oldY = parseFloat(enemy.attr('cy'));

  var svg = d3.select('svg')

  return function (t) {
    // Alternative:
    // use getAttribute if you want a constant coordinate
    // console.log(this.getAttribute('cx'))

    var pathX = oldX + (newX - oldX) * t;
    var pathY = oldY + (newY - oldY) * t;

    var player = playerList[0];
    var diffX = pathX - player.cx;
    var diffY = pathY - player.cy;

    // if this is true, a collision has occurred
    if (Math.sqrt(diffX * diffX + diffY * diffY) < (enemyData.r + player.r)) {
      var rightNow = Date.now();
      if (rightNow - lastCollision > 1000){
        lastCollision = Date.now();
        gameStats.collisions += 1;
        updateScore(scoreList);
        if (gameStats.score > gameStats.bestScore) {
          gameStats.bestScore = gameStats.score;
        }
        gameStats.score = 0;
        d3.select(".player").transition().duration(1000)
          .style("fill-opacity", gameStats.collisions * 0.05);
      }
    }
  };
};

// ------------------------- INSTANTIATORS TO CREATE THINGS ------------------------- //

// functional instantiator of Enemies
var createEnemy = function(){
  var newEnemy = findRandomPosition(); // this returns an obj {cx: #, cy: #}
  newEnemy.r = 20;
  newEnemy.stroke = 'black';
  newEnemy['stroke-width'] = 1;
  newEnemy.fill = 'black';
  return newEnemy;
};

// create player in the center of the container
var createPlayer = function () {
  var newPlayer = findRandomPosition(); // this returns an obj {cx: #, cy: #}
  newPlayer.r = 20;
  newPlayer.stroke = 'red';
  newPlayer['stroke-width'] = 1;
  newPlayer.fill = 'black';
  newPlayer.opacity = 0;
  return newPlayer;
};

// ------------------------- UPDATE FUNCTIONS TO UPDATE D3 ------------------------- //

// updates the dom with enemy information
var update = function(updateData) {

  // data join
  var enemyNodes = svg.selectAll('.enemy')
    .data(updateData, function(d, i) { return i;});

  // update old elements as needed
  enemyNodes
    .transition().duration(3000)
      .attr('cx', function(d){ return d.cx ;})
      .attr('cy', function(d){ return d.cy ;})
      .style("fill", "black")
      .tween('custom', tweenWithCollisionDetection);
  // enter, create new elements
  enemyNodes.enter().append('circle')
    .attr('class', 'enemy')
    .attr('cx', function(d){ return d.cx; })
    .attr('cy', function(d){ return d.cy; })
    .attr('fill', function(d){ return d.fill; })
    .attr('r', function(d){return d.r; })
    .attr('stroke', function(d){return d.stroke; })
    .attr('stroke-width', function(d){return d['stroke-width']; });
};

// updates the dom with player information
var updatePlayer = function(updateData) {

  // data join
  var playerNodes = svg.selectAll('.player')
    .data(updateData, function(d, i) { return i;});

  // enter, create new elements
  playerNodes.enter().append('circle')
    .attr('class', 'player')
    .attr('transform', function(d){
      return 'translate(' + d.cx + ',' + d.cy + ')';
    })
    .attr('fill', function(d){ return d.fill; })
    .attr('r', function(d){return d.r; })
    .attr('stroke', function(d){return d.stroke; })
    .attr('stroke-width', function(d){return d['stroke-width']; })
    .call(drag);
};

var updateScore = function(scoreData) {

  // current score data join
  var currentScoreText = d3.select('.current').selectAll('text')
    .data(scoreData, function(d) { return d;});

  // update
  currentScoreText
    .text(function(d){ return d.score ;});
  currentScoreText.enter().append('text')
    .text(function(d){ return d.score ;});

  // best score data join
  var bestScoreText = d3.select('.high').selectAll('text')
    .data(scoreData, function(d) { return d;});
  // update
  bestScoreText
    .text(function(d){ return d.bestScore ;});
  bestScoreText.enter().append('text')
    .text(function(d){ return d.bestScore ;});

  // data join
  var collisionsText = d3.select('.collisions').selectAll('text')
    .data(scoreData, function(d) { return d;});
  // update
  collisionsText
    .text(function(d){ return d.collisions ;});

  collisionsText.enter().append('text')
    .text(function(d){ return d.collisions ;});
};

// ------------------------- BEGIN INVOCATION ------------------------- //

// populates enemyList with the correct number of enemies
for (var i = 0; i < gameOptions.nEnemies; i ++) {
  enemyList.push(createEnemy());
}
// populate playerList with the one player
playerList.push(createPlayer());
scoreList.push(gameStats);

// create initial enemies on screen
update(enemyList);

var bound = function(value, min, max){
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  } else {
    return value;
  }
};

var dragmove = function(d) {
  d.cx = bound(d3.event.x, 0, gameOptions.width * .93);
  d.cy = bound(d3.event.y, 0, gameOptions.height * .75);
  //d.cy = d3.event.y;
  d3.select(this).attr("transform", "translate(" + d.cx + "," + d.cy + ")");
};

var drag = d3.behavior.drag()
    .on('drag', dragmove);





// ------------------------- UPDATE INVOCATION FUNCTIONS ------------------------- //

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
  updateScore(scoreList);
}, 30);
