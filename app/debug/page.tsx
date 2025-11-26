import { Redis } from '@upstash/redis';

export default async function DebugPage() {
  const envVars = {
    KV_URL: !!process.env.KV_URL,
    KV_REST_API_URL: !!process.env.KV_REST_API_URL,
    UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  };

  let redisStatus = "Not attempted";
  let redisError = null;
  let redisPing = null;

  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const redis = Redis.fromEnv();
      redisStatus = "Connecting...";
      await redis.set("debug-ping", "pong");
      redisPing = await redis.get("debug-ping");
      redisStatus = "Connected & Verified";
    } else {
      redisStatus = "Skipped (Missing Env Vars)";
    }
  } catch (e: any) {
    redisStatus = "Failed";
    redisError = e.message;
  }

  return (
    <div className="p-8 text-white bg-black min-h-screen font-mono">
      <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Environment Variables (Presence)</h2>
        <pre className="bg-gray-800 p-4 rounded">
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Redis Connection</h2>
        <div className="bg-gray-800 p-4 rounded space-y-2">
          <p><strong>Status:</strong> <span className={redisStatus.includes("Connected") ? "text-green-400" : "text-red-400"}>{redisStatus}</span></p>
          {redisPing && <p><strong>Ping Test:</strong> {String(redisPing)}</p>}
          {redisError && <p><strong>Error:</strong> {redisError}</p>}
        </div>
      </div>
    </div>
  );
}
