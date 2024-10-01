import z from "zod";

import { devConfig } from "../../../config/DevSettings";
import { Save } from "../../../models/save.model";
import { ORMContext } from "../../../server";
import { KoaController } from "../../../utils/KoaController";
import { storeItems } from "../../../data/storeItems";
import { User } from "../../../models/user.model";
import { FilterFrontendKeys } from "../../../utils/FrontendKey";
import { flags } from "../../../data/flags";
import { getCurrentDateTime } from "../../../utils/getCurrentDateTime";
import { loadFailureErr } from "../../../errors/errors";
import { BaseMode } from "../../../enums/Base";
import { WORLD_SIZE } from "../../../config/WorldGenSettings";
import { Status } from "../../../enums/StatusCodes";
import { baseModeView } from "./modes/baseModeView";
import { baseModeBuild } from "./modes/baseModeBuild";
import { errorLog } from "../../../utils/logger";
import { baseModeAttack } from "./modes/baseModeAttack";

const BaseLoadSchema = z.object({
  type: z.string(),
  userid: z.string(),
  baseid: z.string(),
});

export const baseLoad: KoaController = async (ctx) => {
  try {
    const { baseid, type } = BaseLoadSchema.parse(ctx.request.body);
    const user: User = ctx.authUser;
    await ORMContext.em.populate(user, ["save"]);

    const userSave = user.save;
    let baseSave: Save = null;

    switch (type) {
      case BaseMode.BUILD:
        baseSave = await baseModeBuild(ctx, baseid);
        break;

      case BaseMode.VIEW:
        baseSave = await baseModeView(ctx, baseid);
        break;

      case BaseMode.ATTACK:
        baseSave = await baseModeAttack(ctx, baseid, userSave);
        break;

      default:
        throw new Error(`Base type not handled, type: ${type}.`);
    }

    const filteredSave = FilterFrontendKeys(baseSave);
    const isTutorialEnabled = devConfig.skipTutorial
      ? 205
      : filteredSave.tutorialstage;

    ctx.status = Status.OK;
    ctx.body = {
      ...filteredSave,
      flags,
      worldsize: WORLD_SIZE,
      error: 0,
      id: filteredSave.basesaveid,
      storeitems: { ...storeItems },
      tutorialstage: isTutorialEnabled,
      currenttime: getCurrentDateTime(),
      pic_square: `https://api.dicebear.com/9.x/miniavs/png?seed=${baseSave.name}`,
    };
  } catch (error) {
    errorLog(`Error loading base: ${error.message}`);
    throw loadFailureErr();
  }
};
