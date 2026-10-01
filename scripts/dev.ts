// Starts the database and the dev servers. When the dev servers exit
// (e.g. with Ctrl+C), the database container is stopped as well.

const run = (cmd: string[]) =>
  Bun.spawn(cmd, { stdio: ["inherit", "inherit", "inherit"] }).exited;

const upCode = await run(["docker", "compose", "up", "-d", "--wait", "db"]);
if (upCode !== 0) process.exit(upCode);

// Applies migrations and loads the sample data, so the site is not empty on the first start.
const seedCode = await run(["bun", "run", "--filter", "@clever-gadgets/server", "seed"]);
if (seedCode !== 0) {
  await run(["docker", "compose", "stop", "db"]);
  process.exit(seedCode);
}

const dev = Bun.spawn(
  ["bun", "run", "--filter", "@clever-gadgets/server", "--filter", "@clever-gadgets/web", "dev"],
  { stdio: ["inherit", "inherit", "inherit"] },
);

// Ctrl+C reaches the dev servers directly (same process group). This process stays alive
// so it can stop the database after the dev servers have exited.
process.on("SIGINT", () => {});
process.on("SIGTERM", () => dev.kill("SIGTERM"));

const devCode = await dev.exited;
console.log("\nStopping database …");
await run(["docker", "compose", "stop", "db"]);
process.exit(devCode);
