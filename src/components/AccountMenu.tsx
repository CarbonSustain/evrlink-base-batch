import React from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Settings, LogOut, User, ImagePlus } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

interface AccountMenuProps {
  address: string;
}

const AccountMenu = ({ address }: AccountMenuProps) => {
  const navigate = useNavigate();
  const { disconnect } = useWallet();
  const [copied, setCopied] = React.useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const handleLogout = () => {
    disconnect();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-purple-600" />
          <span className="text-black">{truncateAddress(address)}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[300px] bg-[#fafafa] border-gray-200 text-black">
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-purple-600" />
          <span className="font-medium">Manage account</span>
        </div>

        <div className="px-4 py-3 space-y-4 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-600">CONNECTED WALLET</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-black">{truncateAddress(address)}</span>
              <button
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                onClick={copyAddress}
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <img src="/ronin-logo.png" alt="RON" className="w-5 h-5" />
                <span>0</span>
              </div>
              <span>$0.00</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/wrapped-ron-logo.png"
                  alt="WRON"
                  className="w-5 h-5"
                />
                <span>0</span>
              </div>
              <span>$0.00</span>
            </div>
          </div>

          <button className="w-full py-2.5 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-center">
            Wrap/Unwrap RON
          </button>

          <button
            onClick={() => navigate("/create-background")}
            className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-center flex items-center justify-center gap-2"
          >
            <ImagePlus className="w-4 h-4" />
            Create Background
          </button>
        </div>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          className="px-4 py-2.5 text-black hover:bg-gray-100 cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          <User className="w-4 h-4 mr-2" />
          My Gallery
        </DropdownMenuItem>

        <DropdownMenuItem className="px-4 py-2.5 text-black hover:bg-gray-100 cursor-pointer">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          className="px-4 py-2.5 text-red-500 hover:bg-gray-100 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountMenu;
