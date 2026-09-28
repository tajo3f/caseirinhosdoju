import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const PORT=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webmanifest':'application/manifest+json','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url||'/', 'http://localhost').pathname);
    if(pathname.includes('\0'))throw Error('invalid path');
    let filepath=path.resolve(ROOT,'.'+pathname);
    if(filepath!==ROOT&&!filepath.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return;}
    let info;try{info=await stat(filepath)}catch{info=null}
    if(info?.isDirectory()||pathname.endsWith('/'))filepath=path.join(filepath,'index.html');
    let data;try{data=await readFile(filepath)}catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Arquivo não encontrado');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(filepath)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
  }catch{res.writeHead(400);res.end('Requisição inválida');}
}).listen(PORT,()=>console.log('Caseirinhos do Ju → http://localhost:'+PORT));
