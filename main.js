


class ListSet extends Set{
    add(elem){
      return super.add(typeof elem === 'object' ? JSON.stringify(elem) : elem);
    }
    has(elem){
      return super.has(typeof elem === 'object' ? JSON.stringify(elem) : elem);
    }
  }




function main() {
    var zoomValue = 20;
    var filledGrids = new ListSet();
    var canvas = document.getElementById('world')
    
    drawGridLines(canvas, zoomValue);

    document.getElementById('world').addEventListener("click", function(e) {
        gridIndex = [
            Math.floor((e.clientX - canvas.getBoundingClientRect().left)/zoomValue), 
            Math.floor((e.clientY - canvas.getBoundingClientRect().top)/zoomValue)
        ]
        filledGrids.add(gridIndex);
        fillGrid(canvas, gridIndex, zoomValue);
    })
    document.getElementById('zoom').addEventListener('input', function() {
        zoomValue = parseInt(document.getElementById('zoom').value);
        refreshGrid(canvas, filledGrids, zoomValue)
    })
    window.addEventListener('resize', function() {refreshGrid(canvas, filledGrids, zoomValue)})
    document.getElementById('start-stop').addEventListener('click', function() {
        button = document.getElementById('start-stop')
        if (button.innerHTML == 'Start') {
            button.innerHTML = 'Stop';
            speed = parseInt(document.getElementById('speed').value)/100;
            simulateWorld(canvas, filledGrids, zoomValue, speed);
        } else {
            
        }
    })
}


function simulateWorld(canvas, filledGrids, zoomValue, speed) {
    document.getElementById('start-stop').addEventListener('click', function() {
        if (document.getElementById('start-stop').innerHTML == "Stop"){
            clearInterval(simulate)
            document.getElementById('start-stop').innerHTML = "Start";
        } else {
            document.getElementById('start-stop').innerHTML = "Stop";
            clearInterval(simulate);
            simulateWorld(canvas, filledGrids, zoomValue, speed);
        }
    });
    const iterator = gameOfLife(filledGrids);
    let delay = 1.0 - speed;
    console.log("delay: " + delay)
    let i=0;
    var simulate = setInterval( function() {
        console.log("Start simalate")
        if (i>=50) {
            clearInterval(simulate);
        }
        else {
            let newGridIndices = iterator.next().value;
            drawGridLines(canvas, zoomValue);
            
            for (coordinates of [...newGridIndices].map(JSON.parse)) {
                fillGrid(canvas, coordinates, zoomValue)
            }
            i++;
            filledGrids = newGridIndices;
        }
        
    } , delay*1000  ) ;
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }


function drawGridLines(canvas, zoomValue) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - canvas.getBoundingClientRect().top;
    let ctx = canvas.getContext('2d');
    
    for (let col=0 ; col <= canvas.width ; col+=zoomValue) {
        ctx.moveTo(col, 0);
        ctx.lineTo(col, canvas.height);
    }

    for (let row=0 ; row <= canvas.height ; row+=zoomValue) {
        ctx.moveTo(0, row);
        ctx.lineTo(canvas.width, row)
    }

    ctx.strokeStyle = 'black';
    ctx.stroke();
}

function fillGrid(canvas, gridIndex, zoomValue) {
    let ctx = canvas.getContext('2d');
    ctx.fillRect(gridIndex[0]*zoomValue, gridIndex[1]*zoomValue, zoomValue, zoomValue);
}


function refreshGrid(canvas, filledGrids, zoomValue) {
    drawGridLines(canvas, zoomValue);
    for (coordinates of [...filledGrids].map(JSON.parse)) {
        fillGrid(canvas, coordinates, zoomValue)
    }
    
}

function getAdjacentGrids(girdIndex) {
    let adjacentGrids = new ListSet();
    const x = gridIndex[0];
    const y = gridIndex[1];
    xMinFlag = x>0;
    yMinFlag = y>0;
    adjacentGrids.add([x+1, y]);
    adjacentGrids.add([x, y+1]);
    adjacentGrids.add([x+1, y+1]);
    if (xMinFlag) {
        adjacentGrids.add([x-1, y]);
        adjacentGrids.add([x-1, y+1]);
        if (yMinFlag) {
            adjacentGrids.add([x-1, y-1]);
            adjacentGrids.add([x, y-1]);
            adjacentGrids.add([x+1, y-1]);
        }
    }
    if (yMinFlag) {
        adjacentGrids.add([x+1, y-1]);
        adjacentGrids.add([x, y-1]);
    }
    
    return adjacentGrids;
}

function* gameOfLife(filledGrids) {
    // RULES:
    // Any live cell with two or three live neighbours survives.
    // Any dead cell with three live neighbours becomes a live cell.
    // All other live cells die in the next generation. Similarly, all other dead cells stay dead.
    while (true) {
        let nextFilledGrids = new ListSet();
        let allAdjacentGrids = new ListSet();
        for (gridIndex of [...filledGrids].map(JSON.parse)) {
            let lifeCount = 0;
            for (adjacentGridIndex of [...getAdjacentGrids(gridIndex)].map(JSON.parse)) {
                if (!filledGrids.has(adjacentGridIndex)) {
                    allAdjacentGrids.add(adjacentGridIndex);
                }
                if (filledGrids.has(adjacentGridIndex)) {
                    lifeCount ++;
                }
            }
            if (lifeCount == 2 || lifeCount == 3) {
                nextFilledGrids.add(gridIndex)
            }
        }
        for (gridIndex of [...allAdjacentGrids].map(JSON.parse)) {
            let lifeCount = 0;
            for (adjacentGridIndex of [...getAdjacentGrids(gridIndex)].map(JSON.parse)) {
                if (!filledGrids.has(adjacentGridIndex)) {
                    allAdjacentGrids.add(adjacentGridIndex);
                }
                if (filledGrids.has(adjacentGridIndex)) {
                    lifeCount ++;
                }
            }
            if (lifeCount == 3) {
                nextFilledGrids.add(gridIndex);
            }
        }
        filledGrids = nextFilledGrids;
        yield filledGrids;
    }
}


main();