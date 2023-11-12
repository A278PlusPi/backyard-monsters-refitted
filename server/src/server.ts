import "reflect-metadata";
import "dotenv/config";

import Koa, { Context, Next } from "koa";
import session from "koa-session";
import Router from "@koa/router";
import bodyParser from "koa-bodyparser";
import fs from "fs/promises";
import serve from "koa-static";
import ormConfig from "./mikro-orm.config";
import router from "./app.routes";

import { SqliteDriver } from "@mikro-orm/sqlite";
import { EntityManager, MikroORM, RequestContext } from "@mikro-orm/core";
import { errorLog, logging } from "./utils/logger.js";
import { ascii_node } from "./utils/ascii_art.js";
import { ErrorInterceptor } from "./middleware/clientSafeError.js";
import { processLanguagesFile } from "./middleware/processLanguageFile";
import { logMissingAssets, morganLogging } from "./middleware/morganLogging";
import { SESSION_CONFIG } from "./config/SessionConfig";

export const ORMContext = {} as {
  orm: MikroORM;
  em: EntityManager;
};

export const app = new Koa();
const port = process.env.PORT || 3001;

// Sessions
app.keys = [process.env.SECRET_KEY];
app.use(session(SESSION_CONFIG, app));

// Entry point for all modules.
const api = new Router();
api.get("/", (ctx: Context) => (ctx.body = {}));

(async () => {
  ORMContext.orm = await MikroORM.init<SqliteDriver>(ormConfig);
  ORMContext.em = ORMContext.orm.em;

  app.use(
    bodyParser({
      enableTypes: ["json", "form"],
      jsonLimit: "50mb",
      formLimit: "50mb",
    })
  );

  app.use((_, next: Next) =>
    RequestContext.createAsync(ORMContext.orm.em, next)
  );

  // Logs
  app.use(logMissingAssets);
  app.use(morganLogging);

  app.use(processLanguagesFile);

  app.use(serve("./public"));
  app.use(serve(__dirname + "/public"));

  process.on("unhandledRejection", (reason, promise) => {
    errorLog(`Unhandled Rejection at: ${promise} reason: ${reason}`);
  });

  app.use(async (ctx, next) => {
    if (ctx.path === "/crossdomain.xml") {
      ctx.type = "text/xml";
      const crossdomain = await fs.readFile("./crossdomain.xml", "utf-8");
      ctx.body = crossdomain;
    } else {
      await next();
    }
  });

  app.use(ErrorInterceptor);

  // Routes
  app.use(router.routes());
  app.use(router.allowedMethods());

  app.listen(port, () => {
    logging(`
    ${ascii_node} Admin dashboard: http://localhost:${port}
    `);
  });
})().catch((e) => errorLog(e));
