import { devConfig } from "../../../config/DevSettings";
import { Save } from "../../../models/save.model";
import { ORMContext } from "../../../server";
import { KoaController } from "../../../utils/KoaController";
import { storeItems } from "../../../data/storeItems";
import { User } from "../../../models/user.model";
import { FilterFrontendKeys } from "../../../utils/FrontendKey";
import { flags } from "../../../data/flags";
import { getCurrentDateTime } from "../../../utils/getCurrentDateTime";
import { WorldMapCell } from "../../../models/worldmapcell.model";
import { generateID } from "../../../utils/generateID";
import { loadBuildBase, loadViewBase } from "../../../services/base/loadBase";
import { saveFailureErr } from "../../../errors/errorCodes.";
import { BaseMode } from "../../../enums/Base";
import {
  generateNoise,
  getTerrainHeight,
  WORLD_SIZE,
} from "../../../config/WorldGenSettings";
import { World } from "../../../models/world.model";
import { Status } from "../../../enums/StatusCodes";
import { removeDamageProtection } from "../../../services/maproom/v2/damageProtection";
import { getWildMonsterSave } from "../../../services/maproom/v2/wildMonsters";
import z from "zod";

const BaseLoadRequestSchema = z.object({
  type: z.string(),
  userid: z.string(),
  baseid: z.string(),
});

export const baseLoad: KoaController = async (ctx) => {
  try {
    const { type: baseLoadMode, baseid: baseId } = BaseLoadRequestSchema.parse(
      ctx.request.body
    );

    const user: User = ctx.authUser;
    await ORMContext.em.populate(user, ["save"]);
    let baseSave: Save = null;

    const userSave = user.save;

    const getRequestedBase = async () => {
      const requestedBaseSave = await loadViewBase(ctx, baseId);
      if (!requestedBaseSave)
        getWildMonsterSave(parseInt(baseId), user.save.worldid);
      return requestedBaseSave;
    };

    switch (baseLoadMode) {
      case BaseMode.BUILD:
        baseSave = await loadBuildBase(ctx, baseId);
        if (baseSave && baseSave.saveuserid !== user.userid)
          throw saveFailureErr();

        if (!baseSave)
          // If there is no save, create one with default values
          baseSave = await Save.createDefaultUserSave(ORMContext.em, user);
        break;
      case BaseMode.VIEW:
        console.log("Loading view base", baseId);
        baseSave = await getRequestedBase();
        break;
      case BaseMode.ATTACK:
        baseSave = await getRequestedBase();
        // You lose your damage protection on your first attack
        await removeDamageProtection(user, baseSave.homebase);
        baseSave.attackid = generateID(5);
        if (baseSave.homebaseid === 0) {
          let cell = await ORMContext.em.findOne(WorldMapCell, {
            base_id: baseSave.basesaveid,
          });
          if (!cell) {
            // Create a cell record when attacking tribe bases
            const world = await ORMContext.em.findOne(World, {
              uuid: userSave.worldid,
            });

            if (!world) throw new Error("No world found.");

            const baseIdSplit = [...`${baseId}`];
            const cellX = parseInt(baseIdSplit.slice(1, 4).join(""));
            const cellY = parseInt(baseIdSplit.slice(4).join(""));
            const cell = new WorldMapCell(
              world,
              cellX,
              cellY,
              getTerrainHeight(generateNoise(userSave.worldid), cellX, cellY),
              {
                base_id: parseInt(baseIdSplit.join()),
                uid: baseSave.saveuserid,
                base_type: 1,
              }
            );

            await ORMContext.em.persistAndFlush(cell);
            baseSave.homebaseid = parseInt(baseIdSplit.join());
            baseSave.cell = cell;
            baseSave.worldid = world.uuid;
          }
        }
        await ORMContext.em.persistAndFlush(baseSave);
        break;
      default:
        throw new Error(`Base type not handled ${baseLoadMode}. Fix me`);
    }

    const filteredSave = FilterFrontendKeys(baseSave);
    const isTutorialEnabled = devConfig.skipTutorial ? 205 : 0;

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
    console.log("Error loading base", error);
    ctx.status = 400;
    ctx.body = { error: "Invalid request body", details: error.errors };
    return;
  }
};
