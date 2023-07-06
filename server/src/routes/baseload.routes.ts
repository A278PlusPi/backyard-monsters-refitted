import { Router, Request, Response } from "express";
import { debugDataLog } from "../middleware/debugDataLog";

const router = Router();

const baseLoadData = (res: Response) =>
  res.status(200).json({
    error: 0,
    flags: {
      viximo: 0,
      kongregate: 1,
      showProgressBar: 0,
      midgameIncentive: 0,
      plinko: 0,
      fanfriendbookmarkquests: 0,
    },
    fan: 0,
    protected: 1,
    giftsentcount: 4,
    savetime: 100,
    currenttime: 200,
    id: 9765443,
    baseseed: 4520,
    baseid: 1234,
    fbid: 67879,
    userid: 4567,
    attackid: 0,
    homebase: false, // This should be an array
    unreadmessages: 0,
    buildinghealthdata: [],
    buildingdata: {},
    buildingresources: {},
    resources: {
      r1: 10000,
      r2: 10000,
      r3: 10000,
      r4: 10000,
      r1bonus: 10000,
      r2bonus: 10000,
      r3bonus: 10000,
      r4bonus: 10000,
      r1max: 10000,
      r2max: 10000,
      r3max: 10000,
      r4max: 10000,
    },
    iresources: {
      r1: 10000,
      r2: 10000,
      r3: 10000,
      r4: 10000,
      r1bonus: 10000,
      r2bonus: 10000,
      r3bonus: 10000,
      r4bonus: 10000,
      r1max: 10000,
      r2max: 10000,
      r3max: 10000,
      r4max: 10000,
    },
    credits: 2000,
    loot: {},
    researchdata: [],
    stats: {
      popupdata: {},
    },
    academy: {},
    siege: {},
    effects: [],
    monsters: {},
    aiattacks: {},
    tutorialstage: 205, // 205 skips tutorial
    storeitems: {
      BR11I: {
        quantity: 100,
      },
      BR21I: {
        quantity: 100,
      },
      BR31I: {
        quantity: 100,
      },
      BR41I: {
        quantity: 100,
      },
      BR11: {
        quantity: 100,
      },
      BR21: {
        quantity: 100,
      },
      BR31: {
        quantity: 100,
      },
      BR41: {
        quantity: 100,
      },
      BR12I: {
        quantity: 100,
      },
      BR22I: {
        quantity: 100,
      },
      BR32I: {
        quantity: 100,
      },
      BR42I: {
        quantity: 100,
      },
      BR12: {
        quantity: 100,
      },
      BR22: {
        quantity: 100,
      },
      BR32: {
        quantity: 100,
      },
      BR42: {
        quantity: 100,
      },

      BR13I: {
        quantity: 100,
      },
      BR23I: {
        quantity: 100,
      },
      BR33I: {
        quantity: 100,
      },
      BR43I: {
        quantity: 100,
      },
      BR13: {
        quantity: 100,
      },
      BR23: {
        quantity: 100,
      },
      BR33: {
        quantity: 100,
      },
      BR43: {
        quantity: 100,
      },
      FIX: {},
      BLK2: {},
      BLK3: {},
      BLK4: {},
      BLK5: {},
      HOD: {},
      POD: {},
      EXH: {},
    },
    storedata: {},
    inventory: {},
    lockerdata: {},
    quests: {},
    monsterbaiter: {},
    champion: "null",
    attacks: [],
    name: "John Doe",
    pic_square: "https://apprecs.org/ios/images/app-icons/256/df/634186975.jpg",
    gifts: [],
    h: "someHashValue",
    basename: "testBase",
    basevalue: 20,
    points: 5,
    mushrooms: {},
  });

router.get("/base/load/", debugDataLog, (_: any, res: Response) => baseLoadData(res));
router.post("/base/load/", debugDataLog, (_: Request, res: Response) => baseLoadData(res));

export default router;