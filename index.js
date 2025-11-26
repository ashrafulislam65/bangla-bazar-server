const express = require('express')
const app = express()
const cors = require('cors');
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fcejyck.mongodb.net/?appName=Cluster0`
//middleware
app.use(cors());
app.use(express.json());
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db = client.db("banglaBazarDB");
    const productsCollection = db.collection("products");
    const usersCollection = db.collection("users");
    const purchasedCollection = db.collection("purchasedProducts");
    // GET ALL PRODUCTS

    app.get("/products", async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });
    // GET SINGLE PRODUCT BY ID
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const result = await productsCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });


    // ADD PRODUCT
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });
    //update product
    app.patch("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateData = req.body; // fields to update

        const result = await productsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product updated successfully" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      }
    });
    // DELETE PRODUCT
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // users api
    // REGISTER USER
    app.post("/users/register", async (req, res) => {
      const user = req.body; // name, email, password
      const existing = await usersCollection.findOne({ email: user.email });

      if (existing) {
        return res.status(400).json({ message: "User already exists" });
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    // LOGIN USER
    app.post("/users/login", async (req, res) => {
      const { email, password } = req.body;

      const user = await usersCollection.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "Email not found" });
      }

      if (user.password !== password) {
        return res.status(401).json({ message: "Wrong password" });
      }

      res.send(user);
    });
    // purchased product api
    // POST /purchased
app.post("/purchased", async (req, res) => {
  try {
    const purchase = req.body; 
    // expected fields: userId, productId, quantity, price

    if (!purchase.userId || !purchase.productId) {
      return res.status(400).json({ message: "userId and productId are required" });
    }

    

    purchase.purchaseDate = new Date(); // auto add purchase date
    const result = await purchasedCollection.insertOne(purchase);

    res.status(201).json({ message: "Product purchased successfully", id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

    


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
// GTvYPKGnQpI5Qr0Z
//banglaBazarDB