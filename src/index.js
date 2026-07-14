const { ServerConfig  , Logger} = require('./config');

const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});
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