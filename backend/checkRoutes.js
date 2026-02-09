import fs from "fs";
import path from "path";

// folder where your routes are
const routesFolder = path.join(process.cwd(), "routes");

function scanRoutes(folder) {
  const files = fs.readdirSync(folder);

  files.forEach(file => {
    const fullPath = path.join(folder, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanRoutes(fullPath); // recurse into subfolders
    } else if (file.endsWith(".js")) {
      const content = fs.readFileSync(fullPath, "utf-8");

      // look for route paths with missing param names (like "/:") or anything suspicious
      const regex = /(['"`])\/:([^\/'"\s]+)?/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        if (!match[2]) {
          console.log(`❌ Missing parameter name in ${fullPath} at: ${match[0]}`);
        }
      }
    }
  });
}

scanRoutes(routesFolder);
console.log("✅ Route scan completed.");
