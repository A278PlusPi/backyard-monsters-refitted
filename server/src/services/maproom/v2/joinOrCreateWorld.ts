import { ORMContext } from "../../../server";
import { WorldMapCell } from "../../../models/worldmapcell.model";
import { User } from "../../../models/user.model";
import { Save } from "../../../models/save.model";
import { logging } from "../../../utils/logger";
import { World } from "../../../models/world.model";
import { MapRoom, MapRoomCell } from "../../../enums/MapRoom";
import {
  generateNoise,
  getTerrainHeight,
} from "../../../config/WorldGenSettings";

export const joinOrCreateWorld = async (
  user: User,
  save: Save,
  isMigratingWorlds: Boolean = false
): Promise<void> => {
  //   if (migrate) {
  //     const cell = await getFreeCell(homeBase.world_id, true)
  //     homeBase.x = cell.x;
  //     homeBase.y = cell.y;
  //     await fork.persistAndFlush(homeBase)
  //     save.homebase = [cell.x.toString(), cell.y.toString()]
  //     await fork.persistAndFlush(save)
  // }

  // Find an existing world with space
  let world = await ORMContext.em.findOne(World, {
    playerCount: {
      $lte: MapRoom.MAX_PLAYERS,
    },
  });

  if (!world) {
    logging("All worlds full, creating new world");
    world = ORMContext.em.create(World, {});
  } else {
    logging(`World found with ${world.playerCount} players`);
  }

  if (save.worldid === world.uuid) return;

  save.usemap = 1;
  save.worldid = world.uuid;
  world.playerCount += 1;

  // We need to put the base on the map?
  //   if (world.playerCount === 1) {
  //     // Put the base on 0,0
  //     // Edge case - what if 0,0 is water?

  //   }
  // const cell = await getFreeCell(world.uuid, true);

  const noise = generateNoise(world.uuid);
  const cellX = world.playerCount - 1;
  const cellY = world.playerCount - 1;
  const terrainHeight = getTerrainHeight(noise, cellX, cellY);

  const homebaseCell = new WorldMapCell(world, cellX, cellY, terrainHeight);

  homebaseCell.uid = user.userid;
  homebaseCell.base_type = MapRoomCell.HOMECELL;
  homebaseCell.base_id = parseInt(save.baseid);

  save.cell = homebaseCell;
  save.worldid = world.uuid;
  save.homebase = [homebaseCell.x.toString(), homebaseCell.y.toString()];

  await ORMContext.em.persistAndFlush([world, homebaseCell, save]);
};
