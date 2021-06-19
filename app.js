const HTML_ELEMENT_ID_CANVAS = 'world';
const HTML_ELEMENT_ID_ZOOM = 'zoom';
const HTMP_ELEMENT_ID_SPEED = 'speed';
const HTML_ELEMENT_ID_PLAY_BUTTON = 'start-stop';


class ListSet extends Set {
    add(elem) {
        return super.add(typeof elem === 'object' ? JSON.stringify(elem) : elem);
    }
    has(elem) {
        return super.has(typeof elem === 'object' ? JSON.stringify(elem) : elem);
    }
}


class GameOfLife {

    constructor() {
        this.canvasDom = document.getElementById(HTML_ELEMENT_ID_CANVAS);
        this.zoomDom = document.getElementById(HTML_ELEMENT_ID_ZOOM);
        this.speedDom = document.getElementById(HTMP_ELEMENT_ID_SPEED);
        this.playButtonDom = document.getElementById(HTML_ELEMENT_ID_PLAY_BUTTON);
        this.zoomValue = parseInt(this.zoomDom.value);
        this.speedValue = parseInt(this.speedDom.value) / 100;
        this.filledGrids = new ListSet();
        this.gameSimulationFlag = false;
        this.drawGridLines();
        this.addEventListeners();
    }

    addEventListeners = () => {
        this.canvasDom.addEventListener("click", (e) => {
            let gridIndex = [
                Math.floor((e.clientX - this.canvasDom.getBoundingClientRect().left) / this.zoomValue),
                Math.floor((e.clientY - this.canvasDom.getBoundingClientRect().top) / this.zoomValue)
            ]
            this.filledGrids.add(gridIndex);
            this.fillGrid(gridIndex);
        });
        this.zoomDom.addEventListener('input', () => {
            this.zoomValue = parseInt(this.zoomDom.value);
            this.refreshGrid();
        });
        this.speedDom.addEventListener('input', () => {
            this.speedValue = parseInt(this.speedDom.value) / 100;
        });
        window.addEventListener('resize', () => { this.refreshGrid() })
        this.playButtonDom.addEventListener('click', () => {

            if (this.playButtonDom.innerHTML == 'Start') {
                this.playButtonDom.innerHTML = 'Stop';
                this.gameSimulationFlag = true;
                this.simulateWorld();
            } else {
                this.playButtonDom.innerHTML = 'Start';
                this.gameSimulationFlag = false;
            }
        });
    }


    simulateWorld() {
        let delay = 1.0 - this.speedValue;
        let i = 0;
        let nextIteration = () => {
            delay = 1.0 - this.speedValue;
            if (!this.gameSimulationFlag) {
                clearInterval(simulationId);
            }
            else {
                let newGridIndices = this.getNextInstance(this.filledGrids);
                this.drawGridLines();

                for (let coordinates of [...newGridIndices].map(JSON.parse)) {
                    this.fillGrid(coordinates);
                }
                i++;
                this.filledGrids = newGridIndices;
                simulationId = setTimeout(nextIteration, delay * 1000);
            }

        };
        var simulationId = setTimeout(nextIteration, delay * 1000);

    }

    drawGridLines() {
        this.canvasDom.width = window.innerWidth;
        this.canvasDom.height = window.innerHeight - this.canvasDom.getBoundingClientRect().top;
        let ctx = this.canvasDom.getContext('2d');

        for (let col = 0; col <= this.canvasDom.width; col += this.zoomValue) {
            ctx.moveTo(col, 0);
            ctx.lineTo(col, this.canvasDom.height);
        }

        for (let row = 0; row <= this.canvasDom.height; row += this.zoomValue) {
            ctx.moveTo(0, row);
            ctx.lineTo(this.canvasDom.width, row)
        }

        ctx.strokeStyle = 'black';
        ctx.stroke();
    }

    fillGrid(gridIndex) {
        let ctx = this.canvasDom.getContext('2d');
        ctx.fillRect(gridIndex[0] * this.zoomValue, gridIndex[1] * this.zoomValue, this.zoomValue, this.zoomValue);
    }


    refreshGrid() {
        this.drawGridLines();
        for (let coordinates of [...this.filledGrids].map(JSON.parse)) {
            this.fillGrid(coordinates)
        }

    }

    getAdjacentGrids(gridIndex) {
        let adjacentGrids = new ListSet();
        const x = gridIndex[0];
        const y = gridIndex[1];
        let xMinFlag = x > 0;
        let yMinFlag = y > 0;
        adjacentGrids.add([x + 1, y]);
        adjacentGrids.add([x, y + 1]);
        adjacentGrids.add([x + 1, y + 1]);
        if (xMinFlag) {
            adjacentGrids.add([x - 1, y]);
            adjacentGrids.add([x - 1, y + 1]);
            if (yMinFlag) {
                adjacentGrids.add([x - 1, y - 1]);
                adjacentGrids.add([x, y - 1]);
                adjacentGrids.add([x + 1, y - 1]);
            }
        }
        if (yMinFlag) {
            adjacentGrids.add([x + 1, y - 1]);
            adjacentGrids.add([x, y - 1]);
        }

        return adjacentGrids;
    }

    getNextInstance(filledGrids) {
        // RULES:
        // Any live cell with two or three live neighbours survives.
        // Any dead cell with three live neighbours becomes a live cell.
        // All other live cells die in the next generation. Similarly, all other dead cells stay dead.


        let nextFilledGrids = new ListSet();
        let allAdjacentGrids = new ListSet();
        for (let gridIndex of [...filledGrids].map(JSON.parse)) {
            let lifeCount = 0;
            for (let adjacentGridIndex of [...this.getAdjacentGrids(gridIndex)].map(JSON.parse)) {
                if (!filledGrids.has(adjacentGridIndex)) {
                    allAdjacentGrids.add(adjacentGridIndex);
                }
                if (filledGrids.has(adjacentGridIndex)) {
                    lifeCount++;
                }
            }
            if (lifeCount == 2 || lifeCount == 3) {
                nextFilledGrids.add(gridIndex)
            }
        }
        for (let gridIndex of [...allAdjacentGrids].map(JSON.parse)) {
            let lifeCount = 0;
            for (let adjacentGridIndex of [...this.getAdjacentGrids(gridIndex)].map(JSON.parse)) {
                if (!filledGrids.has(adjacentGridIndex)) {
                    allAdjacentGrids.add(adjacentGridIndex);
                }
                if (filledGrids.has(adjacentGridIndex)) {
                    lifeCount++;
                }
            }
            if (lifeCount == 3) {
                nextFilledGrids.add(gridIndex);
            }
        }
        return nextFilledGrids;

    }

}