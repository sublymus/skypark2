import https from "https";


export async function sendWithClickatail(Tel: string, code: string) {
  const options = {
    hostname: "platform.clickatell.com",
    path: `/messages/http/send?apiKey=LSt6kKoqR66S_Tq9Sct67w==&to=${Tel}&content=Your+Code+confirmation+skypark+is:+${code}`,
    method: "GET",
  };
  return await new Promise<boolean>((resolve) => {
    const req = https.request(options, (res) => {
      console.log(`statusCode: ${res.statusCode}`);

      res.on("data", (d) => {
        process.stdout.write(d);
        resolve(true);
      });
    });

    req.on("error", (error) => {
      console.error(error);
      resolve(false);
    });

    req.end();
  });
}
