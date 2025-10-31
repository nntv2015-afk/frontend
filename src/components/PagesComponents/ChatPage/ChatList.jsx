import { useTranslation } from "@/components/Layout/TranslationContext";
import CustomImageTag from "@/components/ReUseableComponents/CustomImageTag";
import { useRTL } from "@/utils/Helper";
import React, { useState } from "react";
import { MdOutlineSupportAgent, MdBlock, MdMoreVert } from "react-icons/md";
import { Skeleton } from "@/components/ui/skeleton";
import BlockedProvidersModal from "./BlockedProvidersModal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RiUserForbidFill } from "react-icons/ri";

const ChatListSkeleton = () => {
  return Array(5).fill(0).map((_, index) => (
    <div key={index} className="flex items-center gap-2 p-2 sm:p-3 lg:p-4 border-b">
      <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  ));
};

const ChatList = ({
  handleAdminChat,
  isAdmin,
  chatListRef,
  handleChatListScroll,
  chatList,
  selectedChatTab,
  isLoadingMore,
  handleChangeTab,
  onFilterChange,
  filterType,
  isLoading,
  blockedProviders,
  onUnblockProvider,
  onGetBlockedProviders,
  setBlockedStatus,
  fetchChatMessages
}) => {
  const t = useTranslation();
  const isRTL = useRTL();
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const handleOpenBlockedModal = () => {
    // Fetch blocked providers when opening modal
    onGetBlockedProviders();
    setShowBlockedModal(true);
  };

  // Create a map to track unique chats and deduplicate them
  const uniqueChats = [];
  const seenKeys = new Set();
  
  if (Array.isArray(chatList)) {
    chatList.forEach(chat => {
      const key = chat.booking_id 
        ? `${chat.partner_id}_${chat.booking_id}` 
        : `${chat.partner_id}_pre`;
        
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueChats.push(chat);
      }
    });
  }

  return (
    <div className={`w-full md:w-1/4 card_bg rounded-l-lg overflow-hidden chatListWrapper min-w-[270px] ${
      isRTL ? "border-l" : "md:border-r"
    }`}>
      {/* Sticky Chat List Header */}
      <div className="flex flex-col border-b sticky top-0 z-10 card_bg">
        <div className="flex items-center justify-between p-2 sm:p-3">
          <h1 className="text-lg sm:text-xl">{t("chatList")}</h1>
         
          {/* <button className="primary_bg_color primary_text_color py-2 px-4 rounded-md"> */}
          <button className="p-1.5 hover:light_bg_color rounded-full focus:outline-none" onClick={handleOpenBlockedModal}>
            <RiUserForbidFill className="text-lg primary_text_color" size={20} />
          </button>
            {/* <span>{t("blockedProviders")}</span> */}  
          {/* </button> */}
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 hover:bg-gray-100 rounded-full focus:outline-none">
                <MdMoreVert className="text-xl sm:text-2xl" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className={`flex items-center gap-2 cursor-pointer ${isAdmin ? 'bg-primary/10' : ''}`}
                onClick={handleAdminChat}
              >
                <MdOutlineSupportAgent className="text-lg" />
                <span>{t("customerSupport")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={handleOpenBlockedModal}
              >
                <MdBlock className="text-lg text-red-500" />
                <span>{t("blockedProviders")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>

        {/* Filter Tabs */}
        <div className="flex border-t">
          <button
            onClick={() => onFilterChange('pre_booking')}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
              filterType === 'pre_booking'
                ? 'border_color primary_text_color'
                : 'border-transparent'
            }`}
          >
            {t("enquiries")}
          </button>
          <button
            onClick={() => onFilterChange('booking')}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
              filterType === 'booking'
                ? 'border_color primary_text_color'
                : 'border-transparent'
            }`}
          >
            {t("bookings")}
          </button>
        </div>
      </div>

      {/* Scrollable Chat List */}
      <div
        className="h-[calc(100vh-230px)] sm:h-[600px] overflow-auto"
        ref={chatListRef}
        onScroll={handleChatListScroll}
      >
        {isLoading ? (
          <ChatListSkeleton />
        ) : uniqueChats.length > 0 ? (
          uniqueChats.map((chat) => (
            <div
              key={chat.uniqueId || `${chat.partner_id}_${chat.booking_id || 'pre'}`}
              className={`group w-full flex items-center gap-2 p-2 sm:p-3 lg:p-4 border-b relative 
                              before:content-[""] before:absolute before:w-[4px] before:primary_bg_color 
                              before:rounded-sm hover:light_bg_color ${
                                isRTL ? "before:right-0" : "before:left-0"
                              } cursor-pointer provider 
                              ${
                                selectedChatTab &&
                                ((selectedChatTab?.booking_id &&
                                  selectedChatTab?.booking_id === chat?.booking_id &&
                                  selectedChatTab?.partner_id === chat?.partner_id) ||
                                  (!selectedChatTab?.booking_id &&
                                    !chat?.booking_id &&
                                    selectedChatTab?.partner_id === chat?.partner_id))
                                  ? "before:h-full light_bg_color"
                                  : ""
                              }`}
              onClick={(e) => handleChangeTab(e, chat)}
            >
              <CustomImageTag
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                src={chat?.image}
                alt={chat?.partner_name}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base truncate">
                  {chat?.partner_name}
                </p>
                {chat?.booking_id !== null ? (
                  <div className="flex flex-col text-xs sm:text-sm">
                    <div className="booking_id flex gap-1 items-center">
                      <span className="description_color">{t("bookingId")}:</span>
                      <span className="truncate">{chat?.booking_id}</span>
                    </div>
                    <div className="booking_status flex gap-1 items-center">
                      <span className="description_color">
                        {t("bookingStatus")}:
                      </span>
                      <span className="truncate">{t(chat?.order_status)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs sm:text-sm truncate">
                    {t("preBookingEnq")}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-4 text-gray-500">
            {filterType === 'booking' ? t("noBookingChats") : t("noEnquiryChats")}
          </div>
        )}

        {/* Loading More Chats */}
        {/* {isLoadingMore && (
          <div className="description_color p-1 text-center text-sm">
            {t("loadingMoreChats")}
          </div>
        )} */}
      </div>

      {/* Blocked Providers Modal */}
      <BlockedProvidersModal
        isOpen={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
        blockedProviders={blockedProviders}
        onUnblock={onUnblockProvider}
        selectedChatTab={selectedChatTab}
        setBlockedStatus={setBlockedStatus}
        fetchChatMessages={fetchChatMessages}
      />
    </div>
  );
};

export default ChatList;
