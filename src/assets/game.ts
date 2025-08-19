type tomo = import("./interfaces/tomo.js").tomo;

//find canvas and prepare context object
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

//modular house values
const topBuffer: number = 10;
const houseBuffer: number = 30;
const houseSize: number = 250;
const wallWidth: number = 20;
const doorSize: number = 35; //half of what the door size will actually be

//modular tomo values
const tomoSize: number = 50;
const averagePlanLength: number = 150;

//prepare empty list of tomos
var tomoList: tomo[] = [];

//draw walls in specified color
function drawHouse(x: number, y: number, tomo: tomo) {
    ctx.fillStyle = tomo.houseColor;
    ctx.fillRect(x, y, wallWidth, houseSize);
    ctx.fillRect(x, y, houseSize, wallWidth);
    ctx.fillRect(x + houseSize - wallWidth, y, wallWidth, houseSize);
    ctx.fillRect(x, y + houseSize - wallWidth, (houseSize / 2) - doorSize, wallWidth);
    ctx.fillRect(x + (houseSize / 2) + doorSize, y + houseSize - wallWidth, (houseSize / 2) - doorSize, wallWidth);

    //draw the door only if the tomo isn't currently moving through it
    if (tomo.interruptible || tomo.y < topBuffer + houseSize - wallWidth - tomoSize - 30 || tomo.y > topBuffer + houseSize + 30) {
        ctx.fillStyle = "#6e4611ff";
        ctx.fillRect(x + (houseSize / 2) - doorSize, y + houseSize - wallWidth, (doorSize * 2), wallWidth);
    }
}

function goHome(tomo: tomo, index: number) {
    //find the coordinates for outside the tomo's house
    tomo.xLoc = (houseBuffer + (houseSize / 2)) + (index * (houseSize + houseBuffer)) - (tomoSize / 2);
    tomo.yLoc = topBuffer + houseSize + 30;

    //find the difference between the tomo's location and the destination
    const xDiff = tomo.xLoc - tomo.x;
    const yDiff = tomo.yLoc - tomo.y;

    //find the total distance from the tomo to the destination, then set the x and y velocities accordingly
    const totalDistance = Math.sqrt((xDiff ** 2) + (yDiff ** 2));
    tomo.xV = (xDiff / totalDistance) / 3;
    tomo.yV = (yDiff / totalDistance) / 3;
    tomo.planTimer = 1000;
}

function goOutside(tomo: tomo, index: number) {
    //find the coordinates for in front of the door
    tomo.xLoc = (houseBuffer + (houseSize / 2)) + (index * (houseSize + houseBuffer)) - (tomoSize / 2);
    tomo.yLoc = topBuffer + houseSize - wallWidth - tomoSize - 30;

    //find the difference between the tomo's location and the destination
    const xDiff = tomo.xLoc - tomo.x;
    const yDiff = tomo.yLoc - tomo.y;

    //find the total distance from the tomo to the destination, then set the x and y velocities accordingly
    const totalDistance = Math.sqrt((xDiff ** 2) + (yDiff ** 2));
    tomo.xV = (xDiff / totalDistance) / 3;
    tomo.yV = (yDiff / totalDistance) / 3;
    tomo.planTimer = 1000;
}

//game logic loop
function update() {

    //routine that runs for every tomo every frame
    tomoList.forEach((tomo, index) => {
        //decrement plan timer each frame
        tomo.planTimer -= 1;

        //if plan timer is 0, choose next plan. only current plans are walking and doing nothing
        if (tomo.planTimer <= 0) {
            //if the timer runs out and tomo isn't interruptible, it means it just finished moving inside or outside. check its location and update its inHouse status accordingly
            if (!tomo.interruptible) {
                if (tomo.y < topBuffer + houseSize - wallWidth - tomoSize) {
                    tomo.inHouse = true;
                } else if (tomo.y > topBuffer + houseSize) {
                    tomo.inHouse = false;
                }
                tomo.interruptible = true;
            }

            //generate a random number in preparation for choosing a next action
            const random = Math.random();

            if (random > 0.25) {
                //randomly set velocity, aka "walking"
                tomo.xV = Math.random() - 0.5;
                tomo.yV = Math.random() - 0.5;
                tomo.interruptible = true;
                //changes timer to be between 100 and 200 frames
                tomo.planTimer = averagePlanLength + ((Math.random() - 0.5) * 100);
            } else if (0.20 < random && random < 0.25) {
                //if tomo is outside, start moving inside. if inside, start moving outside
                if (!tomo.inHouse) {
                    tomo.interruptible = false;
                    goHome(tomo, index);
                } else if (tomo.inHouse) {
                    tomo.interruptible = false;
                    goOutside(tomo, index);
                }
            }

        }

        //if the tomo isn't in a special action, decrease speed as it moves
        if (tomo.interruptible) {
            tomo.xV *= 0.98;
            tomo.yV *= 0.98;

            //if the absolute value of its velocities is low, set velocities to 0
            if (Math.abs(tomo.xV) + Math.abs(tomo.yV) < 0.03) {
                tomo.xV = 0;
                tomo.yV = 0;
            };
        } else if (!tomo.interruptible) {
            //if tomo is moving to a location and close to its destination, initiate either moving inside or outside depending on its inHouse status
            if (Math.abs(tomo.x - tomo.xLoc) < 2 && Math.abs(tomo.y - tomo.yLoc) < 2) {
                if (!tomo.inHouse) {
                    tomo.xV = 0;
                    tomo.yV = -0.5;
                    tomo.planTimer = 60;
                } else if (tomo.inHouse) {
                    tomo.xV = 0;
                    tomo.yV = 0.5;
                    tomo.planTimer = 60;
                }
            }
        }

        //move the tomo based on its speed each frame
        tomo.x += tomo.xV * 5;
        tomo.y += tomo.yV * 5;

        //safeguards for edge of screen
        if (tomo.interruptible) {
            if (!tomo.inHouse) {
                //if tomo is outside, its bounds are everything within the screen but below the houses
                if (tomo.x < 0) {
                    tomo.x = 0;
                }
                if (tomo.x > canvas.width - tomoSize) {
                    tomo.x = canvas.width - tomoSize;
                }
                if (tomo.y < houseSize + topBuffer) {
                    tomo.y = houseSize + topBuffer;
                }
                if (tomo.y > canvas.height - tomoSize) {
                    tomo.y = canvas.height - tomoSize;
                }
            } else if (tomo.inHouse) {
                //if tomo is inside, its bounds are within the walls of its own house
                if (tomo.x < houseBuffer + wallWidth + (index * (houseSize + houseBuffer))) {
                    tomo.x = houseBuffer + wallWidth + (index * (houseSize + houseBuffer))
                }
                if (tomo.x > houseBuffer + houseSize - wallWidth - tomoSize + (index * (houseSize + houseBuffer))) {
                    tomo.x = houseBuffer + houseSize - wallWidth - tomoSize + (index * (houseSize + houseBuffer));
                }
                if (tomo.y < topBuffer + wallWidth) {
                    tomo.y = topBuffer + wallWidth;
                }
                if (tomo.y > topBuffer + houseSize - wallWidth - tomoSize) {
                    tomo.y = topBuffer + houseSize - wallWidth - tomoSize;
                }
            }
        }
    });
}

//animation loop
function draw() {
    //clear canvas before next frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //draw each tomo and their house
    tomoList.forEach((tomo, index) => {
        ctx.fillStyle = tomo.color;
        ctx.fillRect(tomo.x, tomo.y, tomoSize, tomoSize);

        drawHouse(houseBuffer + (index * (houseSize + houseBuffer)), topBuffer, tomo);
    })

    //queue next animation frame
    requestAnimationFrame(draw);
}

function init() {
    //can eventually set up reading from local storage here
    //just temporarily manually adding some tomos in on startup
    tomoList.push({
        x: 500,
        y: 500,
        xV: 0,
        yV: 0,
        planTimer: 10,
        interruptible: true,
        color: "#5533BB",
        houseColor: "#000000",
        inHouse: false,
    });

    tomoList.push({
        x: 500,
        y: 500,
        xV: 0,
        yV: 0,
        planTimer: 10,
        interruptible: true,
        color: "#33CCDD",
        houseColor: "#229999",
        inHouse: false,
    });

    tomoList.push({
        x: 500,
        y: 500,
        xV: 0,
        yV: 0,
        planTimer: 10,
        interruptible: true,
        color: "#89d809",
        houseColor: "#593972ff",
        inHouse: false,
    });

    //start game logic loop and animation loop
    setInterval(update, 16);
    requestAnimationFrame(draw);
}

//initialize game
init();