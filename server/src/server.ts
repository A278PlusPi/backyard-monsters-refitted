import express, { Express } from "express";
import routes from "./app.routes.js";
import fs from "fs";
import morgan from "morgan";
import { logging } from "./utils/logger.js";
import { ascii_node } from "./utils/ascii_art.js";

const app: Express = express();
const port = 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("combined"));

app.use(routes);

app.get("/crossdomain.xml", (_: any, res) => {
  res.set("Content-Type", "text/xml");

  const crossdomain = fs.readFileSync("./crossdomain.xml");
  res.send(crossdomain);
});

app.use(express.static("./public"));

app.listen(process.env.PORT || port, () => {
  logging(`
  ${ascii_node} Admin dashboard: http://localhost:${port}
  `);
});

app.use(express.static(__dirname + '/public'));

export default app;
