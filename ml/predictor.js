import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const predictor = (profile) =>
  new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "predict.py");
    const py = spawn("python", [scriptPath, JSON.stringify(profile)], {
      cwd: __dirname,
    });

    let data = "";
    let error = "";

    py.stdout.on("data", (chunk) => {
      data += chunk.toString();
    });

    py.stderr.on("data", (chunk) => {
      error += chunk.toString();
    });

    py.on("close", (code) => {
      if (code !== 0) return reject(error || `Python exited with code ${code}`);
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(`Invalid JSON from Python: ${err.message}`);
      }
    });
  });

export default predictor;
