import https from "https";

const comRecords = [
  { wpId: "1299", name: "Mika Singh", path: "/wp-content/uploads/2023/08/mika-singh.jpg" },
  { wpId: "1532", name: "Mr Sunny", path: "/wp-content/uploads/2023/08/sunny-mr.jpg" },
  { wpId: "2570", name: "Harsh Gujral", path: "/wp-content/uploads/2023/09/Harsh-Gujral-1024x910.jpeg" },
  { wpId: "4531", name: "Ashi Singh", path: "/wp-content/uploads/2023/09/ashi-singh--822x1024.jpg" },
  { wpId: "4732", name: "Danny Denzongpa", path: "/wp-content/uploads/2023/09/Danny-Denzongpa1-1.jpg" },
  { wpId: "5034", name: "Aamir Ali", path: "/wp-content/uploads/2023/09/Aamir-Ali-1024x828.png" },
  { wpId: "5138", name: "Aly Goni", path: "/wp-content/uploads/2023/09/Aly_Goni_-734x1024.jpg" },
  { wpId: "5364", name: "Deven Bhojani", path: "/wp-content/uploads/2023/10/Deven-Bhojani.jpg" },
  { wpId: "7399", name: "Elementor #7399", path: "/wp-content/uploads/2023/10/Namish-Taneja3-1024x1024.jpg" },
  { wpId: "9154", name: "Jordindian", path: "/wp-content/uploads/2023/11/Jordindian1.png" },
  { wpId: "10771", name: "Beena Banerjee", path: "/wp-content/uploads/2023/12/Beena-Banerjee1.jpg" },
  { wpId: "16648", name: "Blaaze", path: "/wp-content/uploads/2024/01/Blaaze-2.jpg" },
  { wpId: "17296", name: "Master Saleem", path: "/wp-content/uploads/2024/01/Master-Saleem-2.jpg" },
  { wpId: "17546", name: "Riddhiman Biswas", path: "/wp-content/uploads/2024/01/Riddhiman-Biswas-3-1024x682.jpg" },
  { wpId: "18418", name: "Madhushree", path: "/wp-content/uploads/2024/01/Madhushree.png" },
  { wpId: "19199", name: "Shaan Rahman", path: "/wp-content/uploads/2024/01/Shaan-Rahman.png" },
  { wpId: "20417", name: "Shafali Verma", path: "/wp-content/uploads/2024/02/Shafali-Verma-1-1024x768.jpg" },
  { wpId: "20425", name: "Shika Pandey", path: "/wp-content/uploads/2024/02/Shika-Pandey.png" },
  { wpId: "20433", name: "Veda Krishnamurthy", path: "/wp-content/uploads/2024/02/Veda-Krishnamurthy2.jpg" }
];

function checkUrl(rec) {
  return new Promise((resolve) => {
    const options = {
      hostname: "celebritybulaye.in",
      port: 443,
      path: rec.path,
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
      },
      timeout: 10000
    };
    const req = https.request(options, (res) => {
      resolve({ ...rec, status: res.statusCode, contentType: res.headers["content-type"] });
    });
    req.on("error", (err) => {
      resolve({ ...rec, status: "ERROR", error: err.message });
    });
    req.on("timeout", () => {
      req.destroy();
      resolve({ ...rec, status: "TIMEOUT" });
    });
    req.end();
  });
}

async function run() {
  console.log("Testing 19 .com image paths against celebritybulaye.in:");
  for (const r of comRecords) {
    const res = await checkUrl(r);
    console.log(`WP #${res.wpId.padStart(5)} | ${res.name.padEnd(20)} | HTTP ${res.status} | Error: ${res.error || "None"} | Content-Type: ${res.contentType || "N/A"}`);
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
}

run();
