// Startet die Datenbank und die Dev-Server. Wenn die Dev-Server enden
// (z. B. mit Ctrl+C), wird auch der Datenbank-Container gestoppt.

const run = (cmd: string[]) =>
  Bun.spawn(cmd, { stdio: ["inherit", "inherit", "inherit"] }).exited;

const upCode = await run(["docker", "compose", "up", "-d", "--wait", "db"]);
if (upCode !== 0) process.exit(upCode);

// Wendet Migrationen an und lädt die Beispieldaten, damit die Seite beim ersten Start nicht leer ist.
const seedCode = await run(["bun", "run", "--filter", "@clever-gadgets/server", "seed"]);
if (seedCode !== 0) {
  await run(["docker", "compose", "stop", "db"]);
  process.exit(seedCode);
}

const dev = Bun.spawn(
  ["bun", "run", "--filter", "@clever-gadgets/server", "--filter", "@clever-gadgets/web", "dev"],
  { stdio: ["inherit", "inherit", "inherit"] },
);

// Ctrl+C erreicht die Dev-Server direkt (gleiche Prozessgruppe). Dieser Prozess bleibt am Leben,
// damit er die Datenbank stoppen kann, nachdem die Dev-Server beendet sind.
process.on("SIGINT", () => {});
process.on("SIGTERM", () => dev.kill("SIGTERM"));

const devCode = await dev.exited;
console.log("\nStopping database …");
await run(["docker", "compose", "stop", "db"]);
process.exit(devCode);
