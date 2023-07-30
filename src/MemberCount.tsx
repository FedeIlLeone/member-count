import { common, components, webpack } from "replugged";
import { GuildMemberCountStore, GuildPopoutStore, SelectedGuildStore } from "./types";
import { logger } from ".";
import { fetchGuildPopout } from "./util";

const { React, i18n } = common;
const { Flex } = components;

export default function MemberCount(): React.ReactNode {
  const GuildMemberCountStore =
    webpack.getByStoreName<GuildMemberCountStore>("GuildMemberCountStore");
  if (!GuildMemberCountStore) {
    logger.error("Failed to find GuildMemberCountStore");
    return;
  }
  const GuildPopoutStore = webpack.getByStoreName<GuildPopoutStore>("GuildPopoutStore");
  if (!GuildPopoutStore) {
    logger.error("Failed to find GuildPopoutStore");
    return;
  }
  const SelectedGuildStore = webpack.getByStoreName<SelectedGuildStore>("SelectedGuildStore");
  if (!SelectedGuildStore) {
    logger.error("Failed to find SelectedGuildStore");
    return;
  }

  const classes = webpack.getByProps<
    Record<"status" | "statusOnline" | "statusOffline" | "statusWrapper" | "count", string>
  >("status", "statusOnline", "statusOffline", "statusWrapper", "count");
  if (!classes) {
    logger.error("Failed to find dot classes");
    return;
  }

  const [onlineCount, setOnlineCount] = React.useState<number | null>(null);
  const [memberCount, setMemberCount] = React.useState<number | null>(null);

  const update = (): void => {
    const guildId = SelectedGuildStore.getGuildId();
    if (!guildId) {
      setOnlineCount(null);
      setMemberCount(null);
      return;
    }

    const popoutGuild = GuildPopoutStore.getGuild(guildId);
    if (!popoutGuild && !GuildPopoutStore.isFetchingGuild(guildId)) {
      void fetchGuildPopout(guildId);
    }

    const memberStoreCount = GuildMemberCountStore.getMemberCount(guildId);

    setOnlineCount(popoutGuild?.presenceCount || null);
    setMemberCount(memberStoreCount || popoutGuild?.memberCount || null);
  };

  React.useEffect(() => {
    update();

    const stores = [GuildMemberCountStore, GuildPopoutStore, SelectedGuildStore];

    stores.forEach((store) => store.addChangeListener(update));
    return () => {
      stores.forEach((store) => store.removeChangeListener(update));
    };
  }, []);

  const children: React.ReactNode[] = [];

  if (onlineCount) {
    const msg = i18n.Messages.INSTANT_INVITE_GUILD_MEMBERS_ONLINE.format({
      membersOnline: onlineCount,
    });
    const dot = <i className={`${classes.statusOnline} ${classes.status}`} />;

    children.push(
      <div className={classes.statusWrapper}>
        {dot}
        <span className={classes.count}>{msg}</span>
      </div>,
    );
  }

  if (memberCount) {
    const msg = i18n.Messages.INSTANT_INVITE_GUILD_MEMBERS_TOTAL.format({
      count: memberCount,
    });
    const dot = <i className={`${classes.statusOffline} ${classes.status}`} />;

    children.push(
      <div className={classes.statusWrapper}>
        {dot}
        <span className={classes.count}>{msg}</span>
      </div>,
    );
  }

  return (
    <Flex
      direction={Flex.Direction.VERTICAL}
      align={Flex.Align.CENTER}
      style={{
        marginTop: "20px",
        gap: "4px",
      }}>
      {children}
    </Flex>
  );
}
