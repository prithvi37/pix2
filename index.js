const canvas = document.querySelector('canvas') 
const c = canvas.getContext('2d');// is used to obtain the 2d rendering "('2d)" of an html canvas element ("canvas") which allows you to draw grahics and other visual elements on canvas using js



canvas.width = 1024;
canvas.height = 576;
const collisionsMap = []

for (let i=0;i<collisions.length;i+=50)  // this will transform the array into sub array in batches of 50
{
    collisionsMap.push(collisions.slice(i,50+i))
}

const infoZonesMap = []

for (let i=0;i<infozonedata.length;i+=50)  // this will transform the array into sub array in batches of 50
{
    infoZonesMap.push(infozonedata.slice(i,50+i))
}





class Boundary{
    static width = 64;
    static height = 64;
    constructor({position}){
        this.position=position
        this.width=64
        this.height=64
    }

draw(){

    c.fillStyle= 'rgba(255,0,0,0.0)'
    c.fillRect(this.position.x,this.position.y,this.width,this.height)
    }       

}

const boundaries = []
const offset={
    x:-700,
    y:-200
}
collisionsMap.forEach((row, i)=>{
    row.forEach((symbol,j)=>{
       if(symbol===2655)        
        boundaries.push(
            new Boundary({
                position: {
                    x:j*Boundary.width+offset.x,
                    y:i*Boundary.height+offset.y
                }    
            })
        )
    })
})
// const shiftAmountX = -250; // Adjust this value according o how much you want to shift the boundaries to the left
// const shiftAmountY = 108; // Adjust this value according to how much you want to shift the boundaries vertically
// boundaries.forEach(boundary => {
//     boundary.position.x -= shiftAmountX;
//     boundary.position.y += shiftAmountY;
// });


const infoZones=[]
infoZonesMap.forEach((row, i)=>{
    row.forEach((symbol,j)=>{
       if(symbol===2655)        
        infoZones.push(
            new Boundary({
                position: {
                    x:j*Boundary.width+offset.x,
                    y:i*Boundary.height+offset.y
                }    
            })
        )
    })
})




c.fillRect(0,0,canvas.width,canvas.height)
const image = new Image() // map image object
image.src = 'roadmap2.png'

const playerUpImage = new Image() //player image object
playerUpImage.src = 'playerUp.png'

const playerLeftImage = new Image() //player image object
playerLeftImage.src = 'playerLeft.png'

const playerRightImage = new Image() //player image object
playerRightImage.src = 'playerRight.png'

const playerDownImage = new Image() //player image object
playerDownImage.src = 'playerDown.png'


class Sprite{
    constructor({position,velocity,image, frames={max:1}, sprites}){
        this.position = position
        this.image = image
        this.frames={...frames,val:0, elapsed: 0}
        this.image.onload = () =>{
            this.width = this.image.width/this.frames.max
            this.height = this.image.height
        }
        this.moving = false
        this.sprites=sprites
    }
    

    draw(){
        c.drawImage(
            this.image,
            this.frames.val*this.width,                   
            0,                                   
            this.image.width/this.frames.max,                 
            this.image.height,                 
            this.position.x,
            this.position.y,
            this.image.width/this.frames.max,               
            this.image.height
            )
    if(!this.moving) return
    if(this.frames.max > 1){
        this.frames.elapsed++;
    }
    if (this.frames.elapsed % 10 === 0) {
        if(this.frames.val < this.frames.max - 1) {
            this.frames.val++;
        } else {
            this.frames.val = 0;
        }
    }
    
}
}

const  player = new Sprite({
    position:{
        x:canvas.width/2-192/4/2,
        y:canvas.height/2-68/2
    },
    image : playerDownImage,
    frames:{
        max:4
    },
    sprites:{
        up:playerUpImage,
        left:playerLeftImage,
        right:playerRightImage,
        down:playerDownImage
    }
})
const background = new Sprite({
    position: {
        x:offset.x,
        y:offset.y
    },
    image:image

})

const keys = {
    w:{
        pressed:false
    },
    a:{
        pressed:false
    },
    s:{
        pressed:false
    },
    d:{
        pressed:false
    },
}

const testBoundary = new Boundary({
    x:400,
    y:400
})

const movables = [background, ...boundaries,...infoZones]
function rectangularCollision({rectangle1, rectangle2}) {
    return (
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y
    );
}
const battle={
    initiated:false
}


//animation loop 
function animate(){
    const animationid  = window.requestAnimationFrame(animate)
    background.draw()
    boundaries.forEach(boundary => {
        boundary.draw()
    })
    infoZones.forEach(infoZone=>{
        infoZone.draw()
    })
    player.draw()

    let moving = true
    player.moving=false
    const infoZone = infoZones.find(infoZone => rectangularCollision({ rectangle1: player, rectangle2: infoZone }));
    
    //activate battle
    const margin = 30; // Adjust the margin as needed

    if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
        for (let i = 0; i < infoZones.length; i++) {
            const infoZone = infoZones[i];
            const isPlayerInsideInfoZoneNow = (
                player.position.x + player.width >= infoZone.position.x + margin &&
                player.position.x <= infoZone.position.x + infoZone.width - margin &&
                player.position.y + player.height >= infoZone.position.y + margin &&
                player.position.y <= infoZone.position.y + infoZone.height - margin
            );
    
            if (isPlayerInsideInfoZoneNow && !battle.initiated) {
                // Trigger battle immediately
                battle.initiated = true;
                gsap.to("#overlappingDiv", {
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete() {
                        gsap.to('#overlappingDiv', {
                            opacity: 1,
                            duration: 0.4,
                            onComplete() {
                                const overlappingDiv = document.getElementById('overlappingDiv');
                                overlappingDiv.innerHTML = `
                                    <div style="color:white; font-size:20px; font-family:'Press Start 2P';position:absolute;overflow:auto top:20px; left:20px;"></div>
                                    <button id="okayButton" style="position:fixed; bottom:20px; right:20px; padding:10px 20px; background-color:green; color:white; border:none;border-radius: 10px; cursor:pointer;">next</button>
                                `;
                                // Draw information within the black info zone
                                const textDiv = document.createElement('div');
                                textDiv.style.color = 'white';
                                textDiv.style.fontSize = '13px';
                                textDiv.style.position = 'absolute';
                                textDiv.style.fontFamily = 'Press Start 2P';
                                textDiv.style.top = '100px';
                                textDiv.style.left = '100px';
                                if (infoZone === infoZones[0]) {
                                    textDiv.innerText = `Player location: India\n\n\nSri Chaitaniya Hyderabad :senior secondary        -(2015-2017)\n\n\n\nSkills Acquired:\n\n\n\nPhysics\n\nChemistry\n\nMath`;
                                } else if (infoZone === infoZones[1]) {
                                    textDiv.innerText = `Player location: India\n\n\n VIT Chennai:B-Tech Electrical and Electronics         -(2017-2021)\n\n\n\nSkills Acquired:\n\n\n\nKeil vision\n\nFPGA coding\n\nPython\n\nMATLAB\n\nLT-spice\n\nPSCAD`; 
                                }else if(infoZone===infoZones[2]){
                                    textDiv.innerText = `Player location: Canada\n\n\nPlayer Status: Student\n\n\nSkills Acquired:\n\n\n\nCareer goals\n\nHardworking\n\nTime management\n\nself-reliant\n\nCan do Attitude`
                                }else if(infoZone===infoZones[3]){
                                    textDiv.innerText = `Player location: Canada\n\n\n Georgian College Barrie campus:  Post-Graduate Certification in Big Data Analytics       -(2022)\n\nGeorgian College Barrie campus: Post-Graduate Certification in Artificial Intelligence Design and Implementation       -(2023)\n\n\nPlayer status: Student\n\n\n\nAchievements:\n\nHonor – Dean’s List Academic Achievement Award     -(2022-2023)\n\n\n\nSkills Acquired:\n\n\n\nPython\n\nSQL\n\nData analysis\n\nBigdata\n\nNatural language processing\n\nData mining\n\nData visualization\n\nDatabase modelling\n\nPowerBi\n\nTableau\n\nMachine Learning\n\nData cleaning-Preprocessing\n\n\n\nFrameworks :\n\n\nTensorflow\n\nPyspark\n\nGCP\n\nAWS\n\nNLTK`
                                }else if(infoZone===infoZones[4]){
                                    textDiv.innerText = `Player location: Canada\n\n\nPlayer status: Student\n\n\n Indian Restaurant:  Part Time chef\n\n\nSkills Acquired:\n\n\nTeamwork\n\nPressure handling\n\nEffective communication\n\nDeadlines\n\nCooking skills\n\nInnovation\n\nTime Management\n\nPlanning\n\nExecution\n\n`
                                }else if(infoZone===infoZones[7]){
                                    textDiv.innerText = `Player location: Canada\n\n\nPlayuer status: Work Permit\n\n\nSpecial Skill acquired:\n\n\nSelf learning\n\n\nstarted learning skills via youtube linkedin learning ,etc\n\n\nlearned HTML\n\nCSS\n\nJavascript`
                                }else if(infoZone===infoZones[8]){
                                    textDiv.innerText=`Player location: Canada\n\n\nPlayer status: Work permit\n\n\nSpecial Skill acquired:\n\n\nSelf learning\n\n\nStarted learning skills via youtube linkedin learning, etc\n\n\nlearning Software development\n\n\nDSA`
                                }
                                else{
                                    textDiv.innerText=`Player location: Canada\n\n\nSkills used in this project:\n\n\nHTML\n\nJavascript\n\nMath\n\nGeometry\n\nTiled\n\nDSA\n\n\nPlayer is currently learning DSA in dept`
                                }
                                overlappingDiv.appendChild(textDiv); 
                                   
                                
                                
                                // Add event listener to the Okay button
                                const okayButton = document.getElementById('okayButton');
                                okayButton.addEventListener('click', handleOkayButtonClick);
                            }
                        });
                    }
                });
            }
            
        }
    }
        // Handle Okay button click
    function handleOkayButtonClick() {
        // Move the player outside the info zone
        const playerLeftEdge = player.position.x;
        const playerTopEdge = player.position.y;

        // Set player position to the right of the info zone
        const playerRightEdge = infoZone.position.x + infoZone.width;
        player.position.x = playerRightEdge + 5; // Adjust the position as needed
        player.position.y = playerTopEdge; // Keep the same y-position

        // Hide the info zone and reset game state
        battle.initiated = false;

        // Clear the text and button from the overlappingDiv
        const overlappingDiv = document.getElementById('overlappingDiv');
        overlappingDiv.innerHTML = '';

        // Set opacity of overlappingDiv to 0
        gsap.to('#overlappingDiv', { opacity: 0 });

        
    }

// Event listener for Okay button click
document.getElementById('overlappingDiv').addEventListener('click', function(event) {
    // Get the coordinates of the click event
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Check if the click is within the bounds of the Okay button
    const okayButtonX = canvas.width - 20 - 120; // Adjust button x-coordinate
    const okayButtonY = canvas.height - 20 - 50; // Adjust button y-coordinate
    const okayButtonWidth = 120; // Adjust button width
    const okayButtonHeight = 50; // Adjust button height
    if (mouseX >= okayButtonX && mouseX <= okayButtonX + okayButtonWidth &&
        mouseY >= okayButtonY && mouseY <= okayButtonY + okayButtonHeight) {
        // If click is within the button bounds, handle the Okay button click
        handleOkayButtonClick();
    }
});

        
    if (keys.w.pressed  && lastKey === 'w') {
        player.moving = true
        player.image=player.sprites.up;
        for(let i=0; i<boundaries.length;i++){
            const boundary = boundaries[i];
            if(
                rectangularCollision({
                    rectangle1:player,
                    rectangle2:{...boundary, position:{
                        x: boundary.position.x,
                        y: boundary.position.y+3
                    }}
                })
            ){  
                moving=false
                break
    
            }
        }

        



        if (moving)
        movables.forEach((movable) => {
            movable.position.y+=3})
    }
    else if (keys.a.pressed && lastKey === 'a') {
        player.moving = true
        player.image=player.sprites.left

        for(let i=0; i<boundaries.length;i++){
            const boundary = boundaries[i];
            if(
                rectangularCollision({
                    rectangle1:player,
                    rectangle2:{...boundary, position:{
                        x: boundary.position.x+3,
                        y: boundary.position.y
                    }}
                })
            ){  
                moving=false
                break
    
            }
        }
        if (moving)
            movables.forEach((movable) => 
                {movable.position.x+=3})
    }
    else if (keys.d.pressed && lastKey === 'd'){
        player.moving = true
        player.image=player.sprites.right;
        for(let i=0; i<boundaries.length;i++){
            const boundary = boundaries[i];
            if(
                rectangularCollision({
                    rectangle1:player,
                    rectangle2:{...boundary, position:{
                        x: boundary.position.x-3,
                        y: boundary.position.y
                    }}
                })
            ){  
                moving=false
                break
    
            }
        }
        if (moving)
            movables.forEach((movable) => 
                {movable.position.x-=3})
    }
    else if (keys.s.pressed && lastKey === 's'){
        player.moving = true
        player.image=player.sprites.down;
        for(let i=0; i<boundaries.length;i++){
            const boundary = boundaries[i];
            if(
                rectangularCollision({
                    rectangle1:player,
                    rectangle2:{...boundary, position:{
                        x: boundary.position.x,
                        y: boundary.position.y-3
                    }}
                })
            ){  
                moving=false
                break
    
            }
        }
        if (moving)
            movables.forEach((movable) => 
                {movable.position.y-=3})
    }
}
animate()



let lastKey =''
window.addEventListener('keydown',(e) =>{             // event listener to listen the users event ,docs event any events in this case game control
    switch(e.key){              
        case 'w':                                      // key pressed down 
            keys.w.pressed = true
            lastKey = 'w'
            break;
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            break;
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break;
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break;

            

    }
    console.log(keys)

})

window.addEventListener('keyup',(e) =>{             // event listener to listen the users event ,docs event any events in this case game control
    switch(e.key){              
        case 'w':                                    // key pressed up
            keys.w.pressed = false
            break;
        case 'a':
            keys.a.pressed = false
            break;
        case 's':
            keys.s.pressed = false
            break;
        case 'd':
            keys.d.pressed = false
            break;

            

    }
    console.log(keys)

})



