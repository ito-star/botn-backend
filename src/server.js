import http from 'http';
import app from './app.js';
const port = process.env.PORT || 5000;
var server = http.createServer(app);
server.listen(port, () => {
  console.log("Server started at port:" + port)
});