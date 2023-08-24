import express, { Express } from "express";
import { SqliteDriver } from "@mikro-orm/sqlite";
import { EntityManager, MikroORM, RequestContext } from "@mikro-orm/core";
import { logging } from "./utils/logger.js";
import { ascii_node } from "./utils/ascii_art.js";
import fs from "fs";
import morgan from "morgan";
import ormConfig from "./mikro-orm.config";
import "reflect-metadata";
import "dotenv/config";

import playerAuth from "./routes/auth.routes.js";
import debug from "./routes/debug.routes.js";
import baseLoad from "./routes/baseload.routes.js";
import baseSave from "./routes/basesave.routes.js";
import worldmap from "./routes/worldmap.routes.js";
import { ErrorInterceptor } from "./middleware/clientSafeError.js";

export const ORMContext = {} as {
  orm: MikroORM;
  em: EntityManager;
};

// Top-level await
(async () => {
  ORMContext.orm = await MikroORM.init<SqliteDriver>(ormConfig);
  ORMContext.em = ORMContext.orm.em;

  const app: Express = express();
  const port = 3001;

  app.use((_, __, next) => {
    RequestContext.create(ORMContext.orm.em, next);
  });

  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use(express.json({ limit: "50mb" }));

  // Enable/Disable logging of assets
  const isAssetsDisabled = process.env.LOG_ASSETS !== "enabled";
  app.use(morgan("combined", { skip: req => isAssetsDisabled && req.originalUrl.startsWith("/assets")}));

  app.use(express.static("./public"));
  app.use(express.static(__dirname + "/public"));

  // Register routes
  app.use(playerAuth);
  app.use(baseLoad);
  app.use(baseSave);
  app.use(worldmap);
  app.use(debug);
  


  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Handle the error or exit gracefully
  });

  app.get("/crossdomain.xml", (_: any, res) => {
    res.set("Content-Type", "text/xml");
    
    const crossdomain = fs.readFileSync("./crossdomain.xml");
    res.send(crossdomain);
  });
  
  app.use(ErrorInterceptor);
  app.listen(process.env.PORT || port, () => {
    logging(`
    ${ascii_node} Admin dashboard: http://localhost:${port}
    `);
  });
})().catch((e) => console.error(e));
