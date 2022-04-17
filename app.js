//express
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
require("dotenv").config();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
const mysql = require("mysql");
const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "scott123",
  database: "evmsDB",
});

require("./routes/bookings")(app, db);
db.connect((err) => {
  if (err) throw err;
  console.log("Mysql Connected!");
});
// db.query("SELECT * FROM Bookings", (err, rows) => {
//   if (err) throw err;

//   console.log("Data received from Db:");
//   console.log(rows);
//   rows.forEach((row) => {
//     console.log(
//       `${row.id} ${row.name} ${row.venue} ${row.Duration} ${row.details}`
//     );
//   });
// });
const data = {
  id: 5,
  name: "Esummit",
  About: "pitch your ideas",
  venue: "Delhi",
  Duration: "3 days",
  details: "pitch your ideas",
  contactNumber: "987654321",
  hostInstitute: "DTU",
  contactEmail: "esummit@gmail.com",
};
// db.query("INSERT INTO Bookings SET ? ", data, (err, res) => {
//   if (err) throw err;
//   console.log("Last insert id:", res.insertId);
// });
app.use(
  session({
    secret: "This is a secret.",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
const connectDB = async () => {
  await mongoose.connect(
    "mongodb://127.0.0.1:27017/evmsDB",
    {
      useNewUrlParser: true,
    },
    (err) => {
      if (err) console.log(err);
      else console.log("connected to mongoDB");
    }
  );
};
connectDB();

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  password: String,
});
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    let currentUser;
    (async () => {
      currentUser = await User.findOne({ username: req.user.username });
      console.log(currentUser);
      res.render("home", {
        signedIN: true,
        usrDetails: currentUser,
        title: "Event Mangement System",
      });
    })();
  } else {
    res.render("home", {
      signedIN: false,
      usrDetails: null,
      title: "Event Mangement System",
    });
  }
});
app.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    let currentUser;
    (async () => {
      currentUser = await User.findOne({ username: req.user.email });
      console.log(currentUser);
      res.render("login", {
        signedIN: true,
        usrDetails: currentUser,
        title: "Login",
      });
    })();
  } else {
    res.render("login", {
      signedIN: false,
      usrDetails: null,
      title: "Login",
    });
  }
});
app.get("/register", (req, res) => {
  if (req.isAuthenticated()) {
    let currentUser;
    (async () => {
      currentUser = await User.findOne({ username: req.user.email });
      console.log(currentUser);
      res.render("register", {
        signedIN: true,
        usrDetails: currentUser,
        title: "Register",
      });
    })();
  } else {
    res.render("register", {
      signedIN: false,
      usrDetails: null,
      title: "Register",
    });
  }
});
app.get("/list", (req, res) => {
  if (req.isAuthenticated()) {
    let currentUser;
    (async () => {
      currentUser = await User.findOne({ username: req.user.username });
      db.query("SELECT * FROM Bookings", (err, rows) => {
        if (err) throw err;
        console.log("Data received from Db:");

        console.log(currentUser);
        res.render("list", {
          signedIN: true,
          usrDetails: currentUser,
          title: "List",
          listData: rows,
        });
      });
    })();
  } else {
    res.redirect("/login");
  }
});
app.get("/eventreg", (req, res) => {
  if (req.isAuthenticated()) {
    let currentUser;
    (async () => {
      currentUser = await User.findOne({ username: req.user.username });
      console.log(currentUser);
      res.render("eventRegister", {
        signedIN: true,
        usrDetails: currentUser,
        title: "Register Event",
      });
    })();
  } else {
    res.redirect("/login");
  }
});
app.get("/faq", (req, res) => {
  if (req.isAuthenticated()) {
    let currentUser;
    (async () => {
      currentUser = await User.findOne({ username: req.user.username });
      console.log(currentUser);
      res.render("faq", {
        signedIN: true,
        usrDetails: currentUser,
        title: "FAQ's",
      });
    })();
  } else {
    res.render("list", {
      signedIN: false,
      usrDetails: null,
      title: "List",
    });
  }
});

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err, user) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      });
    }
  });
});
app.post("/register", (req, res) => {
  const name = req.body.name;
  const username = req.body.username;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  let user = new User({
    name: name,
    username: username,
  });
  User.register(user, password, (err, user) => {
    if (err || confirmPassword !== password) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/");
      });
    }
  });
});
app.post("/eventRegister", (req, res) => {
  const eventName = req.body.name;
  const universityName = req.body.hostInstitute;
  const about = req.body.about;
  const duration = req.body.duration;
  const venue = req.body.venue;
  const contactEmail = req.body.email;
  const contactNumber = req.body.number;
  const details = req.body.details;
  const eventData = {
    name: eventName,
    About: about,
    venue: venue,
    Duration: duration,
    details: details,
    contactNumber: contactNumber,
    hostInstitute: universityName,
    contactEmail: contactEmail,
  };
  db.query("INSERT INTO Bookings SET ?", eventData, (err, result) => {
    if (err) throw err;
    console.log(result);
    console.log("Event added successfully");
    res.redirect("/");
  });
});
app.get("/signout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.listen(PORT, function (req, res) {
  console.log("Server started on port " + PORT);
});
