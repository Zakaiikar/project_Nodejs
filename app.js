const http = require('http');
const taskRoutes = require('./routes/taskRoutes');
const HostNqame = 'localhost'
const port = 9000
const server = http.createServer((req, res) => {
    if (req.url.startsWith('/task')) {
        taskRoutes(req, res)
        
    }else{
        res.writeHead(404,'not found' ,{'Content-Type': 'application/json'});
        res.end(JSON.stringify({
            message: 'sorry....you got lost',
        }));
    }
});
server.listen(port,HostNqame, ()=>{
    console.log(`Server is running on port ${port}`);

});
