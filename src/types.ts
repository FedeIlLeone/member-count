import { Guild } from "discord-types/general";
import { Store } from "replugged/dist/renderer/modules/common/flux";

export interface GuildMemberCountStore extends Store {
  getMemberCount: (guildId: string) => number;
  getMemberCounts: () => Record<string, number>;
}

export interface GuildPopoutStore extends Store {
  getGuild: (id: string) => Guild & {
    presenceCount: number | null;
    memberCount: number | null;
  };
  isFetchingGuild: (id: string) => boolean;
}

export interface SelectedGuildStore extends Store {
  getGuildId: () => string | null;
}

export interface ListThin {
  render: (args: { className?: string; "data-list-id"?: string }) => React.ReactElement;
}
