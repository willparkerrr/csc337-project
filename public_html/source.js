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

async function getCourses(){
  try {
      var res = await fetch('get_courses')
      var table = document.getElementById('myTable')
      // array of documents
      var arr = await res.json()
      // get keys of first document
      var keys = Object.keys(arr[0])

      var beautify = {
        'course_id': 'ID', 
        'course_name': 'Name', 
        'description': 'Description', 
        'instructor': 'Instructor', 
        'credits': 'Credits', 
        'semester': 'Semester'
      }

      var tr = document.createElement('tr')
      for (var i = 0; i < keys.length; i++) {
          if (keys[i] != '_id') {
            let th = document.createElement('th')
            let text = document.createTextNode(beautify[keys[i]])
            th.appendChild(text)  // add text to header
            tr.appendChild(th)    // add data to row
          }
          
        }

      // add row to table
      table.appendChild(tr)

      for (var k = 0; k < arr.length; k++) {
          var tr = document.createElement('tr')
          for (var i = 0; i < keys.length; i++) {
              if (keys[i] != '_id') {
                let td = document.createElement('td')
                let text = document.createTextNode(arr[k][keys[i]])
                td.appendChild(text)  // add text to data item
                tr.appendChild(td)    // add data to row
              }
          }
          // add row to table
          table.appendChild(tr)
      }

      } catch(err) {
        console.log(err)
      }
}


async function getCoursesManage(){
  try {
      var res = await fetch('get_courses')
      var table = document.getElementById('manageTable')
      // array of documents
      var arr = await res.json()
      // get keys of first document
      var keys = Object.keys(arr[0])

      var beautify = {
        'course_id': 'ID', 
        'course_name': 'Name', 
        'description': 'Description', 
        'instructor': 'Instructor', 
        'credits': 'Credits', 
        'semester': 'Semester'
      }

      var tr = document.createElement('tr')
      for (var i = 0; i < keys.length; i++) {
          if (keys[i] != '_id') {
            let th = document.createElement('th')
            let text = document.createTextNode(beautify[keys[i]])
            th.appendChild(text)  // add text to header
            tr.appendChild(th)    // add data to row
          }
          
      }
      
      // Add an Edit column
      let th = document.createElement('th')
      let text = document.createTextNode('Action')
      th.appendChild(text)  // add text to header
      tr.appendChild(th)    // add data to row

      // add row to table
      table.appendChild(tr)

      for (var k = 0; k < arr.length; k++) {
          var tr = document.createElement('tr')
          for (var i = 0; i < keys.length; i++) {
              if (keys[i] != '_id') {
                let td = document.createElement('td')
                let text = document.createTextNode(arr[k][keys[i]])
                td.appendChild(text)  // add text to data item
                tr.appendChild(td)    // add data to row
              }
          }

          // add edit course button
          let td = document.createElement('td')
          let editButton = document.createElement('input')
          editButton.type = 'button'
          editButton.value = 'Edit'


          // add edit course button
          let deleteButton = document.createElement('input')
          deleteButton.type = 'button'
          deleteButton.value = 'Delete'
          deleteButton.style.marginLeft = "8px"

          // grab curr values for population 
          let _id = arr[k]['_id'].$oid || arr[k]['_id'].toString()
          let course_id = arr[k]['course_id']
          let course_name = arr[k]['course_name']
          let description = arr[k]['description']
          let instructor = arr[k]['instructor']
          let credits = arr[k]['credits']
          let semester = arr[k]['semester']

          // populate form fields with current values 
          editButton.addEventListener('click', function() {
              document.getElementById("editForm").style.display = "block"

              document.getElementById('edit_id').value = _id
              document.getElementById('edit_course_id').value = course_id
              document.getElementById('edit_course_name').value = course_name
              document.getElementById('edit_description').value = description
              document.getElementById('edit_instructor').value = instructor
              document.getElementById('edit_credits').value = credits
              document.getElementById('edit_semester').value = semester

              document.getElementById("editForm").scrollIntoView({behavior: "smooth"})
          })
          td.appendChild(editButton)  

          deleteButton.addEventListener('click', function() {
              deleteCourse(_id)
          })

          td.appendChild(deleteButton)
          tr.appendChild(td)    
          // add row to table
          table.appendChild(tr)
      }

      } catch(err) {
        console.log(err)
      }
}


async function deleteCourse(id) {
    try {
        const res = await fetch("delete_course", {
          method:"POST", 
          headers: {
              "Content-Type": "application/x-www-form-urlencoded"
          },
          body: `_id=${encodeURIComponent(id)}`
        })

        let text = await res.text();
        console.log(text)

        sendReq("manage")
    } catch(err) {
      console.log("Deletion error: ", err)
    }
}
