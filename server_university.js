var http = require('http')
var qs = require('querystring')
var url = require('url')
var fs = require('fs')
var crypto = require('crypto')

var users = []
var userFile = 'users.txt'

function writeUser(username, password, usertype){
    var info = username + ',' + password + ',' + usertype + '\n'
    try{
        fs.appendFileSync(userFile, info, {'encoding':'utf8'})
    }catch(err){
        console.log(err)
    }
}

function loadUsers(){
    try{
        var data = fs.readFileSync(userFile, {'encoding':'utf8'})
        var arr = data.split('\n')
        var objArr = []
        for(var i=0;i<arr.length-1;i++){
            var fields = arr[i].split(',')
            var userObj = {'username':fields[0], 'password':fields[1], 'usertype':fields[2]}
            objArr.push(userObj)
        }
        return objArr
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


http.createServer(function (req, res){
    res.writeHead(200, {'Content-Type':'text/html'})
    // check whether it is an admin and update
    var parsedUrl = url.parse(req.url, true)
    var query = parsedUrl.query
    if(req.url.includes('home')){
        var htmlContent = ''
        try{
            if(checkAdmin(query.username)&&checkSession(query.username)){
                htmlContent = fs.readFileSync('home_admin.html', {'encoding':'utf8'})    
            }
            else{
                htmlContent = fs.readFileSync('home.html', {'encoding':'utf8'})
            }
            
        }catch(err){
            console.log(err)
        }
        res.end(htmlContent)
    }
    else if(req.url.includes('source')){
        var htmlContent = ''
        try{
            htmlContent = fs.readFileSync('source.js', {'encoding':'utf8'})    
        }catch(err){
            console.log(err)
        }
        res.end(htmlContent)
    }
    else if(req.url.includes('create_user')){
        var htmlContent = ''
        try{
            htmlContent = fs.readFileSync('create_user.html', {'encoding':'utf8'})    
        }catch(err){
            console.log(err)
        }
        res.end(htmlContent)
    }
    else if(req.url.includes('create_action')){
        var body = ''
        req.on('data', function (chunk){
            body += chunk
        })
        req.on('end', function (){
            var query = qs.parse(body)
            var hash = crypto.createHash('sha256')
            var hashedPassword = hash.update(query.password).digest('hex')
            users.push({'username':query.username, 'password':hashedPassword, 'usertype':query.usertype})
            console.log('Number of users', users.length)
            writeUser(query.username, hashedPassword, query.usertype)
            
            var htmlContent = ''
            try{
                htmlContent = fs.readFileSync('create_action.html', {'encoding':'utf8'})    
            }catch(err){
                console.log(err)
            }
            res.end(htmlContent)
        })

    }
    else if(req.url.includes('login')){
        var htmlContent = ''
        try{
            htmlContent = fs.readFileSync('login.html', {'encoding':'utf8'})    
        }catch(err){
            console.log(err)
        }
        res.end(htmlContent)
        
    }
    else if(req.url.includes('lgn_action')){
        var body = ''
        req.on('data', function (chunk){
            body += chunk
        })
        req.on('end', function (){
            var query = qs.parse(body)
            // check login info
            var hash = crypto.createHash('sha256')
            var hashedPassword = hash.update(query.password).digest('hex')
            if(checkLogin(query.username, hashedPassword)){
                // login successful

                var htmlContent = ''
                try{
                    htmlContent = fs.readFileSync('lgn_action.html', {'encoding':'utf8'})    
                }catch(err){
                    console.log(err)
                }
                res.end(htmlContent)

                sessionList.push({'username':query.username})
            }
            else{
                // info is not matching

                var htmlContent = ''
                try{
                    htmlContent = fs.readFileSync('lgn_action_failure.html', {'encoding':'utf8'})    
                }catch(err){
                    console.log(err)
                }
                res.end(htmlContent)
            }
        })

    }
}).listen(8080, function(){
    users = loadUsers()
    console.log("Loaded", users.length, "user(s)!")
})