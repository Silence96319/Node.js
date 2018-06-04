var http = require('http')
var fs = require('fs')
var template = require('art-template')
var url = require('url')  //处理url后面带有参数的问题

var server = http.createServer()

var comments = {
  "person": [{
      "id": "1",
      "massage": "uncategorized",
      "name": "未分类"
    },
    {
      "id": "2",
      "massage": "funny",
      "name": "奇趣事"
    },
    {
      "id": "3",
      "massage": "living",
      "name": "会生活"
    },
    {
      "id": "4",
      "massage": "travel",
      "name": "爱旅行"
    }
  ]
}

server.on('request', function(req, res) {
  // var url = req.url
  // console.log(url)
  //由于需要处理url后带有参数的问题，所以上述url有冲突
  var parseObj = url.parse(req.url, true)
//  console.log(parseObj)
  var pathname = parseObj.pathname

  if (pathname === '/') {
    // TODO:读取main.html数据
    fs.readFile('./veiws/main.html', function(err, data) {
      if (err) {
        res.write('can not find it...')
      } else {
        // TODO:使用模板将数据渲染到页面上template.render(要替换的对象，替换的数据)
        //console.log(data.toString())
        var html = template.render(data.toString(), comments)
        // TODO: 给客户端响应数据
        res.end(html)
      }
    })
    //将客户端可以访问的地址如css，js, img 放入到公开目录中
  }

  else if (pathname.indexOf('/public/') === 0 || pathname.indexOf('/node_modules/') === 0) {
    fs.readFile('.' + pathname, function(err, data) {
      if (err) {
        return res.end('404 not found')
      }
      res.end(data);
    })
    //跳转到用户添加数据页面
  }

  else if (pathname === '/veiws/add.html') {
    fs.readFile('./veiws/add.html', function(err, data) {
      if (err) {
        return res.end('404')
      }
      res.end(data)
    })
  }
  //处理评论问题
  else if (pathname === '/pl') {
    var query = parseObj.query
    query.id = comments.person.length
    comments.person.unshift(query)
    res.statusCode = 302
    res.setHeader('Location', '/')
    res.end()
  }

  else {
    res.write('404 NOT FOUND !')
  }
})

server.listen(8090, function() {
  console.log('server is running')
})
