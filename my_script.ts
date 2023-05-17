import * as Earthstar from "https://deno.land/x/earthstar/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";

// Import the identity we made!

const authorKeypair = await Earthstar.Crypto.generateAuthorKeypair("suzy");

if (Earthstar.isErr(authorKeypair)) {
	console.error(authorKeypair);
	Deno.exit(1);
}
// =========================================================================

// Setting up a Replica

// 1. Come up with a cool share name.
const MY_SHARE = "+roeblog.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzf";

// 2. Let's make an in-memory replica driver.
const driver = new Earthstar.ReplicaDriverMemory(MY_SHARE);

// 3. Let's use that to build our replica!
const replica = new Earthstar.Replica({
  shareSecret:  "buaqth6jr5wkksnhdlpfi64cqcnjzfx3r6cssnfqdvitjmfygsk3q",
  driver
});

// =========================================================================

// Writing our blog posts into the replica.

// 1. Keep the path to our paths post in a handy variable.
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

// =========================================================================

// Let's sync!

// 1. Make a peer.
const peer = new Earthstar.Peer();

// 2. Add the replica.
peer.addReplica(replica);

// 3. Sync with the URL. Use ws! Don't forget pathname!
const syncer = peer.sync("http://localhost:8080/earthstar-api/v2");

await syncer.isDone();

console.log("Syncing is done with http://localhost:8080/earthstar-api/v2");
