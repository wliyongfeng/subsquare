import { useChainSettings } from "next-common/context/chain";
import HeaderAccount from "./headerAccount";
import NetworkSwitch from "./networkSwitch";
import NodeSwitch from "./nodeSwitch";
import SearchInput from "./searchInput";
import SearchInputWithPopup from "./searchInputWithPopup";
export default function Header() {
  const chainSettings = useChainSettings();
  const {
    modules: { referenda: hasReferenda },
  } = chainSettings;

  return (
    <header className="py-4 px-6 flex gap-x-6 border-b border-neutral300 bg-neutral100">
      <div className="flex-1">
        {hasReferenda ? <SearchInputWithPopup /> : <SearchInput />}
      </div>

      <div className="flex gap-x-2 relative">
        <HeaderAccount />
        <NetworkSwitch activeNode={chainSettings} />
        <NodeSwitch small />
      </div>
    </header>
  );
}
