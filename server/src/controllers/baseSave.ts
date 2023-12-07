import { Save } from "../models/save.model";
import { User } from "../models/user.model";
import { ORMContext } from "../server";
import { FilterFrontendKeys } from "../utils/FrontendKey";
import { KoaController } from "../utils/KoaController";
import { getCurrentDateTime } from "../utils/getCurrentDateTime";
import { logging } from "../utils/logger";

export const baseSave: KoaController = async (ctx) => {
  const user: User = ctx.authUser;
  logging(`Saving the base! user: ${user.username}`);

  await ORMContext.em.populate(user, ["save"]);
  let save = user.save;
  
  // Update the save with the values from the request
  for (const key of Save.jsonKeys) {
    const requestBodyValue = ctx.request.body[key];
    if (requestBodyValue) {
      if (!Array.isArray(requestBodyValue)) {
        ctx.request.body[key] = JSON.parse(requestBodyValue);
      }
    }
  }

  // Copy the basesaveid
  ctx.session.basesaveid = save.basesaveid;

  // Update resources with the delta sent from the client 
  if (ctx.request.body['resources'] !== undefined) {
    const storeResources = save.resources;
    const clientResources = ctx.request.body['resources'];

    storeResources['r1'] += clientResources['r1'];
    storeResources['r2'] += clientResources['r2'];
    storeResources['r3'] += clientResources['r3'];
    storeResources['r4'] += clientResources['r4'];

    delete ctx.request.body['resources'];
  }

  // Update 'storedata' with the new purchased item & quantity
  const purchaseString: string | undefined = (ctx.request.body as any)
    ?.purchase;
  
  if (purchaseString) {
    const purchaseArray: [string, number] = JSON.parse(purchaseString);
    const [item, quantity] = purchaseArray;

    const storeData = save.storedata || {};

    storeData[item] = {
      q: (storeData[item]?.q || 0) + quantity,
    };

    save.storedata = storeData;
  }

  // Update the save timestamp
  save.savetime = getCurrentDateTime();
  // Set the id field (_lastSaveID) to be the same as savetime, client expects this.
  save.id = save.savetime;

  // Equivalent to Object.assign() - merges second object onto entity
  ORMContext.em.assign(save, ctx.request.body);
  await ORMContext.em.persistAndFlush(save);

  const filteredSave = FilterFrontendKeys(save);
  const baseSaveData = {
    error: 0,
    basesaveid: save.basesaveid,
    installsgenerated: 42069,
  };

  // filteredSave.credits = 6969;

  ctx.status = 200;
  ctx.body = {
    ...baseSaveData,
    ...filteredSave,
    h: "someHashValue",
  };
};
