let w = window.innerWidth;
let h = window.innerHeight;

let unitSize = Math.min(w,h)/32;

// Color scheme
colorScheme = {
    'background':'rgb(0, 0, 40)',//'rgb(66, 75, 84)',
    'cell':'rgb(255, 252, 249)',
    'eye':'rgb(255, 209, 102)',
    'jet':'rgb(239, 71, 111)'
}

let somethingSelected = false;

// DRAGGABLES
let draggables = [];

// Rotate point around a center by a specified number of degrees
function spin(point,center,deg){ //Can't use rotate as function name due to p5 rotate function
    let pX = point[0]-center[0];
    let pY = point[1]-center[1];
    let nX = pX*Math.cos(deg*Math.PI/180) - pY*Math.sin(deg*Math.PI/180) + center[0];
    let nY = pY*Math.cos(deg*Math.PI/180) + pX*Math.sin(deg*Math.PI/180) + center[1];
    return [nX,nY];
}

// This function made by Pythagoras Gang
function distance(x1,y1,x2,y2){
    let sX = (x1-x2)*(x1-x2); // Optimized for speed
    let sY = (y1-y2)*(y1-y2);
    return Math.sqrt(sX+sY);
}

function setup(){
    createCanvas(w,h);
    textFont('sans-serif');
    textSize(20);
    textAlign(CENTER,CENTER);
}

class draggable{
    constructor(pos){
        this.shape = [
            [0,0],
            [0,2],
            [2,2],
            [2,0] // unit size depends on main circle size
        ];
        this.radius = 1;
        this.rotation = 0;
        this.pos = pos;
        this.dragging = false;
        this.active = false;
        this.spinning = false;
        this.color = 'grey'; // standard grey
    }
    render(){
        noStroke();
        fill(this.color);
        beginShape();
        for(let i of this.shape){
            let rotatedPoint = spin([i[0]*unitSize+this.pos[0],i[1]*unitSize+this.pos[1]],this.pos,this.rotation);
            vertex(rotatedPoint[0],rotatedPoint[1]);
        }
        endShape(CLOSE);
        if(this.active){
            this.rotationCircle();
        }
    }
    drag(){
        if(mouseIsPressed){
            if(distance(this.pos[0],this.pos[1],mouseX,mouseY)<unitSize*this.radius && ! this.spinning && ! somethingSelected){
               this.dragging = true; 
               somethingSelected = true;
            }
        }
        else if(this.dragging){
            this.active = true;
            this.dragging = false;
            somethingSelected = false;
        }
        if(this.dragging){
            this.pos = [Math.round(mouseX),Math.round(mouseY)];
        }
    }
    rotationCircle(){
        /*let dotPos = spin([this.center[0],this.center[1]-1],this.center,this.rotation);
        dotPos[0] = dotPos[0]*this.radius*1.5*unitSize+this.pos[0];
        dotPos[1] = dotPos[1]*this.radius*1.5*unitSize+this.pos[1];*/

        let dotPos = spin([this.pos[0],this.pos[1]-this.radius*1.5*unitSize],this.pos,this.rotation);

        noFill();
        stroke(100);
        circle(this.pos[0],this.pos[1],this.radius*3*unitSize);
        fill(100,255,100);
        circle(dotPos[0],dotPos[1],20);

        fill(0);
        noStroke();
        text(Math.round(this.rotation).toString()+'°',this.pos[0],this.pos[1]);

        if(mouseIsPressed){
            if(distance(dotPos[0],dotPos[1],mouseX,mouseY)<20){
                this.spinning = true;
                this.active = true;
                somethingSelected = true;
            }
            else if(distance(this.pos[0],this.pos[1],mouseX,mouseY)>unitSize*this.radius&& ! this.spinning){
                this.active = false;
                somethingSelected = false;
            }
        }
        else if(this.spinning){
            this.spinning = false;
            somethingSelected = true;
        }
        
        if(this.spinning){
            this.rotation = Math.round((180/Math.PI)*Math.atan((mouseY-this.pos[1])/(mouseX-this.pos[0]))-90);
            if(mouseX>=this.pos[0]){
                this.rotation += 180;
            }
        }
    }
}

class eye extends draggable{
    constructor(pos,rotation){
        super(pos);
        this.shape = [
            [3,3],
            [3,3],
            [0,1],
            [3,0],
            [6,1],
            [3,3],
            [3,3]
        ];
        this.shape = [
            [0,1],
            [0,1],
            [-3,-1],
            [0,-2],
            [3,-1],
            [0,1],
            [0,1]
        ];
        this.center = [3,2];
        this.color = colorScheme['eye'];
        this.radius = 3;
        this.type = 'eye';
        this.rotation = rotation;
    }
    render(){ // My sister wants a more eyelike shape
        noStroke();
        fill(this.color);
        beginShape();
        for(let i of this.shape){
            let rotatedPoint = spin([i[0]*unitSize+this.pos[0],i[1]*unitSize+this.pos[1]],this.pos,this.rotation);
            curveVertex(rotatedPoint[0],rotatedPoint[1]);
        }
        endShape(CLOSE);
        if(this.active){
            this.rotationCircle();
        }
    }
}

class jet extends draggable{
    constructor(pos,rotation){
        super(pos);
        this.shape = [
            [0,0],
            [2,0],
            [2,6],
            [1,6],
            [2,7],
            [0,7],
            [1,6],
            [0,6]
        ];
        this.shape = [
            [-1,-3.5],
            [1,-3.5],
            [1,2.5],
            [0,2.5],
            [1,3.5],
            [-1,3.5],
            [0,2.5],
            [-1,2.5]
        ];
        this.center = [1,3.5];
        this.color = colorScheme['jet'];
        this.radius = 3.5;
        this.type = 'jet';
        this.rotation = rotation;
    }
}

function keyPressed(){
    if(keyCode===BACKSPACE){
        for(let i=0; i<draggables.length; i++){
            if(draggables[i].dragging || draggables[i].active){
                draggables.splice(i,1);
            }
        }
    }
}

function getOriginalData(){
    let n = new URLSearchParams(window.location.search)
    n = JSON.parse(n.get('data'));
    console.log(n);
    for(let i of n){
        if(i[0] == 'eye'){
            draggables.push(new eye(w/2+i[1]*unitSize,h/2+i[2]*unitSize))
        }
        if(i[0] == 'jet'){
            draggables.push(new jet(w/2+i[1]*unitSize,h/2+i[2]*unitSize))
        }
    }
}

try{
    getOriginalData();
}
catch(err){
    console.log(err);
}

// Send the user to sim.html
function launch(){
    // Get all the draggables into a list
    designData = [];
    for(let i of draggables){
        designData.push([i.type,[(i.pos[0]-w/2)/unitSize,(i.pos[1]-h/2)/unitSize],i.rotation]);
    }
    window.location.href = "sim.html?data="+JSON.stringify(designData);
}

function draw(){
    background(colorScheme['background']);
    fill(colorScheme['cell']);
    circle(w/2,h/2,Math.min(w,h)/2);
    noStroke();
    fill(200,200,200);
    circle(w/2,h/2,Math.min(w,h)/4);
    fill(100,100,100);
    text("Drag items here",w/2,h/2);
    stroke(1);
    for(let i of draggables){
        i.render();
        i.drag();
    }
}