require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = 3000;
const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://wasiuahmed410:E8c9KE6CMs4QZzx4@cluster0.xjzg2mg.mongodb.net/";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// creating middleware of json webtoken

const verifyJwt = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);

  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  console.log(token);

  jwt.verify(token, process.env.JWT_SECRETE, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    console.log(req.decoded);
    next();
  });
};

const run = async () => {
  try {
    const db = client.db("Book-catalog");
    if (db) {
      console.log("connected");
    }
    const bookCollection = db.collection("book");
    const userCollection = db.collection("user");
    const wishCollection = db.collection("wish");
    const bookListCollection = db.collection("bookList");
    const reviewCollection = db.collection("review");

    //create user
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };

      const updateDoc = {
        $set: user,
      };

      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign(
        {
          email: email,
        },
        process.env.JWT_SECRETE,
        { expiresIn: "1h" }
      );

      res.send({ result, token });
    });

    app.get("/books", async (req, res) => {
      const cursor = bookCollection.find({});
      const book = await cursor.toArray();

      res.send({ status: true, data: book });
    });

    app.post("/book", verifyJwt, async (req, res) => {
      const book = req.body;
      // console.log(book);

      const result = await bookCollection.insertOne(book);

      res.send(result);
    });
    app.post("/wish", async (req, res) => {
      const wish = req.body;
      // console.log(wish);

      const result = await wishCollection.insertOne(wish);

      res.send(result);
    });
    app.post("/bookList", async (req, res) => {
      const wish = req.body;
      // console.log(wish);

      const result = await bookListCollection.insertOne(wish);

      res.send(result);
    });

    app.get("/wishes", async (req, res) => {
      const cursor = wishCollection.find({});
      const wish = await cursor.toArray();

      res.send({ status: true, data: wish });
    });
    app.get("/bookList", async (req, res) => {
      const cursor = bookListCollection.find({});
      const wish = await cursor.toArray();

      res.send({ status: true, data: wish });
    });

    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;

      const result = await bookCollection.findOne({ _id: new ObjectId(id) });
      // console.log(result);
      res.send(result);
    });

    app.post("/review", async (req, res) => {
      const review = req.body;
      console.log(review);

      const result = await reviewCollection.insertOne(review);

      res.send(result);
    });

    //   app.delete("/product/:id", async (req, res) => {
    //     const id = req.params.id;

    //     const result = await productCollection.deleteOne({ _id: ObjectId(id) });
    //     console.log(result);
    //     res.send(result);
    //   });

    //   app.get("/comment/:id", async (req, res) => {
    //     const productId = req.params.id;

    //     const result = await productCollection.findOne(
    //       { _id: ObjectId(productId) },
    //       { projection: { _id: 0, comments: 1 } }
    //     );

    //     if (result) {
    //       res.json(result);
    //     } else {
    //       res.status(404).json({ error: "Product not found" });
    //     }
    //   });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

//E8c9KE6CMs4QZzx4
