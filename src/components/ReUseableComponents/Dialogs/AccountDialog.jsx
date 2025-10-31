import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaChevronDown, FaRegCalendarCheck, FaUser } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import Link from "next/link";
import {
  IoCardOutline,
  IoChatboxEllipsesOutline,
  IoExitOutline,
  IoLocationOutline,
} from "react-icons/io5";
import { MdNotificationsNone } from "react-icons/md";
import { CiBookmarkCheck } from "react-icons/ci";
import { placeholderImage } from "@/utils/Helper";
import { useTranslation } from "@/components/Layout/TranslationContext";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { clearChatData } from "@/redux/reducers/helperSlice";
import { VscTools } from "react-icons/vsc";

const AccountDialog = ({ isVisible, onOpenChange, userData, handleLogout }) => {
  const t = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  
  const GoChats = () => {
    dispatch(clearChatData());
    router.push("/chats");
  }


  return (
    <DropdownMenu open={isVisible} onOpenChange={onOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center space-x-2 light_bg_color primary_text_color px-4 py-2 rounded-md"
          onMouseEnter={() => onOpenChange(true)}
          onMouseLeave={() => onOpenChange(false)}
        >
          <FaUser size={18} />
          <span>{t("account")}</span>
          <span
            className={`transition-all duration-500 ${isVisible ? "rotate-180" : ""
              }`}
          >
            <FaChevronDown size={14} />
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 p-4 account-dropdown"
        align="end"
        sideOffset={5}
        onMouseEnter={() => onOpenChange(true)}
        onMouseLeave={() => onOpenChange(false)}
        forceMount
      >
        <DropdownMenuLabel className="flex items-center space-x-2">
          <Avatar className="w-[56px] h-[56px]">
            <AvatarImage
              src={userData?.image ? userData?.image : placeholderImage}
              alt={userData?.username}
            />
            <AvatarFallback>
              {" "}
              {userData?.username
                ?.split(" ")
                .map((word) => word[0]?.toUpperCase())
                .slice(0, 2)
                .join("") || "NA"}
            </AvatarFallback>
          </Avatar>
          <div className="w-full">
            <div className="text-lg font-semibold line-clamp-1">
              {userData?.username}
            </div>
            <div className="flex items-center justify-between w-full text-sm font-normal description_color">
              {userData?.email && <span>{userData?.email}</span>}
              {/* <span>
            <FaArrowRight />
          </span> */}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <Link href="/general-bookings" title={t("generalBookings")}>
          <DropdownMenuItem className="flex items-center justify-start gap-4 cursor-pointer">
            <span className="primary_text_color">
              <FaRegCalendarCheck size={24} />
            </span>
            <span className="text-lg font-normal">{t("bookings")}</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem className="flex items-center justify-start gap-4 cursor-pointer" onClick={GoChats}>
          <span className="primary_text_color">
            <IoChatboxEllipsesOutline size={24} />
          </span>
          <span className="text-lg font-normal">{t("chats")}</span>
        </DropdownMenuItem>
        <Link href="/notifications" title={t("notifications")}>
          <DropdownMenuItem className="flex items-center justify-start gap-4 cursor-pointer">
            <span className="primary_text_color">
              <MdNotificationsNone size={24} />
            </span>
            <span className="text-lg font-normal">{t("notifications")}</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/bookmarks" title={t("bookmarks")}>
          <DropdownMenuItem className="flex items-center justify-start gap-4 cursor-pointer">
            <span className="primary_text_color">
              <CiBookmarkCheck size={24} />
            </span>
            <span className="text-lg font-normal">{t("bookmarks")}</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/my-services-requests" title={t("myServiceRequests")}>
          <DropdownMenuItem className="flex items-center justify-start gap-4 cursor-pointer">
            <span className="primary_text_color">
              <VscTools size={24} />
            </span>
            <span className="text-lg font-normal">{t("myServiceRequests")}</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/addresses" title={t("addresses")}>
          <DropdownMenuItem className="flex items-center justify-start gap-4 cursor-pointer">
            <span className="primary_text_color">
              <IoLocationOutline size={24} />
            </span>
            <span className="text-lg font-normal">{t("addresses")}</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/payment-history" title={t("paymentHistory")}>
          <DropdownMenuItem className="flex items-center justify-start gap-4 cursor-pointer">
            <span className="primary_text_color">
              <IoCardOutline size={24} />
            </span>
            <span className="text-lg font-normal">{t("paymentHistory")}</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem
          className="flex items-center justify-start gap-4"
          onClick={handleLogout}
        >
          <span className="primary_text_color">
            <IoExitOutline size={24} />
          </span>
          <span className="text-lg font-normal">{t("logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountDialog;
