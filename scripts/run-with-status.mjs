import { spawn } from "child_process";
import ora from "ora";

const [, , label, command, ...args] = process.argv;

if (!label || !command) {
  console.error("Usage: node scripts/run-with-status.mjs <label> <command> [...args]");
  process.exit(1);
}

const spinner = ora({
  text: label,
  spinner: "line",
  color: "cyan"
}).start();

const child = spawn(command, args, {
  shell: process.platform === "win32",
  stdio: ["ignore", "pipe", "pipe"]
});

let output = "";

child.stdout.on("data", chunk => {
  output += chunk.toString();
});

child.stderr.on("data", chunk => {
  output += chunk.toString();
});

child.on("error", error => {
  spinner.stopAndPersist({
    symbol: "[fail]",
    text: `${label} failed`
  });
  console.error(error.message);
  process.exit(1);
});

child.on("close", code => {
  if (code === 0) {
    spinner.stopAndPersist({
      symbol: "[ok]",
      text: `${label} done`
    });
    return;
  }

  spinner.stopAndPersist({
    symbol: "[fail]",
    text: `${label} failed`
  });
  if (output.trim()) {
    console.error(output.trim());
  }
  process.exit(code || 1);
});
