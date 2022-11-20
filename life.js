// JavaScript implementation of
// the above approach

let grid;


window.onload = function(){
    grid = [[0, 0, 0, 0, 0, 0, 0 ],
    [0, 0, 0, 0, 0, 0, 0 ],
    [0, 0, 0, 1, 0, 0,  0],
    [0, 0, 0, 1, 0, 0, 0 ],
    [0, 0, 0, 1, 1, 0, 0 ], 
    [0, 0, 0, 0, 1, 0, 0 ],
    [0, 0, 0, 0, 0, 0, 0 ],]
    update(grid)
}

const playButton = document.querySelector('button');
playButton.addEventListener('click', function() {
    
    solve(grid)
    update(grid)

}, false);

function update(grid){

	for(let i=1;i<6;i++){
		for(let j=1;j<6;j++){
            if (grid[i][j] == 1){
                document.getElementById(i.toString() + j.toString()).style.backgroundColor = '#208AAE';
            }
            else{
                document.getElementById(i.toString() + j.toString()).style.backgroundColor = '#F9EBE0';
            }
		}
	}
}





function solve(grid){
    let newGrid = [[], [], [], [], [], [], []];
    for (let i = 0; i<7; i++){
        for (let j = 0; j<7; j++){
            newGrid[i][j] = grid[i][j];
        }
    }
    for (let i = 1; i<6; i++){
        console.log(newGrid[i-1])
        for (let j = 1; j<6; j++){
            let change = 0;
            if (grid[i-1][j-1] > 0){
                change++;
            }
            if (grid[i-1][j] > 0){
                change++;
            }
            if (grid[i-1][j+1] > 0){
                change++;
            }
            if (grid[i][j-1] > 0){
                change++;
            }
            if (grid[i][j+1] > 0){
                change++;
            }
            if (grid[i+1][j-1] > 0){
                change++;
            }
            if (grid[i+1][j] > 0){
                change++;
            }
            if (grid[i+1][j+1] > 0){
                change++;
            }

            if (grid[i][j] > 0 && !(change == 2 || change == 3)){
                newGrid[i][j] = 0;
            }
            if (grid[i][j] == 0 && change == 3){
                newGrid[i][j] = 1;
            }
        }
    }
    for (let i = 0; i<7; i++){
        for (let j = 1; j<7; j++){
            grid[i][j] = newGrid[i][j];
        }
    }
}





