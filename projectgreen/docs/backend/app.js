const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

const allowedOrigins = ['http://localhost:3000',
    'http://njpotshop.com', 'http://njpotshop.com:3000',
];

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
// app.options('*', cors());
app.use(cors({
    origin: 'http://www.njpotshop.com',
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));


//middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt());
// app.use('/', express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public'));
app.use(errorHandler);

//Routes
const categoriesRoutes = require('./routers/categories');
const productsRoutes = require('./routers/products');
const usersRoutes = require('./routers/users');
const ordersRoutes = require('./routers/orders');
const deliveryRoutes = require('./routers/deliveries');
const faqRoutes = require('./routers/faqs');

const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/delivery`, deliveryRoutes);
app.use(`${api}/faq`, faqRoutes);

//Database
mongoose.connect(process.env.PG_CONN, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'projectgreen-database'
    })
    .then(() => {
        console.log('Database Connection is ready...')
    })
    .catch((err) => {
        console.log(err);
    })

//Server
app.listen(3000, () => {
    console.log('server is running http://www.njpotshop:3000');
})