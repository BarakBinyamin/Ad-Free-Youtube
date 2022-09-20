const { spawnSync } = require('child_process')
const { program }   = require('commander')
const cheerio       = require("cheerio")
const express       = require("express")
const http          = require("http")
const fs            = require("fs")

program
    .requiredOption('-p, --port <char>','Port to run on')
program.parse();
const options = program.opts()

const PORT          = options['port']
const app           = express()
const jsonTools     = express.json()
app.use(jsonTools)

const view = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
        <style>
            html{
                -webkit-overflow-scrolling: touch; /* enables “momentum” (smooth) scrolling */
                /* Nice Font */
                font-family: Avenir, Helvetica, Arial, sans-serif;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            body{
                display:grid; 
                justify-content: center;
                background: #161b22;
            }
            iframe{
                margin:5px;
            }
            input{
                width: 200px;
                height: 50px;
                padding: 5px;
            }
            button{
                width: 100px;
                height: 50px;
                padding: 5px;
            }
            #container{
                display: grid;
                grid-gap: 0px;
                width: 100%;
                justify-content: center;
                grid-template-columns: auto auto;
                grid-gap: 5px;
                margin-top: 10px;
            }
            h1{
                text-align:center;
                color: #8e949b;
            }	
            h2{
                text-align:center;
                color: #8e949b;
            }
        </style>
        </head><body><div id="container">
            <input id="input" <="" input="">
            <button id="search" onclick="searchYoutube()">search</button>
        </div>
        <h1 id="title"></h1>
        <h2>videos</h2><h2>
            <div id="videos"></div>
        </h2><h2>playlists</h2><h2>
            <div id="playlists"></div>

        <script>
        async function searchYoutube(){
            const value  = document.getElementById("input").value
            const res    = await fetch("/api/search?item="+value)
            const result = await res.json()
            
            document.getElementById("title").innerHTML     = value
            document.getElementById("input").value         = ''
            
            document.getElementById("videos").innerHTML    = String(result['listofembeddivs']['videos']).replaceAll(',','')
            document.getElementById("playlists").innerHTML = String(result['listofembeddivs']['playlists']).replaceAll(',','')
        }
        
        input.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault()
                document.getElementById("search").click()
            }
        })
        </script>
    `

async function searchYoutube(query){
    const url        = "https://www.youtube.com/results?search_query=" + query.replace(/ /g,"+")
    const child      = spawnSync(`curl`, [url])
    const html       = child.stdout
    const HTMLobject = cheerio.load(html)
    const text       = HTMLobject.html()
    /* Get video tags    */
    const vregex= /watch\?v=[0-9a-zA-Z-]{11}/g
    const vsrcs = text.match(vregex).splice(0,5)
    const vtags = vsrcs.map(src => src.split("=")[1])
    /* Get playlist tags */
    const pregex= /list=[0-9a-zA-Z-]*/g
    const psrcs = [...new Set(text.match(pregex))].splice(0,5)
    const ptags = psrcs.map(src => src.split("=")[1])

    const videos    = vtags.map(tag=>`
    <iframe 
        src="https://www.youtube.com/embed/${tag}"
        width="300" height="200"
        title="YouTube video player" frameborder="0" allow="accelerometer;
        autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
    </iframe>
    `)
    const playlists = ptags.map(tag=>`
    <iframe 
        src="https://www.youtube.com/embed/videoseries?list=${tag}" 
        width="300" height="200"
        title="YouTube video player" frameborder="0" allow="accelerometer; 
        autoplay;clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
    </iframe>
    `)

    return {"listofembeddivs":{"videos":videos,"playlists":playlists}}
}

app.get("/api/search", async (req,res)=>{
    const query = req.query.item
    res.send(await searchYoutube(query))
})

app.get("/*",(req,res)=>{
    res.send(view)
})

const server = http.createServer(app)
server.listen(PORT, ()=>{
    console.log(`Listening at port ${PORT}`)
})