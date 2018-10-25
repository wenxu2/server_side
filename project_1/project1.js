/*
 * Group: 10
 * Author: Wenwen Xu, Richard Sheeder
 * Name: Project 1
 * Description: This proejct ask the user inputs and calculates what materials the user need in order to build the shed. 
 */

//enable to prompt the user in the command line
 let readlineSync = require('readline-sync');

//initzlize variables
let length_shed, width_shed, windows = -1;
let wall_area, plywood_amount, windowAndDoor_area, total_wall_area;
let number_studs_horizontal, number_studs_vertical, total_number_studs;

//Each window size is 18" x 27" (1.5' x 2.25'). 
let width_window = 1.5;
let length_window = 2.25;

//calculate the area of the window
let window_area = width_window * length_window;

//Each door size is 72" x 80" (6' x 6.67' ).
let width_door = 6;
let length_door = 6.67;

//calculate the area of the door
let door_area = width_door * length_door;

//Plywood sheets are 4' x 8'.
let length_plywood = 8;
let width_plywood = 4;

//calculate the area for the plywood
let area_plywood = length_plywood * width_plywood;

//Shed is 8' tall, and we need 2 of each wall
let length_wall = 8;
let number_walls_needed = 2;

//8' 2"x4" (0.167' x 0.333' )studs, each stud is 16"(1.33') apart
let space_stud = 1.333;
let length_stud = 8;

//price for the material
let price_plywoord = 19.85;
let price_stud = 3.27;
let price_door = 631.28;
let price_window = 121.17;

/*
 * ask the user info about the shed dimensions. 
 * The length and width of the shred need to be at least as same as the door. 
 * door : 72" x 80" (6' x 6.667')
 * shed walls can be between 6 - 20 feet long
 */

while( length_shed < 6 || isNaN(length_shed) || length_shed > 20 ) {
    
    length_shed = readlineSync.question('What is the length of the shed in feet?(Enter a number between 6 - 20):\n');
}

while( width_shed < 6 || isNaN(width_shed) || width_shed > 20 ) {
    
    width_shed = readlineSync.question('What is the width of the shed in feet?(Enter a number between 6 - 20):\n');
}

//sheds can have between 0 and 3 windows
while( windows < 0 || isNaN(windows) || windows > 3) {
    
    windows = readlineSync.question('How many windows will be installed?(Enter a number between 0 - 3):\n');
}

// Calculate the area of all walls combined and subtract out the area of the door and windows. 
total_wall_area =((length_shed * length_wall) * number_walls_needed) + ((width_shed * length_wall) * number_walls_needed);
windowAndDoor_area = parseFloat(Math.round(window_area * windows + door_area).toFixed(2));
wall_area = parseFloat(Math.round(total_wall_area - windowAndDoor_area).toFixed(2));

/*
* Calculates the amount of plywood sheets that will be need to be purchased. 
* Math.ceil forces number to round up since plywood must be purchased whole.
* calculate the number fo studs needed
* add 1 to the number of studs at the end
*/
plywood_amount = Math.ceil(wall_area / area_plywood);
number_studs_horizontal = Math.ceil((length_shed / space_stud + 1)) + Math.ceil((length_shed/length_stud)) * 2;
number_studs_vertical = Math.ceil((width_shed / space_stud + 1)) + Math.ceil((width_shed/length_stud)) * 2;
total_number_studs = (parseInt(number_studs_horizontal) + parseInt(number_studs_vertical)) * 2;

//calculate the cost for each material
let total_plywood = (plywood_amount * price_plywoord).toFixed(2);
let total_window = (windows * price_window).toFixed(2);
let total_door = (price_door).toFixed(2);
let total_stud = (total_number_studs * price_stud).toFixed(2);

//calcualte the total cost
let total = (parseFloat(total_plywood) + parseFloat(total_window) + parseFloat(total_door) + parseFloat(total_stud)).toFixed(2);

//Print to the terminal what are need to buy
console.log('Here is the shopping list for this shed:');
console.log('-----------------------------------------');
console.log('Windows   ' + windows + '  -  $ ' + total_window);
console.log('Door      ' + '1' + '  -  $ ' + total_door);
console.log('Plywood:  ' + plywood_amount + '  -  $ ' + total_plywood);
console.log('Studs     ' + total_number_studs + '  -  $ ' + total_stud);
console.log('Total Cost' + '    -  $ ' + total);

//exit the program
process.exit(0)