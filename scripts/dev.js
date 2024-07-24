const {  execSync } = require("child_process");
//  start the docker container
execSync("docker compose up -d", { stdio: "inherit" });

// make sure all the migrations are up to date
execSync("npm run setup:db", { stdio: "inherit" });

// start the server
execSync("npm run start:watch", { stdio: "inherit" });