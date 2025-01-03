import { Migration } from '@mikro-orm/migrations';

export class Migration20250103164649 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `world` (`uuid` varchar(255) not null, `player_count` int not null default 0, `created_at` datetime not null, `lastupdate_at` datetime not null, primary key (`uuid`)) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `world_map_cell` (`cellid` int unsigned not null auto_increment primary key, `base_id` bigint not null default 0, `world_id` varchar(255) not null, `uid` int not null default 0, `x` int not null, `y` int not null, `base_type` int not null default 0, `terrain_height` int not null, `world_uuid` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `world_map_cell` add index `world_map_cell_world_uuid_index`(`world_uuid`);');
    this.addSql('alter table `world_map_cell` add index `world_map_cell_world_id_x_y_index`(`world_id`, `x`, `y`);');

    this.addSql('create table `save` (`basesaveid` bigint unsigned not null auto_increment primary key, `baseid` bigint not null default 0, `cell_cellid` int unsigned null, `homebaseid` bigint not null default 0, `userid` int not null, `saveuserid` int not null, `attackid` int not null default 0, `id` int not null default 0, `baseid_inferno` int not null default 0, `wmid` int not null default 0, `main_protection_time` int null, `outpost_protection_time` int null, `initial_protection_over` tinyint(1) not null default false, `initial_outpost_protection_over` tinyint(1) not null default false, `type` varchar(255) not null default \'main\', `createtime` int not null, `savetime` int not null default 0, `seed` int not null default 0, `bookmarked` int not null default 0, `fan` int not null default 0, `emailshared` int not null default 0, `unreadmessages` int not null default 0, `giftsentcount` int not null default 0, `canattack` tinyint(1) not null default false, `fbid` varchar(255) null, `fortifycellid` int not null default 0, `name` varchar(255) not null, `level` int not null default 1, `catapult` int not null default 0, `flinger` int not null default 0, `destroyed` int not null default 0, `damage` int not null default 0, `locked` int not null default 0, `points` bigint not null default 0, `basevalue` bigint not null default 0, `tutorialstage` int not null default 0, `protected` int not null default 1, `lastupdate` int not null default 0, `usemap` int not null default 0, `credits` int not null, `champion` json null default \'null\', `attackerchampion` json null default \'null\', `empiredestroyed` int not null default 0, `worldid` varchar(255) null, `event_score` int not null default 0, `chatenabled` int not null default 0, `relationship` int not null default 0, `timeplayed` int not null default 0, `version` int not null default 128, `clienttime` int not null default 0, `baseseed` int not null default 0, `healtime` int not null default 0, `empirevalue` int not null default 0, `basename` varchar(255) not null default \'basename\', `over` int not null default 0, `protect` int not null default 0, `purchasecomplete` int not null default 0, `cantmovetill` int null, `buildingdata` json null, `buildingkeydata` json null, `researchdata` json null, `stats` json null, `academy` json null, `rewards` json null, `aiattacks` json null, `monsters` json null, `resources` json null, `iresources` json null, `lockerdata` json null, `events` json null, `inventory` json null, `monsterbaiter` json null, `loot` json null, `attackreport` json null, `storedata` json null, `coords` json null, `quests` json null, `player` json null, `krallen` json null, `siege` json null, `buildingresources` json null, `mushrooms` json null, `buildinghealthdata` json null, `frontpage` json null, `created_at` datetime not null, `lastupdate_at` datetime not null, `attackcreatures` json null, `attackloot` json null, `lootreport` json null, `attackersiege` json null, `attack_timestamps` json not null, `monsterupdate` json null, `savetemplate` json null, `updates` json null, `effects` json null, `homebase` json null, `outposts` json null, `wmstatus` json null, `chatservers` json null, `achieved` json null, `attacks` json null, `gifts` json null, `sentinvites` json null, `sentgifts` json null, `fbpromos` json null, `powerups` json null, `attpowerups` json null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `save` add unique `save_cell_cellid_unique`(`cell_cellid`);');

    this.addSql('create table `user` (`userid` int unsigned not null auto_increment primary key, `save_basesaveid` bigint unsigned null, `username` varchar(255) not null, `banned` tinyint(1) not null default false, `email` varchar(255) not null, `password` varchar(255) not null, `discord_verified` tinyint(1) not null default false, `discord_id` varchar(255) null, `discord_tag` varchar(255) null, `ban_report` json null, `last_name` varchar(255) not null default \'\', `reset_token` varchar(255) not null default \'\', `pic_square` varchar(255) null, `timeplayed` int not null default 0, `stats` json null, `friendcount` int not null default 0, `sessioncount` int not null default 0, `addtime` int not null default 100, `bookmarks` json null, `_is_fan` int not null default 0, `sendgift` int not null default 0, `sendinvite` int not null default 0) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `user` add unique `user_save_basesaveid_unique`(`save_basesaveid`);');
    this.addSql('alter table `user` add unique `user_username_unique`(`username`);');
    this.addSql('alter table `user` add index `user_email_index`(`email`);');
    this.addSql('alter table `user` add unique `user_email_unique`(`email`);');

    this.addSql('alter table `world_map_cell` add constraint `world_map_cell_world_uuid_foreign` foreign key (`world_uuid`) references `world` (`uuid`) on update cascade;');

    this.addSql('alter table `save` add constraint `save_cell_cellid_foreign` foreign key (`cell_cellid`) references `world_map_cell` (`cellid`) on update cascade on delete set null;');

    this.addSql('alter table `user` add constraint `user_save_basesaveid_foreign` foreign key (`save_basesaveid`) references `save` (`basesaveid`) on update cascade on delete set null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `world_map_cell` drop foreign key `world_map_cell_world_uuid_foreign`;');

    this.addSql('alter table `save` drop foreign key `save_cell_cellid_foreign`;');

    this.addSql('alter table `user` drop foreign key `user_save_basesaveid_foreign`;');

    this.addSql('drop table if exists `world`;');

    this.addSql('drop table if exists `world_map_cell`;');

    this.addSql('drop table if exists `save`;');

    this.addSql('drop table if exists `user`;');
  }

}
