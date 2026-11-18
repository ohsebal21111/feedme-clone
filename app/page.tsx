import { AccountLink } from "./_components/account-link";
import { Converter } from "./_components/converter";

export default function Home() {
  return <Converter account={<AccountLink />} />;
}
