const fs = require('fs');
const path = require('path');
const filepath = './data/task.json';
 exports.writeTaskToFile = (task) =>{
    fs.writeFileSync(filepath, JSON.stringify(task, null, 2));
}
 exports.readTaskFromFile = () =>{
    if(!fs.existsSync(filepath)){
     this.writeTaskToFile([])

    }
    const data = fs.readFileSync(filepath);
    return JSON.parse(data);
}