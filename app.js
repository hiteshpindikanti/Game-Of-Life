const HTML_ELEMENT_ID_CANVAS = 'world';
const HTML_ELEMENT_ID_ZOOM = 'zoom';
const HTMP_ELEMENT_ID_SPEED = 'speed';
const HTML_ELEMENT_ID_PLAY_BUTTON = 'start-stop';
const HTML_ELEMENT_ID_RESET_BUTTON = 'reset';
const HTML_ELEMENT_ID_TOGGLE_SWITCH = 'toggle-switch';
const HTML_ELEMENT_ID_NAVIGATION_CHECKBOX = 'canvas-navigation-checkbox';
const HTML_ELEMENT_ID_NAVIGATION_IMG = 'canvas-navigation-icon';
const HTML_ELEMENT_ID_GENERATION_NUMBER = 'generation-number';

const HTML_ELEMENT_ID_STILL_LIFE_BLOCK = 'still-lifes__block';
const HTML_ELEMENT_ID_STILL_LIFE_BEE_HIVE = 'still-lifes__bee-hive';
const HTML_ELEMENT_ID_STILL_LIFE_LOAF = 'still-lifes__loaf';
const HTML_ELEMENT_ID_STILL_LIFE_BOAT = 'still-lifes__boat';
const HTML_ELEMENT_ID_STILL_LIFE_TUB = 'still-lifes__tub';

const HTML_ELEMENT_ID_OSCILLATOR_BLINKER = 'oscillators__blinker';
const HTML_ELEMENT_ID_OSCILLATOR_TOAD = 'oscillators__toad';
const HTML_ELEMENT_ID_OSCILLATOR_BEACON = 'oscillators__beacon';
const HTML_ELEMENT_ID_OSCILLATOR_PULSAR = 'oscillators__pulsar';

const HTML_ELEMENT_ID_SPACESHIPS_GLIDER = 'spaceships__glider';
const HTML_ELEMENT_ID_SPACESHIPS_LIGHT_WEIGHT = 'spaceships__light-weight';
const HTML_ELEMENT_ID_SPACESHIPS_MEDIUM_WEIGHT = 'spaceships__medium-weight';
const HTML_ELEMENT_ID_SPACESHIPS_HEAVY_WEIGHT = 'spaceships__heavy-weight';

const HTML_ELEMENT_ID_SPECIAL_GOSPER_GLIDER_GUN = 'special__gosper-glider-gun';


const START_BUTTON_COLOR = "#04AA6D"
const STOP_BUTTON_COLOR = "indianred"


class ListSet extends Set {
    add(elem) {
        return super.add(typeof elem === 'object' ? JSON.stringify(elem) : elem);
    }
    has(elem) {
        return super.has(typeof elem === 'object' ? JSON.stringify(elem) : elem);
    }
    delete(elem) {
        return super.delete(typeof elem === 'object' ? JSON.stringify(elem) : elem);
    }
}


class GameOfLife {

    constructor() {
        this.canvasDom = document.getElementById(HTML_ELEMENT_ID_CANVAS);
        this.zoomDom = document.getElementById(HTML_ELEMENT_ID_ZOOM);
        this.speedDom = document.getElementById(HTMP_ELEMENT_ID_SPEED);
        this.playButtonDom = document.getElementById(HTML_ELEMENT_ID_PLAY_BUTTON);
        this.resetButtonDom = document.getElementById(HTML_ELEMENT_ID_RESET_BUTTON);
        this.gridLinesToggleDom = document.getElementById(HTML_ELEMENT_ID_TOGGLE_SWITCH);
        this.navigationCheckboxDom = document.getElementById(HTML_ELEMENT_ID_NAVIGATION_CHECKBOX);
        this.navigationImageDom = document.getElementById(HTML_ELEMENT_ID_NAVIGATION_IMG);
        this.generationNumberDom = document.getElementById(HTML_ELEMENT_ID_GENERATION_NUMBER);

        this.prevZoomValue = this.zoomValue;
        this.gameSimulationFlag = false;
        this.mouseDown = false;
        this.gridIndex = [-1, -1];
        this.prevGridIndex = [-1, -1];
        this.isNavigationEnabled = false;
        this.navigationInitialIndex = [-1, -1];


        this.zoomValue = parseInt(this.zoomDom.value);
        this.speedValue = parseInt(this.speedDom.value) / 100;
        this.filledGrids = new ListSet();
        this.gridLines = Boolean(this.gridLinesToggleDom.checked);


        this.drawGridLines();
        this.addCanvasEventListeners();
        this.addStillLifesEventListeners();
        this.addOscillatorsEventListeners();
        this.addSpaceshipsEventListeners();
        this.addSpecialEventListeners();
    }

    addCanvasEventListeners = () => {

        // Event Listeners for marking grids
        this.canvasDom.addEventListener("mousedown", (e) => {
            this.prevGridIndex = this.gridIndex;
            this.gridIndex = [
                Math.floor((e.clientX - this.canvasDom.getBoundingClientRect().left) / this.zoomValue),
                Math.floor((e.clientY - this.canvasDom.getBoundingClientRect().top) / this.zoomValue)
            ];

            this.mouseDown = true;
            if (!this.isNavigationEnabled) {
                //Mark the grids
                if (this.prevGridIndex.toString() != this.gridIndex.toString()) {
                    if (this.filledGrids.has(this.gridIndex)) {
                        this.filledGrids.delete(this.gridIndex);
                        this.emptyGrid(this.gridIndex);

                    } else {
                        this.filledGrids.add(this.gridIndex);
                        this.fillGrid(this.gridIndex);
                    }
                }
            } else {
                this.canvasDom.style['backgroundColor'] = "lightgrey";
            }

        });
        this.canvasDom.addEventListener("mouseup", () => {
            this.mouseDown = false;
            this.gridIndex = [-1, -1];
            if (this.isNavigationEnabled) {
                this.canvasDom.style['backgroundColor'] = "white";
            }

        });
        this.canvasDom.addEventListener("mousemove", (e) => {
            if (this.mouseDown) {
                this.prevGridIndex = this.gridIndex;
                this.gridIndex = [
                    Math.floor((e.clientX - this.canvasDom.getBoundingClientRect().left) / this.zoomValue),
                    Math.floor((e.clientY - this.canvasDom.getBoundingClientRect().top) / this.zoomValue)
                ];
                if (this.prevGridIndex.toString() != this.gridIndex.toString()) {
                    if (this.isNavigationEnabled) {
                        //Navigate the Canvas
                        if (this.prevGridIndex.toString() != this.gridIndex.toString()) {
                            let newFilledGrids = this.shiftFilledGrids(this.filledGrids,
                                this.gridIndex[0] - this.prevGridIndex[0],
                                this.gridIndex[1] - this.prevGridIndex[1]);
                            this.filledGrids = newFilledGrids;
                            this.refreshGrid();
                        }
                    } else {
                        // Mark Grids

                        if (this.filledGrids.has(this.gridIndex)) {
                            this.filledGrids.delete(this.gridIndex);
                            this.emptyGrid(this.gridIndex);

                        } else {
                            this.filledGrids.add(this.gridIndex);
                            this.fillGrid(this.gridIndex);
                        }
                    }
                }
            }
        });

        // Event Listener for Zoom input range bar
        this.zoomDom.addEventListener('input', () => {
            this.prevZoomValue = this.zoomValue;
            this.zoomValue = parseInt(this.zoomDom.value);
            if (this.prevZoomValue >= 10 && this.zoomValue < 10) {
                this.gridLinesToggleDom.checked = false;
                this.gridLines = false;
                this.refreshGrid();
            } else if (this.zoomValue >= 10 && this.prevZoomValue < 10) {
                this.gridLinesToggleDom.checked = true;
                this.gridLines = true;
                this.refreshGrid();
            }
            this.refreshGrid();
        });

        // Event Listener for Speed input range bar
        this.speedDom.addEventListener('input', () => {
            this.speedValue = parseInt(this.speedDom.value) / 100;
        });

        // Event Listener for resizing the page
        window.addEventListener('resize', () => { this.refreshGrid() })
        this.playButtonDom.addEventListener('click', () => {

            if (this.playButtonDom.innerHTML == 'Start') {
                this.playButtonDom.innerHTML = 'Stop ';
                this.playButtonDom.style['background-color'] = STOP_BUTTON_COLOR;
                this.gameSimulationFlag = true;
                this.simulateWorld();
            } else {
                this.playButtonDom.innerHTML = 'Start';
                this.playButtonDom.style['background-color'] = START_BUTTON_COLOR;
                this.gameSimulationFlag = false;
            }
        });

        // Event Listener for Reset Button
        this.resetButtonDom.addEventListener('click', () => { this.resetCanvas(); });

        //Event Listener for Grid Lines Toggle Switch
        this.gridLinesToggleDom.addEventListener('change', () => {
            this.gridLines = !this.gridLines;
            this.refreshGrid();
        });

        //Event Listener for Navigation Checkbox
        this.navigationCheckboxDom.addEventListener('change', () => {
            this.isNavigationEnabled = this.navigationCheckboxDom.checked;
            if (this.isNavigationEnabled) {
                this.navigationImageDom.style['filter'] = 'invert(1)';
            } else {
                this.navigationImageDom.style['filter'] = 'none';
                this.canvasDom.style['backgroundColor'] = "white";
            }
        })
    }

    resetCanvas() {
        this.playButtonDom.innerHTML = 'Start';
        this.playButtonDom.style['background-color'] = START_BUTTON_COLOR;
        this.gameSimulationFlag = false;
        this.filledGrids.clear();
        this.resetGenerationNumber();
        this.refreshGrid();
    }

    simulateWorld() {
        let delay = 1.0 - this.speedValue;
        let i = 0;
        let nextIteration = () => {
            delay = 1.0 - this.speedValue;
            if (!this.gameSimulationFlag) {
                clearInterval(simulationId);
            } else {
                let newGridIndices = this.getNextInstance(this.filledGrids);
                this.incrementGenerationNumber();

                this.drawGridLines();


                for (let coordinates of[...newGridIndices].map(JSON.parse)) {
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

        this.canvasDom.width = document.getElementsByTagName('body')[0].clientWidth - 2; //Taking into account the Border width
        this.canvasDom.height = (window.innerHeight - document.getElementsByClassName('upper-panel')[0].clientHeight) * 0.9;

        let ctx = this.canvasDom.getContext('2d');

        if (this.gridLines) {
            for (let col = 0; col <= this.canvasDom.width; col += this.zoomValue) {
                ctx.moveTo(col, 0);
                ctx.lineTo(col, this.canvasDom.height);
            }

            for (let row = 0; row <= this.canvasDom.height; row += this.zoomValue) {
                ctx.moveTo(0, row);
                ctx.lineTo(this.canvasDom.width, row)
            }
        }
        ctx.strokeStyle = 'black';
        ctx.stroke();
    }

    fillGrid(gridIndex) {
        let ctx = this.canvasDom.getContext('2d');
        ctx.fillStyle = 'black';

        if (this.gridLines) {
            ctx.fillRect((gridIndex[0] * this.zoomValue) + 1, (gridIndex[1] * this.zoomValue) + 1, this.zoomValue - 2, this.zoomValue - 2);
        } else {
            ctx.fillRect(gridIndex[0] * this.zoomValue, gridIndex[1] * this.zoomValue, this.zoomValue, this.zoomValue);
        }
    }

    emptyGrid(gridIndex) {
        let ctx = this.canvasDom.getContext('2d');
        ctx.fillStyle = 'white';
        if (this.gridLines) {
            ctx.fillRect((gridIndex[0] * this.zoomValue) + 1, (gridIndex[1] * this.zoomValue) + 1, this.zoomValue - 2, this.zoomValue - 2);
        } else {
            ctx.fillRect(gridIndex[0] * this.zoomValue, gridIndex[1] * this.zoomValue, this.zoomValue, this.zoomValue);
        }

    }
    refreshGrid() {

        this.drawGridLines();

        for (let coordinates of[...this.filledGrids].map(JSON.parse)) {
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
        for (let gridIndex of[...filledGrids].map(JSON.parse)) {
            let lifeCount = 0;
            for (let adjacentGridIndex of[...this.getAdjacentGrids(gridIndex)].map(JSON.parse)) {
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
        for (let gridIndex of[...allAdjacentGrids].map(JSON.parse)) {
            let lifeCount = 0;
            for (let adjacentGridIndex of[...this.getAdjacentGrids(gridIndex)].map(JSON.parse)) {
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

    shiftFilledGrids(filledGrids, xShift, yShift) {

        let newFilledGrids = new ListSet();
        for (let gridIndex of[...filledGrids].map(JSON.parse)) {
            newFilledGrids.add([gridIndex[0] + xShift, gridIndex[1] + yShift]);
        }
        return newFilledGrids;

    }

    incrementGenerationNumber() {
        this.generationNumberDom.innerHTML = parseInt(this.generationNumberDom.innerHTML) + 1;
    }
    resetGenerationNumber() {
            this.generationNumberDom.innerHTML = 0;
        }
        // Configuration Event Listerers

    addStillLifesEventListeners() {
        //Event Listener for Block
        document.getElementById(HTML_ELEMENT_ID_STILL_LIFE_BLOCK).addEventListener('mousedown', () => {
            this.resetCanvas();

            this.filledGrids.add([2, 2]);
            this.filledGrids.add([2, 3]);
            this.filledGrids.add([3, 2]);
            this.filledGrids.add([3, 3]);

            this.playButtonDom.innerHTML = 'Start';
            this.playButtonDom.style['background-color'] = START_BUTTON_COLOR;
            this.gameSimulationFlag = false;
            this.zoomValue = 30;
            this.zoomDom.value = this.zoomValue;
            this.gridLines = true;
            this.refreshGrid();
        });

        //Event Listener for Bee-hive
        document.getElementById(HTML_ELEMENT_ID_STILL_LIFE_BEE_HIVE).addEventListener('mousedown', () => {
            this.resetCanvas();

            this.filledGrids.add([3, 3]);
            this.filledGrids.add([4, 3]);
            this.filledGrids.add([5, 4]);
            this.filledGrids.add([2, 4]);
            this.filledGrids.add([3, 5]);
            this.filledGrids.add([4, 5]);

            this.gameSimulationFlag = false;
            this.zoomValue = 30;
            this.zoomDom.value = this.zoomValue;
            this.gridLines = true;
            this.refreshGrid();
        });

        //Event Listener for Loaf
        document.getElementById(HTML_ELEMENT_ID_STILL_LIFE_LOAF).addEventListener('mousedown', () => {
            this.resetCanvas();

            this.filledGrids.add([4, 2]);
            this.filledGrids.add([5, 2]);
            this.filledGrids.add([6, 3]);
            this.filledGrids.add([6, 4]);
            this.filledGrids.add([5, 5]);
            this.filledGrids.add([4, 4]);
            this.filledGrids.add([3, 3]);

            this.playButtonDom.innerHTML = 'Start';
            this.playButtonDom.style['background-color'] = START_BUTTON_COLOR;
            this.gameSimulationFlag = false;
            this.zoomValue = 30;
            this.zoomDom.value = this.zoomValue;
            this.gridLines = true;
            this.refreshGrid();
        });

        //Event Listener for Boat
        document.getElementById(HTML_ELEMENT_ID_STILL_LIFE_BOAT).addEventListener('mousedown', () => {
            this.resetCanvas();

            this.filledGrids.add([3, 2]);
            this.filledGrids.add([4, 2]);
            this.filledGrids.add([3, 3]);
            this.filledGrids.add([5, 3]);
            this.filledGrids.add([4, 4]);
            this.playButtonDom.innerHTML = 'Start';
            this.playButtonDom.style['background-color'] = START_BUTTON_COLOR;
            this.gameSimulationFlag = false;
            this.zoomValue = 30;
            this.zoomDom.value = this.zoomValue;
            this.gridLines = true;
            this.refreshGrid();
        });

        //Event Listener for Tub
        document.getElementById(HTML_ELEMENT_ID_STILL_LIFE_TUB).addEventListener('mousedown', () => {
            this.resetCanvas();

            this.filledGrids.add([4, 2]);
            this.filledGrids.add([3, 3]);
            this.filledGrids.add([5, 3]);
            this.filledGrids.add([4, 4]);
            this.playButtonDom.innerHTML = 'Start';
            this.playButtonDom.style['background-color'] = START_BUTTON_COLOR;
            this.gameSimulationFlag = false;
            this.zoomValue = 30;
            this.zoomDom.value = this.zoomValue;
            this.gridLines = true;
            this.refreshGrid();
        });
    }

    addOscillatorsEventListeners() {
        //Event Listener for Blinker
        document.getElementById(HTML_ELEMENT_ID_OSCILLATOR_BLINKER).addEventListener('mousedown', () => {
            this.resetCanvas();
            this.filledGrids.add([3, 4]);
            this.filledGrids.add([4, 4]);
            this.filledGrids.add([5, 4]);
            this.playButtonDom.innerHTML = 'Start';
            this.playButtonDom.style['background-color'] = START_BUTTON_COLOR;
            this.gameSimulationFlag = false;
            this.zoomValue = 30;
            this.zoomDom.value = this.zoomValue;
            this.speedValue = 50 / 100;
            this.speedDom.value = this.speedValue * 100;
            this.gridLines = true;
            this.refreshGrid();
        });

        //Event Listener for Toad
        document.getElementById(HTML_ELEMENT_ID_OSCILLATOR_TOAD).addEventListener('mousedown', () => {
            this.resetCanvas();
            this.filledGrids.add([5, 3]);
            this.filledGrids.add([2, 4]);
            this.filledGrids.add([4, 3]);
            this.filledGrids.add([4, 4]);
            this.filledGrids.add([3, 4]);
            this.filledGrids.add([3, 3]);
            this.playButtonDom.innerHTML = 'Start';
            this.playButtonDom.style['background-color'] = START_BUTTON_COLOR;
            this.gameSimulationFlag = false;
            this.zoomValue = 30;
            this.zoomDom.value = this.zoomValue;
            this.speedValue = 50 / 100;
            this.speedDom.value = this.speedValue * 100;
            this.gridLines = true;
            this.refreshGrid();
        });

        //Event Listener for Beacon
        document.getElementById(HTML_ELEMENT_ID_OSCILLATOR_BEACON).addEventListener('mousedown', () => {
            this.resetCanvas();
            this.filledGrids.add([3, 3]);
            this.filledGrids.add([4, 3]);
            this.filledGrids.add([3, 4]);
            this.filledGrids.add([5, 6]);
            this.filledGrids.add([6, 6]);
            this.filledGrids.add([6, 5]);
            this.filledGrids.add([4, 4]);
            this.filledGrids.add([5, 5]);
            this.playButtonDom.innerHTML = 'Start';
            this.playButtonDom.style['background-color'] = START_BUTTON_COLOR;
            this.gameSimulationFlag = false;
            this.zoomValue = 30;
            this.zoomDom.value = this.zoomValue;
            this.speedValue = 50 / 100;
            this.speedDom.value = this.speedValue * 100;
            this.gridLines = true;
            this.refreshGrid();
        });

        //Event Listener for Pulsar
        document.getElementById(HTML_ELEMENT_ID_OSCILLATOR_PULSAR).addEventListener('mousedown', () => {
            this.resetCanvas();

            this.filledGrids.add([8, 8]);
            this.filledGrids.add([8, 7]);
            this.filledGrids.add([8, 6]);
            this.filledGrids.add([7, 9]);
            this.filledGrids.add([6, 9]);
            this.filledGrids.add([5, 9]);
            this.filledGrids.add([10, 6]);
            this.filledGrids.add([10, 7]);
            this.filledGrids.add([10, 8]);
            this.filledGrids.add([11, 9]);
            this.filledGrids.add([12, 9]);
            this.filledGrids.add([13, 9]);
            this.filledGrids.add([15, 6]);
            this.filledGrids.add([15, 7]);
            this.filledGrids.add([15, 8]);
            this.filledGrids.add([11, 4]);
            this.filledGrids.add([12, 4]);
            this.filledGrids.add([13, 4]);
            this.filledGrids.add([7, 4]);
            this.filledGrids.add([6, 4]);
            this.filledGrids.add([5, 4]);
            this.filledGrids.add([3, 8]);
            this.filledGrids.add([3, 7]);
            this.filledGrids.add([3, 6]);
            this.filledGrids.add([7, 11]);
            this.filledGrids.add([6, 11]);
            this.filledGrids.add([5, 11]);
            this.filledGrids.add([8, 12]);
            this.filledGrids.add([8, 13]);
            this.filledGrids.add([8, 14]);
            this.filledGrids.add([10, 12]);
            this.filledGrids.add([10, 13]);
            this.filledGrids.add([10, 14]);
            this.filledGrids.add([11, 11]);
            this.filledGrids.add([12, 11]);
            this.filledGrids.add([13, 11]);
            this.filledGrids.add([15, 12]);
            this.filledGrids.add([15, 13]);
            this.filledGrids.add([15, 14]);
            this.filledGrids.add([11, 16]);
            this.filledGrids.add([12, 16]);
            this.filledGrids.add([13, 16]);
            this.filledGrids.add([7, 16]);
            this.filledGrids.add([6, 16]);
            this.filledGrids.add([5, 16]);
            this.filledGrids.add([3, 12]);
            this.filledGrids.add([3, 13]);
            this.filledGrids.add([3, 14]);
            this.playButtonDom.innerHTML = 'Start';
            this.playButtonDom.style['background-color'] = START_BUTTON_COLOR;
            this.gameSimulationFlag = false;
            this.zoomValue = 20;
            this.zoomDom.value = this.zoomValue;
            this.speedValue = 50 / 100;
            this.speedDom.value = this.speedValue * 100;
            this.gridLines = true;
            this.refreshGrid();
        });
    }
    addSpaceshipsEventListeners() {
        //Event Listener for Glider
        document.getElementById(HTML_ELEMENT_ID_SPACESHIPS_GLIDER).addEventListener('mousedown', () => {
            this.resetCanvas();
            this.filledGrids.add([3, 4]);
            this.filledGrids.add([4, 4]);
            this.filledGrids.add([4, 3]);
            this.filledGrids.add([5, 3]);
            this.filledGrids.add([3, 2]);
            this.playButtonDom.innerHTML = 'Start';
            this.playButtonDom.style['background-color'] = START_BUTTON_COLOR;
            this.gameSimulationFlag = false;
            this.zoomValue = 20;
            this.zoomDom.value = this.zoomValue;
            this.speedValue = 90 / 100;
            this.speedDom.value = this.speedValue * 100;
            this.gridLines = true;
            this.refreshGrid();
        });

        //Event Listener for Light-Weight Spaceship
        document.getElementById(HTML_ELEMENT_ID_SPACESHIPS_LIGHT_WEIGHT).addEventListener('mousedown', () => {
            this.resetCanvas();
            this.filledGrids.add([4, 4]);
            this.filledGrids.add([5, 4]);
            this.filledGrids.add([6, 4]);
            this.filledGrids.add([7, 4]);
            this.filledGrids.add([7, 5]);
            this.filledGrids.add([7, 6]);
            this.filledGrids.add([6, 7]);
            this.filledGrids.add([3, 5]);
            this.filledGrids.add([3, 7]);
            this.playButtonDom.innerHTML = 'Start';
            this.playButtonDom.style['background-color'] = START_BUTTON_COLOR;
            this.gameSimulationFlag = false;
            this.zoomValue = 15;
            this.zoomDom.value = this.zoomValue;
            this.speedValue = 90 / 100;
            this.speedDom.value = this.speedValue * 100;
            this.gridLines = true;
            this.refreshGrid();
        });

        //Event Listener for Medium weight spaceship
        document.getElementById(HTML_ELEMENT_ID_SPACESHIPS_MEDIUM_WEIGHT).addEventListener('mousedown', () => {
            this.resetCanvas();

            this.filledGrids.add([5, 3]);
            this.filledGrids.add([6, 3]);
            this.filledGrids.add([7, 3]);
            this.filledGrids.add([8, 3]);
            this.filledGrids.add([9, 3]);
            this.filledGrids.add([9, 4]);
            this.filledGrids.add([9, 5]);
            this.filledGrids.add([8, 6]);
            this.filledGrids.add([4, 4]);
            this.filledGrids.add([4, 6]);
            this.filledGrids.add([6, 7]);
            this.playButtonDom.innerHTML = 'Start';
            this.playButtonDom.style['background-color'] = START_BUTTON_COLOR;
            this.gameSimulationFlag = false;
            this.zoomValue = 15;
            this.zoomDom.value = this.zoomValue;
            this.speedValue = 90 / 100;
            this.speedDom.value = this.speedValue * 100;
            this.gridLines = true;
            this.refreshGrid();
        });

        //Event Listener for Heavy weight spaceship
        document.getElementById(HTML_ELEMENT_ID_SPACESHIPS_HEAVY_WEIGHT).addEventListener('mousedown', () => {
            this.resetCanvas();

            this.filledGrids.add([9, 3]);
            this.filledGrids.add([9, 4]);
            this.filledGrids.add([9, 5]);
            this.filledGrids.add([8, 5]);
            this.filledGrids.add([7, 5]);
            this.filledGrids.add([6, 5]);
            this.filledGrids.add([5, 5]);
            this.filledGrids.add([4, 5]);
            this.filledGrids.add([3, 4]);
            this.filledGrids.add([3, 2]);
            this.filledGrids.add([5, 1]);
            this.filledGrids.add([6, 1]);
            this.filledGrids.add([8, 2]);
            this.playButtonDom.innerHTML = 'Start';
            this.playButtonDom.style['background-color'] = START_BUTTON_COLOR;
            this.gameSimulationFlag = false;
            this.zoomValue = 15;
            this.zoomDom.value = this.zoomValue;
            this.speedValue = 90 / 100;
            this.speedDom.value = this.speedValue * 100;
            this.gridLines = true;
            this.refreshGrid();
        });
    }

    addSpecialEventListeners() {
        //Event Listener for Gosper Glider Gun
        document.getElementById(HTML_ELEMENT_ID_SPECIAL_GOSPER_GLIDER_GUN).addEventListener('mousedown', () => {
            this.resetCanvas();

            this.filledGrids.add([3, 6]);
            this.filledGrids.add([4, 6]);
            this.filledGrids.add([4, 7]);
            this.filledGrids.add([3, 7]);
            this.filledGrids.add([13, 7]);
            this.filledGrids.add([13, 6]);
            this.filledGrids.add([13, 8]);
            this.filledGrids.add([14, 5]);
            this.filledGrids.add([15, 4]);
            this.filledGrids.add([16, 4]);
            this.filledGrids.add([14, 9]);
            this.filledGrids.add([15, 10]);
            this.filledGrids.add([16, 10]);
            this.filledGrids.add([18, 5]);
            this.filledGrids.add([18, 9]);
            this.filledGrids.add([19, 8]);
            this.filledGrids.add([19, 7]);
            this.filledGrids.add([19, 6]);
            this.filledGrids.add([20, 7]);
            this.filledGrids.add([17, 7]);
            this.filledGrids.add([23, 6]);
            this.filledGrids.add([24, 6]);
            this.filledGrids.add([24, 5]);
            this.filledGrids.add([23, 5]);
            this.filledGrids.add([23, 4]);
            this.filledGrids.add([24, 4]);
            this.filledGrids.add([25, 3]);
            this.filledGrids.add([27, 3]);
            this.filledGrids.add([27, 2]);
            this.filledGrids.add([25, 7]);
            this.filledGrids.add([27, 7]);
            this.filledGrids.add([27, 8]);
            this.filledGrids.add([37, 4]);
            this.filledGrids.add([38, 4]);
            this.filledGrids.add([38, 5]);
            this.filledGrids.add([37, 5]);
            this.playButtonDom.innerHTML = 'Start';
            this.playButtonDom.style['background-color'] = START_BUTTON_COLOR;
            this.gameSimulationFlag = false;
            this.zoomValue = 10;
            this.zoomDom.value = this.zoomValue;
            this.speedValue = 90 / 100;
            this.speedDom.value = this.speedValue * 100;
            this.refreshGrid();
        });
    }
}