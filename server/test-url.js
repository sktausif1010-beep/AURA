const { analyzeUrl } = require("./agent/urlTool");

async function test() {
  const result = await analyzeUrl(
    "https://example.com"
  );

  console.log(
    JSON.stringify(result, null, 2)
  );
}

test();