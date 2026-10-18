import http from 'node:http';
import {readFileSync} from 'node:fs';
import path from 'node:path';
if(!process.env.SITE_DIR)throw Error('Set SITE_DIR to the selected delivered artifact directory');
const bytes=readFileSync(path.join(process.env.SITE_DIR,'index.html'));
http.createServer((request,response)=>{response.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});response.end(bytes);}).listen(Number(process.env.PORT??8099),'127.0.0.1');
