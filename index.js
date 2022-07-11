const express = require("express");
const bodyParser = require("body-parser");
const route = require("./src/routes/route");
const { default: mongoose } = require("mongoose");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(
    "mongodb+srv://sangamsuman323:XVZrnDNPfS8c21p8@cluster0.bolaw.mongodb.net/project3",
    {
      useNewUrlParser: true,
    }
  )

  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));

app.use("/", route);
app.all('/**',route ,(req, res) => {
  res.status(404).send({ status: false, message: "Either Page Not Found Or Missing Some Of The Parameters " })
})

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});
