// iiif-montage
import ProgressBar from "https://deno.land/x/progressbar/progressbar.ts";
import {
  percentageWidget,
  amountWidget,
} from "https://deno.land/x/progressbar/widgets.ts";

if (Deno.args.length < 1) {
  console.log("USAGE: iiif-montage manifest.json");
  Deno.exit(1);
}

const size = ",200";
const tempDir = await Deno.makeTempDir();

const manifestUrl = Deno.args[0];
const m = await fetch(manifestUrl);
const manifest = await m.json();

const pb = new ProgressBar(
  manifest.sequences[0].canvases.length,
  100,
  percentageWidget,
  amountWidget
);

var canvasIdx = 0;
for (const canvas of manifest.sequences[0].canvases) {
  const url = `${canvas.images[0].resource.service["@id"]}/full/${size}/0/default.jpg`;
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  await Deno.writeFile(`${tempDir}/${canvasIdx}.jpg`, new Uint8Array(buffer));
  canvasIdx++;
  await pb.update(canvasIdx);
}
await pb.finish();

const p = Deno.run({
  cmd: ["montage", `${tempDir}/*.jpg`, "-geometry", "+8+2", "montage.jpg"],
});
await p.status();
console.log("iiif montage ready -> montage.jpg");
