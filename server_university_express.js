var express = require("express");
var fs = require("fs");
var crypto = require("crypto");
var path = require("path");
var { MongoClient, ObjectId } = require("mongodb");

var public_html = path.join(__dirname, "public_html");

var app = express();
app.get("/simple_test", function (req, res) {
  res.send("Simple test works!");
});
var client = new MongoClient("mongodb://127.0.0.1:27017/");
var db;
var coursesCollection;
var enrollmentsCollection;
var usersCollection;

var sessionList = [];

async function checkLogin(username, hashedPassword) {
  try {
    var user = await usersCollection.findOne({ username: username, password: hashedPassword });
    return user != null;
  } catch (err) {
    console.log("Login check error:", err);
    return false;
  }
}

async function checkAdmin(username) {
  try {
    var user = await usersCollection.findOne({ username: username, usertype: "admin" });
    return user != null;
  } catch (err) {
    console.log("Admin check error:", err);
    return false;
  }
}

function checkSession(username) {
  for (var i = 0; i < sessionList.length; i++) {
    var cur = sessionList[i];
    if (cur.username == username) {
      return true;
    }
  }
  return false;
}

async function courseExists(courseId) {
  try {
    var course = await coursesCollection.findOne({ course_id: courseId });
    return course != null;
  } catch (err) {
    console.log("Error checking course:", err);
    return false;
  }
}

async function isEnrolled(username, courseId) {
  try {
    var enrollment = await enrollmentsCollection.findOne({
      username: username,
      course_id: courseId,
      status: "enrolled",
    });
    return enrollment != null;
  } catch (err) {
    console.log("Error checking enrollment:", err);
    return false;
  }
}

async function handleHome(req, res) {
  var query = req.query;
  if (await checkAdmin(query.username) && checkSession(query.username)) {
    res.sendFile(path.join(public_html, "home_admin.html"));
  } else {
    res.sendFile(path.join(public_html, "home.html"));
  }
}

app.get("/home", handleHome);

app.get("/", handleHome);

app.post("/home", express.json(), async function (req, res) {
  var query = req.body;
  if (await checkAdmin(query.username) && checkSession(query.username)) {
    res.sendFile(path.join(public_html, "home_admin.html"));
  } else {
    res.sendFile(path.join(public_html, "home.html"));
  }
});

app.get("/get_courses", async function (req, res) {
  console.log("GET /get_courses called!");
  try {
    var courses = await coursesCollection.find({}).toArray();
    res.json(courses);
  } catch (err) {
    console.log("Error getting courses:", err);
    res.json([]);
  }
});

app.post("/manage", express.json(), function (req, res) {
  res.sendFile(path.join(public_html, "manage.html"));
});

app.get("/manage", function (req, res) {
  res.sendFile(path.join(public_html, "manage.html"));
});

app.get('/view', function(req, res){
    res.sendFile(path.join(public_html, 'view.html'))
})

app.post("/mng_action", express.urlencoded(), async function (req, res) {
  var query = req.body;
  var courseObj = {
    course_id: query.course_id,
    course_name: query.course_name,
    description: query.description,
    instructor: query.instructor || "",
    credits: query.credits || 3,
    semester: query.semester || "Fall 2024",
  };

  try {
    await coursesCollection.insertOne(courseObj);
    console.log("Created course:", courseObj.course_id);
    res.sendFile(path.join(public_html, "manage.html"));
  } catch (err) {
    console.log("Error creating course:", err);
    res.send("Error creating course");
  }
});

app.post("/updt_action", express.urlencoded(), async function (req, res) {
  var query = req.body;

  try {
    await coursesCollection.updateOne(
      {_id: new ObjectId(query._id)},
      {
        $set: {
          course_id: query.course_id, 
          course_name: query.course_name, 
          description: query.description, 
          instructor: query.instructor, 
          credits: parseInt(query.credits), 
          semester: query.semester
        }
      }
    )

    console.log("Updated Course:", query.course_id)
    res.sendFile(path.join(public_html, "manage.html"));
  } catch (err) {
    console.log("Error updating course:", err);
  }
});

app.post("/delete_course", express.urlencoded(), async function(req, res) {
  try{
    await coursesCollection.deleteOne({
      _id: new ObjectId(req.body._id)
    })

    console.log("Deleted Course: ", req.body._id)
    res.sendFile(path.join(public_html, "manage.html"));
  } catch(err) {
    console.log("Error deleting course: ", err)
  }
})

app.get("/test", function (req, res) {
  res.send("Test route works!");
});

app.get("/source.js", function (req, res) {
  res.sendFile(path.join(public_html, "source.js"));
});

app.get("/style.css", function (req, res) {
  res.sendFile(path.join(public_html, "style.css"));
});

app.get("/create_user", function (req, res) {
  res.sendFile(path.join(public_html, "create_user.html"));
});

app.post("/create_user", express.json(), function (req, res) {
  res.sendFile(path.join(public_html, "create_user.html"));
});

app.post("/create_action", express.urlencoded(), async function (req, res) {
  var query = req.body;
  var hash = crypto.createHash("sha256");
  var hashedPassword = hash.update(query.password).digest("hex");
  try{
    await usersCollection.insertOne({
    username: query.username,
    password: hashedPassword,
    usertype: query.usertype,
    })
  res.sendFile(path.join(public_html, "create_action.html"));
  } catch (err) {
    console.log("Error creating user:", err);
    res.send("Error creating user");
  }
});

app.get("/login", function (req, res) {
  res.sendFile(path.join(public_html, "login.html"));
});

app.post("/login", express.urlencoded(), function (req, res) {
  res.sendFile(path.join(public_html, "login.html"));
});

app.post("/lgn_action", express.urlencoded(), async function (req, res) {
  var query = req.body;
  var hash = crypto.createHash("sha256");
  var hashedPassword = hash.update(query.password).digest("hex");
  if (await checkLogin(query.username, hashedPassword)) {
    sessionList.push({ username: query.username });
    res.sendFile(path.join(public_html, "lgn_action.html"));
  } else {
    res.sendFile(path.join(public_html, "lgn_action_failure.html"));
  }
});

app.get("/enroll_page", function(req, res) {
  res.sendFile(path.join(public_html, "enroll.html"));
})

// ============================================
// ENROLLMENT ROUTES
// ============================================

// Enroll in a course
app.post("/enroll", express.urlencoded(), async function (req, res) {
  var query = req.body;
  var username = query.username;
  var courseId = query.course_id;

  // Check if user is logged in
  if (!checkSession(username)) {
    return res.send("You must be logged in to enroll");
  }

  // Check if course exists
  var exists = await courseExists(courseId);
  if (!exists) {
    return res.send("Course does not exist");
  }

  // Check if already enrolled
  var alreadyEnrolled = await isEnrolled(username, courseId);
  if (alreadyEnrolled) {
    return res.send("You are already enrolled in this course");
  }

  // Enroll the student
  try {
    var enrollmentObj = {
      username: username,
      course_id: courseId,
      enrollmentDate: new Date(),
      status: "enrolled",
    };
    await enrollmentsCollection.insertOne(enrollmentObj);
    console.log("Enrolled", username, "in", courseId);
    res.send("Successfully enrolled in course!");
  } catch (err) {
    console.log("Error enrolling:", err);
    res.send("Error enrolling in course");
  }
});

// Drop a course
app.post("/drop", express.urlencoded(), async function (req, res) {
  var query = req.body;
  var username = query.username;
  var courseId = query.course_id;

  // Check if user is logged in
  if (!checkSession(username)) {
    return res.send("You must be logged in to drop a course");
  }

  // Check if enrolled
  var enrolled = await isEnrolled(username, courseId);
  if (!enrolled) {
    return res.send("You are not enrolled in this course");
  }

  // Update enrollment status to 'dropped'
  try {
    await enrollmentsCollection.updateOne(
      { username: username, course_id: courseId, status: "enrolled" },
      { $set: { status: "dropped", dropDate: new Date() } }
    );
    console.log("Dropped", username, "from", courseId);
    res.send("Successfully dropped course!");
  } catch (err) {
    console.log("Error dropping course:", err);
    res.send("Error dropping course");
  }
});

// Get student's enrolled courses
app.get("/my_courses", async function (req, res) {
  var username = req.query.username;

  // Check if user is logged in
  if (!checkSession(username)) {
    return res.json([]);
  }

  try {
    // Get all enrollments for this student
    var enrollments = await enrollmentsCollection
      .find({
        username: username,
        status: "enrolled",
      })
      .toArray();

    // Get course details for each enrollment
    var myCourses = [];
    for (var i = 0; i < enrollments.length; i++) {
      var course = await coursesCollection.findOne({
        course_id: enrollments[i].course_id,
      });
      if (course) {
        myCourses.push(course);
      }
    }

    res.json(myCourses);
  } catch (err) {
    console.log("Error getting my courses:", err);
    res.json([]);
  }
});

// Serve my courses page
app.get("/my_courses_page", express.json(), function (req, res) {
  res.sendFile(path.join(public_html, "my_courses.html"));
});

app.listen(8080, async function () {
  // Load users from file
  // users = loadUsers();
  //console.log("Loaded", users.length, "user(s)!");

  // Connect to MongoDB
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    db = client.db("universityDB");
    coursesCollection = db.collection("courses");
    enrollmentsCollection = db.collection("enrollments");
    usersCollection = db.collection("users");


    // Create some test courses if none exist
    var courseCount = await coursesCollection.countDocuments();
    if (courseCount === 0) {
      console.log("Creating test courses...");
      await coursesCollection.insertMany([
        {
          course_id: "CSC337",
          course_name: "Web Programming",
          description: "Introduction to web development",
          instructor: "Dr. Smith",
          credits: 3,
          semester: "Fall 2024",
        },
        {
          course_id: "CSC345",
          course_name: "Data Structures",
          description: "Advanced data structures and algorithms",
          instructor: "Dr. Johnson",
          credits: 3,
          semester: "Fall 2024",
        },
        {
          course_id: "CSC252",
          course_name: "Computer Architecture",
          description: "Computer organization and architecture",
          instructor: "Dr. Williams",
          credits: 4,
          semester: "Fall 2024",
        },
      ]);
      console.log("Created 3 test courses");
    }

    console.log("Server ready at http://localhost:8080");
  } catch (err) {
    console.log("Error connecting to MongoDB:", err);
  }
});
