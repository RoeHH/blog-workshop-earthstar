import * as Earthstar from "https://deno.land/x/earthstar/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";

const SHARE_TO_SYNC =
"+roeblog.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzf";

const SHARE_SECRET = "buaqth6jr5wkksnhdlpfi64cqcnjzfx3r6cssnfqdvitjmfygsk3q";

const authorKeypair = await Earthstar.Crypto.generateAuthorKeypair("suzy");

if (Earthstar.isErr(authorKeypair)) {
	console.error(authorKeypair);
	Deno.exit(1);
}

const replica = new Earthstar.Replica({
	driver: new Earthstar.ReplicaDriverMemory(SHARE_TO_SYNC),
	shareSecret: SHARE_SECRET,
});


const POSTS_PATH = "./posts";

// 2. Iterate over the contents of the posts directory.
for await (const entry of Deno.readDir(POSTS_PATH)) {
  const filePath = join(POSTS_PATH, entry.name);
  

  // 3. Read the contents of our file.
  const fileContents = await Deno.readTextFile(filePath);
  
  // 4. Write them into our replica!
  await replica.set(authorKeypair, {
    path: `/posts/${entry.name}`,
    text: fileContents
  });

}  


console.log(authorKeypair);


const res = await replica.set(authorKeypair, {
	path: "/test",
	text: "Hello.",
});

console.log(res);


 await replica.getLatestDocAtPath("/test")



const peer = new Earthstar.Peer();

peer.addReplica(replica);

const syncer = peer.sync("http://localhost:2020");

await syncer.isDone();

console.log("Successfully synced with server.");