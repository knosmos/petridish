let w = window.innerWidth;
let h = window.innerHeight;

let unitSize = Math.min(w,h)/256;

let timeWarp = 1;

// Color scheme
colorScheme = {
    'background':'rgb(0, 0, 40)',
    'cell':'rgb(255, 252, 249)',
    'eye':'rgb(255, 209, 102)',
    'jet':'rgb(239, 71, 111)',
    'food':'rgb(15, 163, 177)'
}

let somethingSelected = false;

// Creatures
let creatures = [];

// Food Particles
let foods = [];

// Exhaust effect
let smokes = [];

// Shapes
eyeShape = [
    [0,1],
    [0,1],
    [-3,-1],
    [0,-2],
    [3,-1],
    [0,1],
    [0,1]
];

jetShape = [
    [-1,-3.5],
    [1,-3.5],
    [1,2.5],
    [0,2.5],
    [1,3.5],
    [-1,3.5],
    [0,2.5],
    [-1,2.5]
];

function getOriginalData(){
    let n = new URLSearchParams(window.location.search)
    return JSON.parse(n.get('data'));
}

// Rotate point around a center by a specified number of degrees
function spin(point,center,deg){ //Can't use rotate as function name due to p5 rotate function
    let pX = point[0]-center[0];
    let pY = point[1]-center[1];
    let nX = pX*Math.cos(deg*Math.PI/180) - pY*Math.sin(deg*Math.PI/180);// + center[0];
    let nY = pY*Math.cos(deg*Math.PI/180) + pX*Math.sin(deg*Math.PI/180);// + center[1];
    return [nX,nY];
}

// This function made by Pythagoras Gang
function distance(x1,y1,x2,y2){
    let sX = (x1-x2)*(x1-x2); // Optimized for speed
    let sY = (y1-y2)*(y1-y2);
    return Math.sqrt(sX+sY);
}

function randint(lower,higher){
    return Math.round(Math.random()*(higher-lower))+lower;
}

function setup(){
    createCanvas(w,h);
    textFont('sans-serif');
    textSize(20);
    textAlign(CENTER,CENTER);
    for(let i=0;i<10;i++){
        creatures.push(new creature([randint(0,w),randint(0,h)],getOriginalData(),[]))
    }
    for(let i=0;i<100;i++){
        foods.push(new food());
    }
}

class creature{
    constructor(pos,parts,data){
        this.parts = parts; // Position + rotation of components
        this.data = data; // Values for states
        this.state = 0; // Nothing detected

        this.pos = pos;
        this.rotation = 0;
        this.speed = 0;
        this.moveDirection = 0;

        this.smokeCtr = 0;
    }
    render(){
        noStroke();
        fill(colorScheme['cell']);
        circle(this.pos[0],this.pos[1],unitSize*16);
        fill(200,200,200);
        circle(this.pos[0],this.pos[1],unitSize*8);
        for(let part of this.parts){
            if(part[0] === 'eye'){
                fill(colorScheme['eye']);
                beginShape();
                for(let i of eyeShape){
                    let rotatedPoint = spin(i,[0,0],part[2]);
                    rotatedPoint=spin([rotatedPoint[0]*unitSize+part[1][0]*unitSize+this.pos[0],rotatedPoint[1]*unitSize+part[1][1]*unitSize+this.pos[1]],[this.pos[0],this.pos[1]],this.rotation);
                    curveVertex(rotatedPoint[0]+this.pos[0],rotatedPoint[1]+this.pos[1]);
                }
                endShape(CLOSE);                  
            }
            if(part[0] === 'jet'){
                fill(colorScheme['jet'])
                beginShape();
                for(let i of jetShape){
                    let rotatedPoint = spin(i,[0,0],part[2]);
                    rotatedPoint=spin([rotatedPoint[0]*unitSize+part[1][0]*unitSize+this.pos[0],rotatedPoint[1]*unitSize+part[1][1]*unitSize+this.pos[1]],[this.pos[0],this.pos[1]],this.rotation);
                    vertex(rotatedPoint[0]+this.pos[0],rotatedPoint[1]+this.pos[1]);
                }
                endShape(CLOSE);
                if(this.smokeCtr>1){
                    let smokePoint = spin([this.pos[0]+part[1][0]*unitSize,this.pos[1]+part[1][1]*unitSize],this.pos,this.rotation);
                    smokes.push(new smoke([smokePoint[0]+this.pos[0],smokePoint[1]+this.pos[1]]));
                }     
            }
        }
        if(this.smokeCtr>1){
            this.smokeCtr = 0;
        }
        else{
            this.smokeCtr += 1;
        } 
    }
    propel(){
        //TODO ADD ROTATION LOGIC

        let rotationChange = 0;
        let xChange = 0;
        let yChange = 0;

        for(let part of this.parts){
            if(part[0]==='jet'){
                let trueDir = part[2];
                if(trueDir < 0){
                    trueDir += 360;
                }
                let posChanges = spin([Math.cos((trueDir-90)*Math.PI/180),Math.sin((trueDir-90)*Math.PI/180)],[0,0],this.rotation);
                xChange += posChanges[0];
                yChange += posChanges[1];

                let normal = Math.atan(part[1][1]/part[1][0])*180/Math.PI;
                let dist = distance(part[1][0],part[1][1],0,0);
                if(part[1][0]>0){
                    dist *= -1;
                }
                let thisRotationChange = Math.sin((trueDir-normal+90)*Math.PI/180)*dist;
                //if(part.pos>)
                rotationChange += thisRotationChange;
            }
        }

        this.rotation += rotationChange;
        this.pos[0] += xChange;
        this.pos[1] += yChange;

        if(this.pos[0]>w){
            this.pos[0] = 0;
        }

        if(this.pos[0]<0){
            this.pos[0] = w;
        }

        if(this.pos[1]>h){
            this.pos[1] = 0;
        }

        if(this.pos[1]<0){
            this.pos[1] = h;
        }
    }
    locate(){

    }
    consume(){

    }
}

class food{
    constructor(){
        this.pos = [randint(0,w),randint(0,h)];
    }
    render(){
        fill(colorScheme['food']);
        circle(this.pos[0],this.pos[1],5);
    }
}

class smoke{
    constructor(pos){
        this.pos = pos;
        this.visibility = 100;
        this.size = 0;
    }
    doStuff(){
        //render and change attributes
        fill(255,this.visibility);
        circle(this.pos[0],this.pos[1],this.size);
        this.visibility -= 5;
        this.size += 1;
    }
}

function revert(){
    window.location.href = 'builder.html';
}

function draw(){
    background(colorScheme['background']);
    for(let j of creatures){
        j.render();
        for(let i=0; i<timeWarp; i++){
            j.propel();
        }
        //j.rotation += 1;
    }
    for(let i of foods){
        i.render();
    }
    for(let i=0; i<smokes.length; i++){
        smokes[i].doStuff();
        if(smokes[i].visibility<0){
            smokes.splice(i,1);
        }
    }
}