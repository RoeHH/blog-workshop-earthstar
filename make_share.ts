import * as Earthstar from "https://deno.land/x/earthstar/mod.ts";

const shareKeypair = await Earthstar.Crypto.generateShareKeypair("roeblog");

if (!Earthstar.isErr(shareKeypair)) {
  await Deno.writeTextFile("share.json", JSON.stringify(shareKeypair));
  console.log("Wrote your new keypair to share.json!");
} else {
  console.error("Something went wrong:", shareKeypair);
}
