const express = require("express");
const app = express();
require('dotenv').config();
const cors = require("cors");
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const PORT = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

//server running
app.get("/", (req, res) => {
    res.send("drone server running");
});

// database connect mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.umjp9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('droneDB');
        const watchCollection = database.collection('watch');
        const userCollection = database.collection('user');
        const orderCollection = database.collection('OrderNow');
        const reviewCollection = database.collection('review');

        // Post API
        app.post("/products", async(req, res) => {
            const product = req.body;
            const result = await watchCollection.insertOne(product);
            res.json(result);
        })


        //Post API
        app.get('/products', async(req, res) => {
            const products = await watchCollection.find({}).toArray();
            res.json(products);
        });

        
        app.get('/products/limit', async(req, res) => {
            const products = await watchCollection.find({}).limit(6).toArray();
            res.json(products);
        });

        // delete  APi
        app.delete('/products/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await watchCollection.deleteOne(query);
            res.json(result);
        });

        // get the single product API
        app.get("/purchase/:id", async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await watchCollection.findOne(query)
            res.json(result);
        });


        // Order Get API
        app.post("/order", async(req, res) => {
            const product = req.body;
            const result = await orderCollection.insertOne(product);
            res.json(result);
        });


        
        app.get("/order/:email", async(req, res) => {
            const user = req.params;
            const query = { email: user.email };
            const result = await orderCollection.find(query).toArray();
            res.json(result);
        });

        
        app.get("/order", async(req, res) => {
            const result = await orderCollection.find({}).toArray();
            res.json(result);
        });

        
        app.delete('/order/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        });

   
        app.post("/user", async(req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result);
        });

        // get the user API
        app.get('/user', async(req, res) => {
            const result = await userCollection.find({}).toArray();
            res.json(result);
        });

       
        app.put("/user/admin", async(req, res) => {
            const user = req.body;
            console.log(user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: "admin" } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

      
        app.get('/user/:email', async(req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === "admin") {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        
        app.post('/review', async(req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        });

        
        app.get('/review', async(req, res) => {
            const review = await reviewCollection.find({}).toArray();
            res.json(review);
        });


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

//server listen
app.listen(PORT, () => {
    console.log(`Server running PORT: ${PORT}`);
});