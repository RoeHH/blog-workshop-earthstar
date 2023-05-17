import * as Earthstar from "https://deno.land/x/earthstar/mod.ts";
import { TransportWebsocketServer } from "https://deno.land/x/earthstar_streaming_rpc/mod.ts";
import { serve } from "https://deno.land/std/http/mod.ts";
import { micromark } from "https://esm.sh/micromark";

// =========================================================================

// Setting up a Sqlite replica
const MY_SHARE = "+roeblog.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzf";
const SHARE_SECRET = "buaqth6jr5wkksnhdlpfi64cqcnjzfx3r6cssnfqdvitjmfygsk3q";


// 2. Let's make a Sqlite replica driver.
const driver = new Earthstar.ReplicaDriverFs(MY_SHARE, "./sqlite.db");

// 3. Let's use that to build our replica! Again!
const replica = new Earthstar.Replica({
  driver,
  shareSecret: SHARE_SECRET,
});

// 4. Let's put that replica into a Peer.
const peer = new Earthstar.Peer();
peer.addReplica(replica);

// =========================================================================

// Let's build a blog.

// We need a syncer. This pulls docs from any other peers it connects to.

const syncer = peer.sync("http://localhost:2020");

await syncer.isDone();

console.log(await replica.getAllDocs())



// 1. This function will handle every request to our server.
async function handler(req: Request) {
  const url = new URL(req.url);


  const document = await replica.getLatestDocAtPath(url.pathname);

  if (!document) {
    return new Response("Not found:  " + url.pathname, { status: 404 });
  }

  return new Response(micromark(document.text), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

console.log("Running server on http://localhost:8080");
await serve(handler, { port: 8080 });
