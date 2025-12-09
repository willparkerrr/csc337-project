function storeUsername() {
  var username = document.getElementById("username").value;
  window.localStorage.setItem("username", username);
}
function updateUrls() {
  var username = window.localStorage.getItem("username");
  if (username != null) {
    var links = document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
      links[i].href += "?username=" + username;
    }
  }
}
function sendReq(url) {
  var username = window.localStorage.getItem("username");
  var newUrl = url;
  if (username != null) {
    newUrl += "?username=" + username;
  }
  fetch(newUrl)
    .then(function (res) {
      return res.text();
    })
    .then(function (text) {
      document.open();
      document.write(text);
      document.close();
    })
    .catch(function (err) {
      console.log(err);
    });
}

function getCourses(){
    fetch('get_courses')
    .then(function(res){
        return res.json()
    })
    .then(function(obj){
        //console.log(obj)
        var p = document.getElementById('my_p')
        p.innerHTML = JSON.stringify(obj)
    })
    .catch(function(err){
        console.log(err)
    })
}

function loadCoursesForEnroll() {
  var username = window.localStorage.getItem("username");
  var welcome = document.getElementById("welcome");
  if (welcome && username) {
    welcome.textContent = "Logged in as: " + username;
  }

  fetch("/get_courses")
    .then(function (res) {
      return res.json();
    })
    .then(function (courses) {
      var tbody = document.getElementById("courses_body");
      if (!tbody) return;

      tbody.innerHTML = ""; 

      for (var i = 0; i < courses.length; i++) {
        var course = courses[i];
        var tr = document.createElement("tr");

        var tdId = document.createElement("td");
        tdId.textContent = course.course_id;
        tr.appendChild(tdId);

        var tdName = document.createElement("td");
        tdName.textContent = course.course_name;
        tr.appendChild(tdName);

        var tdDesc = document.createElement("td");
        tdDesc.textContent = course.description || "";
        tr.appendChild(tdDesc);

        var tdInst = document.createElement("td");
        tdInst.textContent = course.instructor || "";
        tr.appendChild(tdInst);

        var tdCredits = document.createElement("td");
        tdCredits.textContent = course.credits || "";
        tr.appendChild(tdCredits);

        var tdBtn = document.createElement("td");
        var btn = document.createElement("button");
        btn.textContent = "Enroll";
        
        btn.onclick = (function (cid) {
          return function () {
            enrollInCourse(cid);
          };
        })(course.course_id);
        tdBtn.appendChild(btn);
        tr.appendChild(tdBtn);

        tbody.appendChild(tr);
      }
    })
    .catch(function (err) {
      console.log("Error loading courses for enroll:", err);
    });
}

function enrollInCourse(courseId) {
  var username = window.localStorage.getItem("username");
  var msg = document.getElementById("enroll_message");

  if (!username) {
    if (msg) msg.textContent = "Please log in first.";
    return;
  }

  var formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("course_id", courseId);

  fetch("/enroll", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  })
    .then(function (res) {
      return res.text();
    })
    .then(function (text) {
      if (msg) msg.textContent = text;
    })
    .catch(function (err) {
      console.log("Error enrolling:", err);
      if (msg) msg.textContent = "Error enrolling in course.";
    });
}