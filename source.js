function storeUsername(){
    var username = document.getElementById('username').value
    window.localStorage.setItem('username', username)
}
function updateUrls(){
    var username = window.localStorage.getItem('username')
    if(username!=null){
        var links = document.getElementsByTagName('a')
        for(var i=0;i<links.length;i++){
            links[i].href += '?username=' + username
        }
    }
}
function sendReq(url){
    var username = window.localStorage.getItem('username')
    var newUrl = url
    if(username!=null){
        newUrl += '?username=' + username
    }
    fetch(newUrl)
    .then(function (res){
        return res.text()
    })
    .then(function (text){
        document.open()
        document.write(text)
        document.close()
    })
    .catch(function (err){
        console.log(err)
    })
}