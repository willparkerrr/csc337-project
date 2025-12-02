var express = require('express')
var fs = require('fs')
var crypto = require('crypto')
var path = require('path')

var public_html = path.join(__dirname, 'public_html')

var app = express()

var users = []
var userFile = 'users.txt'

function addUsers(username, password, usertype){
    var s = username + ',' + password + ',' + usertype + '\n'
    try{
        fs.appendFileSync(userFile, s, {'encoding':'utf8'})
    }catch(error){
        console.log('Error', error)
    }
}

function loadUsers(){
    try{
        var userString = fs.readFileSync(userFile, {'encoding':'utf8'})
        var userList = userString.split('\n')
        var returnList = []
        for(var i=0;i<userList.length-1;i++){
            var data = userList[i].split(',')
            var userObj = {'username':data[0], 'password':data[1], 'usertype':data[2]}
            returnList.push(userObj)
        }
        return returnList
    }catch(err){
        return []
    }
}

var sessionList = []

function checkLogin(username, password){
    for(var i=0;i<users.length;i++){
        var cur = users[i]
        if((cur.username==username)&&(cur.password==password)){
            return true
        }
    }
    return false
}

function checkAdmin(username){
    for(var i=0;i<users.length;i++){
        var cur = users[i]
        if((cur.username==username)&&(cur.usertype=='admin')){
            return true
        }
    }
    return false

}

function checkSession(username){
    for(var i=0;i<sessionList.length;i++){
        var cur = sessionList[i]
        if((cur.username==username)){
            return true
        }
    }
    return false

}

function handleHome(req, res){
    var query = req.query
    if(checkAdmin(query.username)&&checkSession(query.username)){
        res.sendFile(path.join(public_html, 'home_admin.html'))
    }
    else{
        res.sendFile(path.join(public_html, 'home.html'))
    }
}

app.get('/home', handleHome)

app.get('/', handleHome)

app.post('/home', express.json(), function(req, res){
    var query = req.body
    if(checkAdmin(query.username)&&checkSession(query.username)){
        res.sendFile(path.join(public_html, 'home_admin.html'))
    }
    else{
        res.sendFile(path.join(public_html, 'home.html'))
    }
})

app.post('/manage', express.json(), function(req, res){
    res.sendFile(path.join(public_html, 'manage.html'))
})

app.post('/mng_action', express.urlencoded(), function(req, res){
    var query = req.body
    var courseObj = {'course_id':query.course_id, 'course_name':query.course_name, 'description':query.description}
    console.log('course', courseObj)
    //addUsers(query.username, hashedPassword, query.usertype)
    res.send('Creating the course ...')
})

app.get('/source.js', function(req, res){
    res.sendFile(path.join(public_html, 'source.js'))
})

app.get('/style.css', function(req, res){
    res.sendFile(path.join(public_html, 'style.css'))
})

app.get('/create_user', function(req, res){
    res.sendFile(path.join(public_html, 'create_user.html'))
})

app.post('/create_user', express.json(), function(req, res){
    res.sendFile(path.join(public_html, 'create_user.html'))
})

app.post('/create_action', express.urlencoded(), function(req, res){
    var query = req.body
    var hash = crypto.createHash('sha256')
    var hashedPassword = hash.update(query.password).digest('hex')
    users.push({'username':query.username, 'password':hashedPassword, 'usertype':query.usertype})
    console.log('Number of users', users.length)
    addUsers(query.username, hashedPassword, query.usertype)
    res.sendFile(path.join(public_html, 'create_action.html'))
})

app.get('/login', function(req, res){
    res.sendFile(path.join(public_html, 'login.html'))
})

app.post('/login', express.urlencoded(), function(req, res){
    res.sendFile(path.join(public_html, 'login.html'))
})

app.post('/lgn_action', express.urlencoded(), function(req, res){
    var query = req.body
    var hash = crypto.createHash('sha256')
    var hashedPassword = hash.update(query.password).digest('hex')
    if(checkLogin(query.username, hashedPassword)){
        res.sendFile(path.join(public_html, 'lgn_action.html'))
        sessionList.push({'username':query.username})
    }
    else{
        res.sendFile(path.join(public_html, 'lgn_action_failure.html'))
    }
})

app.listen(8080, function (){
    users = loadUsers()
    console.log('Loaded', users.length, 'user(s)!')
})