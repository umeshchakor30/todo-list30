var express = require("express");
var app = express();

// Set port dynamically
app.set("port", process.env.PORT || 3600);
var port = app.get("port");

// user body parsar for get data in body
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// write file
var fs = require("fs");

// session
var session = require("express-session");

// For validation
const { check, validationResult } = require("express-validator");
const { json } = require("express");

//app.use(express.static("public"));

var tasks = [];

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.get("/favicon.ico", function (req, res) {
  res.status(204);
  res.end();
});

// Vefiry login
app.post(
  "/verifyLogin",
  [
    check("email_id").isEmail().withMessage("Please enter a valid email id"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password minimum length should be 6 character"),
  ],
  (req, res) => {
    const errors_login = validationResult(req).array();
    var messageType = "";
    if (errors_login.length > 0) {
      errors_login.forEach(function (data, index) {
        messageType += `<div class="alert alert-danger" role="alert">${data.msg}</div>`;
      });
      res.json({ message: "ERROR", msgtype: messageType });
    } else {
      if (
        req.body.email_id === "umesh@gmail.com" &&
        req.body.password === "123456"
      ) {
        res.cookie("email_id", req.body.email_id);
        res.redirect("/todo");
      }
      res.json({ message: "SUCCESS" });
    }
  }
);

// user signup
app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

//user registration process
app.post(
  "/signupProcess",
  [
    check("full_name")
      .isLength({ min: 3 })
      .withMessage("Please enter a vallid name"),
    check("email_id").isEmail().withMessage("Please enter a valid email id"),
    check("mobile_num")
      .isNumeric()
      .withMessage("Please enter a valid mobile number"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password minimum length should be 6 character"),
  ],
  (req, res) => {
    const errors = validationResult(req).array();
    var messageType = "";

    if (errors.length > 0) {
      errors.forEach(function (data, index) {
        messageType += `<div class="alert alert-danger" role="alert">${data.msg}</div>`;
      });
      res.json({ message: "ERROR", msgtype: messageType });
    } else {
      var obj = {
        users: [],
      };

      fs.readFile("users.json", (err, data) => {
        obj = JSON.parse(data);
        console.log(err);
        obj.users.push({
          full_name: req.body.full_name,
          mobile_num: req.body.mobile_num,
          email_id: req.body.email_id,
          password: req.body.password,
        });

        console.log(obj);

        var finalRes = JSON.stringify(obj, null, 2);
        // Write a final file here
        fs.writeFileSync("users.json", finalRes, (err) => {
          res.json({ message: "SUCCESS" });
        });
      });
    }
  }
);

// For middleware validate
var validate = (req, res, next) => {
  if (req.cookies.email_id) {
    next();
  } else {
    res.redirect("/login");
  }
};

///app.use(validate);

// Todo list view load
app.get("/todo", (req, res) => {
  res.sendFile(__dirname + "/todo.html");
});

// Send data to html file
app.get("/getTasks", (req, res) => {
  res.json(tasks);
});

// Add task and append to array
app.post("/addTasks", (req, res) => {
  tasks.push(req.body.task);
  res.json({ message: "SUCCESS" });
});

// Delete task on click get by PARAM because we send ID by in param
app.delete("/deleteTasks/:id", (req, res) => {
  tasks.splice(req.params.id, 1);
  res.json({ message: "SUCCESS" });
});

app.listen(port, function () {
  console.log("Todo list server is running");
});
