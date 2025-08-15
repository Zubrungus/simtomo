const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

const houseSize:number = 300;
const wallWidth:number = 20;
const doorSize:number = 25; //half of what the door size will actually be

function drawHouse(x: number, y: number, color: string){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, wallWidth, houseSize);
    ctx.fillRect(x, y, houseSize, wallWidth);
    ctx.fillRect(x + houseSize - wallWidth, y, wallWidth, houseSize);
    ctx.fillRect(x, y + houseSize - wallWidth, (houseSize / 2) - doorSize, wallWidth);
    ctx.fillRect(x + (houseSize / 2) + doorSize, y + houseSize - wallWidth, (houseSize / 2) - doorSize, wallWidth);
}

function update(){
    
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawHouse(40, 10, "black");
    requestAnimationFrame(draw);
}

setInterval(update,16);
requestAnimationFrame(draw);