import * as Earthstar from "https://deno.land/x/earthstar/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";

const authorKeypair = await Earthstar.Crypto.generateAuthorKeypair("suzy");
import shareKeypair from "./share.json" assert { type: "json" };


if (Earthstar.isErr(authorKeypair)) {
	console.error(authorKeypair);
	Deno.exit(1);
}
if (Earthstar.isErr(shareKeypair)) {
	console.error(shareKeypair);
	Deno.exit(1);
}

const replica = new Earthstar.Replica({
	driver: new Earthstar.ReplicaDriverMemory(shareKeypair.shareAddress),
	shareSecret: shareKeypair.secret,
});


const POSTS_PATH = "./posts";

// 2. Iterate over the contents of the posts directory.
for await (const entry of Deno.readDir(POSTS_PATH)) {
  const filePath = join(POSTS_PATH, entry.name);
  

  // 3. Read the contents of our file.
  const fileContents = await Deno.readTextFile(filePath);
  
  console.log(entry.name.slice(0,-3));
  
  // 4. Write them into our replica!
  await replica.set(authorKeypair, {
    path: `/posts/${entry.name.slice(0,-3)}`,
    text: fileContents
  });
  

}  



await replica.set(authorKeypair, {
	path: "/test",
	text: "Hello.",
});


await replica.getLatestDocAtPath("/test")



const peer = new Earthstar.Peer();

peer.addReplica(replica);

const syncer = peer.sync("http://localhost:2020");

await syncer.isDone();

console.log("Successfully synced with server.");