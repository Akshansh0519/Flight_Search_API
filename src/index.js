const { ServerConfig  , Logger} = require('./config');

const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.options('*', cors({ origin: true, credentials: true }));
const apiRoutes = require('./routes');

app.use(express.json());
app.use(express.urlencoded({extended : true}));

app.use('/api',apiRoutes);
//app.use('/flightService/api',apiRoutes); // used path.rewrite in nginx.conf to rewrite the path to /api

app.listen(ServerConfig.PORT,()=>{
    console.log(`Server is running on port ${ServerConfig.PORT}`);
    Logger.info(`Server is running on port ${ServerConfig.PORT}`,{});/*ctrl+s to save and check the logs*/ 
})


/*
the flow is 
/api routes  -> /v1 routes - > /airplanes routes ->
 controllers -> services(business logic) -> 
 repositories(generally they only interact with the DBs) -> models
*/