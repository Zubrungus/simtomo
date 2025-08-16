type tomo = import("./interfaces/tomo.js").tomo;

//find canvas and prepare context object
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

//modular house values
const houseSize:number = 250;
const wallWidth:number = 20;
const doorSize:number = 35; //half of what the door size will actually be

//modular tomo values
const tomoSize:number = 50;
const averagePlanLength:number = 150;

//prepare empty list of tomos
var tomoList:tomo[] = [];

//draw walls in specified color
function drawHouse(x: number, y: number, color: string){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, wallWidth, houseSize);
    ctx.fillRect(x, y, houseSize, wallWidth);
    ctx.fillRect(x + houseSize - wallWidth, y, wallWidth, houseSize);
    ctx.fillRect(x, y + houseSize - wallWidth, (houseSize / 2) - doorSize, wallWidth);
    ctx.fillRect(x + (houseSize / 2) + doorSize, y + houseSize - wallWidth, (houseSize / 2) - doorSize, wallWidth);

    ctx.fillStyle = "#6e4611ff";
    ctx.fillRect(x + (houseSize / 2) - doorSize, y + houseSize - wallWidth, (doorSize * 2), wallWidth);
}

//game logic loop
function update(){

    //routine that runs for every tomo every frame
    tomoList.forEach((tomo) => {
        //decrement plan timer each frame
        tomo.planTimer -= 1;

        //if plan timer is 0, choose next plan. only current plans are walking and doing nothing
        if(tomo.planTimer <= 0){
            const random = Math.random();

            //randomly set velocity, aka "walking"
            if(random > 0.25){
                tomo.xV = Math.random() - 0.5;
                tomo.yV = Math.random() - 0.5;
                tomo.interruptible = true;
            }
            //changes timer to be between 100 and 200 frames
            tomo.planTimer = averagePlanLength + ((Math.random() - 0.5) * 100);
        }

        //if the tomo isn't in a special action, decrease speed as it moves
        if(tomo.interruptible == true){
            tomo.xV *= 0.98;
            tomo.yV *= 0.98;

            //if the absolute value of its velocities is low, set velocities to 0
            if(Math.abs(tomo.xV) + Math.abs(tomo.yV) < 0.03){
                tomo.xV = 0;
                tomo.yV = 0;
            };
        }

        //move the tomo based on its speed each frame
        tomo.x += tomo.xV * 5;
        tomo.y += tomo.yV * 5;

        //safeguards for edge of screen
        if(tomo.x < 0){
            tomo.x = 0;
        }
        if(tomo.x > canvas.width - tomoSize){
            tomo.x = canvas.width - tomoSize;
        }
        if(tomo.y < houseSize + 10){
            tomo.y = houseSize + 10;
        }
        if(tomo.y > canvas.height - tomoSize){
            tomo.y = canvas.height - tomoSize;
        }
    });
}

//animation loop
function draw(){
    //clear canvas before next frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //draw each tomo and their house
    tomoList.forEach((tomo, index) =>{
        ctx.fillStyle = tomo.color;
        ctx.fillRect(tomo.x, tomo.y, tomoSize, tomoSize);

        drawHouse(40 + (index * (houseSize + 30)), 10, tomo.houseColor);
    })

    //queue next animation frame
    requestAnimationFrame(draw);
}

function init(){
    //can eventually set up reading from local storage here
    //just temporarily manually adding a couple tomos in
    tomoList.push({
        x: 500,
        y: 500,
        xV: 0,
        yV: 0,
        planTimer: 10,
        interruptible: false,
        color: "#5533BB",
        houseColor: "#000000",
    });

    tomoList.push({
        x: 500,
        y: 500,
        xV: 0,
        yV: 0,
        planTimer: 10,
        interruptible: false,
        color: "#33CCDD",
        houseColor: "#229999",
    });

    tomoList.push({
        x: 500,
        y: 500,
        xV: 0,
        yV: 0,
        planTimer: 10,
        interruptible: false,
        color: "#89d809",
        houseColor: "#593972ff",
    });

    //start game logic loop and animation loop
    setInterval(update,16);
    requestAnimationFrame(draw);
}

//initialize game
init();