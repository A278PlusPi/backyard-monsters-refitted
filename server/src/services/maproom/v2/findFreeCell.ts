import { MapRoom, Terrain } from "../../../enums/MapRoom";
import { World } from "../../../models/world.model";
import { WorldMapCell } from "../../../models/worldmapcell.model";
import { EntityManager } from "@mikro-orm/core";
import { logging } from "../../../utils/logger";
import {
  generateNoise,
  getTerrainHeight,
} from "../../../config/WorldGenSettings";

/**
 * Interface representing a cell's coordinates and terrain height.
 */
interface Cell {
  x: number | null;
  y: number | null;
  terrainHeight: number | null;
}

/**
 * Finds a free cell in the given world that is not water and not occupied by another player.
 *
 * @param {World} world - The world in which to find a free cell.
 * @param {EntityManager} em - The entity manager for database operations.
 * @returns {Promise<Cell>} - The coordinates and terrain height of the free cell.
 * @throws {Error} - If no free cell is found after several attempts.
 */
export const findFreeCell = async (world: World, em: EntityManager) => {
  let cell: Cell = { x: null, y: null, terrainHeight: null };

  // Maximum number of attempts to find a free cell
  const maxAttempts = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const x = Math.floor(Math.random() * MapRoom.WIDTH);
    const y = Math.floor(Math.random() * MapRoom.HEIGHT);

    // Generate noise based on the world's seed
    const noise = generateNoise(world.uuid);
    const currentTerrainHeight = getTerrainHeight(noise, world.uuid, x, y);

    // Skip if the cell is water
    if (currentTerrainHeight <= Terrain.WATER3) {
      logging(`Tile (${x}, ${y}) is water. Skipping.`);
      continue;
    }

    // Skip if the cell is already occupied
    const existingCell = await em.findOne(WorldMapCell, { world, x, y });
    if (existingCell) {
      logging(`Tile (${x}, ${y}) is occupied by another player. Skipping.`);
      continue;
    }

    // Valid cell found
    cell = { x, y, terrainHeight: currentTerrainHeight };
    break;
  }

  // TODO: Should not fail, put another world?
  if (cell.x === null || cell.y === null || cell.terrainHeight === null) {
    throw new Error("Failed to find land position after several attempts");
  }

  return cell;
};
