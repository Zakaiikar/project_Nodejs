const {IncomingForm} = require('formidable');
const { readTaskFromFile } = require("../utils/fileHandler");
const {copyFileSync}= require('fs');
const path = require('path');

exports.getTasks = (req, res)=> {
const task = readTaskFromFile();
res.writeHead(200,{'Content-Type': 'application/json'})
 res.end(JSON.stringify(task));
  

};
exports.createTask= (req, res)=> {
 const form = new IncomingForm();
 form.parse(req, (err, fields, files) => {
    if (err) {
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({
        message: 'error passing'
      }));
      return;
    }
const task = readTaskFromFile();
  const newTask = { 
    id: Date.now(),
    title: fields.title,
    description: fields?.description || '',
    status: fields?.status ||'pending',
    Image: files.image?'/uploads/${files.image.name}': null,
  
    
};

  task.push(newTask);
  writeTaskToFile(task);
  if(files.Image){
    copyFileSync(files.image.path, path.join(__dirname, '../uploads', files.Image.name));
    res.end(JSON.stringify(newTask))
  }

 });
}
exports.updateTask=(req, res) => {
    res.end(JSON.stringify({
        message: 'not yet implemented'
    }));
}

exports.deleteTask=(req, res) => { 
    res.end(JSON.stringify({
    message: 'not yet implemented'
     
}));}

