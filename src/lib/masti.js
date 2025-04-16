import { pipe } from "@screenpipe/browser";

async function queryScreenpipe() {
  // get content from last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const results = await pipe.queryScreenpipe({
    startTime: fiveMinutesAgo,
    limit: 10,
    contentType: "all", // can be "ocr", "audio", or "all"
  });

  if (!results) {
    console.log("no results found or error occurred");
    return;
  }

  console.log(`found ${results.pagination.total} items`);

  // process each result
  for (const item of results.data) {
    if (item.type === "OCR") {
      console.log(`OCR: ${JSON.stringify(item.content)}`);
    } else if (item.type === "Audio") {
      console.log(`transcript: ${JSON.stringify(item.content)}`);
    } 
  }
}

queryScreenpipe().catch(console.error);