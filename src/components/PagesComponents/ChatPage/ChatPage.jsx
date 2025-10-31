import Layout from '@/components/Layout/Layout'
import BreadCrumb from '@/components/ReUseableComponents/BreadCrumb'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { FaFile, FaArrowLeft } from "react-icons/fa";
import { IoMdClose, IoMdDownload } from 'react-icons/io';
import Lightbox from '@/components/ReUseableComponents/CustomLightBox/LightBox';
import { useSelector, useDispatch } from 'react-redux';
import { fetch_chat_history, fetch_providr_chat_list, send_chat_message, blockUserApi, unblockUserApi, deleteChatUserApi, getBlockedProvidersApi } from '@/api/apiRoutes';
import { useTranslation } from '@/components/Layout/TranslationContext';
import { getUserData } from '@/redux/reducers/userDataSlice';
import moment from 'moment';
import withAuth from '@/components/Layout/withAuth';
import { getChatData, selectHelperState } from '@/redux/reducers/helperSlice';
import { Skeleton } from '@/components/ui/skeleton';
import AdminChat from './AdminChat';
import ChatList from './ChatList';
import ProviderChat from './ProviderChat';
import CustomImageTag from '@/components/ReUseableComponents/CustomImageTag';
import { isMobile, useRTL } from '@/utils/Helper';
import { MdOutlineSupportAgent } from 'react-icons/md';
import { setChatStep, setSelectedChatId, setSelectedChat, setIsAdmin, selectChatUI, resetChatUI } from '@/redux/reducers/chatUISlice';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { BsThreeDotsVertical } from 'react-icons/bs';
import ReportReasonModal from './ReportReasonModal'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DeleteChatDialog from './DeleteChatDialog'
import UnblockDialog from './UnblockDialog'
import SideNavigation from '../ProfilePages/SideNavigation';

const ChatPage = ({ notificationData }) => {

    const t = useTranslation();
    const router = useRouter();
    const isRTL = useRTL();

    const settingsData = useSelector((state) => state?.settingsData);

    const userData = useSelector(getUserData);

    const chatListRef = useRef(null);

    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentImages, setCurrentImages] = useState([]);
    const [mobileView, setMobileView] = useState(false);
    const dispatch = useDispatch();
    const chatUI = useSelector(selectChatUI);
    const [chatStep, setChatStep] = useState(chatUI.chatStep);

    const [isAdmin, setIsAdmin] = useState(chatUI.isAdmin);
    const [offset, setOffset] = useState(0);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [selectedChatTab, setSelectedChatTab] = useState(null);

    const [listOffset, setListOffset] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreChats, setHasMoreChats] = useState(true);
    const [filterType, setFilterType] = useState('pre_booking');

    const [chatMessages, setChatMessages] = useState([]);

    const listLimit = 10;
    const msgListLimit = 25;

    const MaxCharactersInTextMessage = settingsData?.settings?.general_settings?.maxCharactersInATextMessage
    const MaxFileSizeInMBCanBeSent = settingsData?.settings?.general_settings?.maxFileSizeInMBCanBeSent
    const MaxFilsOrImagesInOneMessage = settingsData?.settings?.general_settings?.maxFilesOrImagesInOneMessage

    const [attachedFiles, setAttachedFiles] = useState([]);

    const [newStoredChat, setNewStoredChat] = useState()
    const [message, setMessage] = useState('')

    const [chatList, setChatList] = useState([]);

    const [prevChatContext, setPrevChatContext] = useState({
        isAdmin: false,
        chatId: null
    });

    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showUnblockDialog, setShowUnblockDialog] = useState(false);

    const [blockedStatus, setBlockedStatus] = useState({
        isBlocked: false,
        blockedByUser: false,
        blockedByProvider: false,
        message: ""
    });

    const [blockedProviders, setBlockedProviders] = useState([]);

    useEffect(() => {
        if (notificationData) {
            let newMessage = {
                sender_details: { id: notificationData.sender_id },
                timestamp: new Date().toISOString() // Add a timestamp if not provided in the notification
            };

            // Handle text message
            if (notificationData.message) {
                newMessage.message = notificationData.message;
            }

            // Handle file
            if (notificationData.file) {
                let parsedFile;
                if (typeof notificationData.file === 'string') {
                    try {
                        parsedFile = JSON.parse(notificationData.file);
                    } catch (error) {
                        console.error('Error parsing file data:', error);
                        parsedFile = [];
                    }
                } else {
                    parsedFile = notificationData.file;
                }

                // Flatten the nested array
                const flattenedFiles = parsedFile.flat();

                newMessage.file = flattenedFiles.map(file => ({
                    file: file.file || file.url,
                    file_name: file.file_name || file.name,
                    file_type: file.file_type || file.type
                }));
            }

            setChatMessages(prevMessages => [newMessage, ...prevMessages]);
            scrollToBottom();
        }
    }, [notificationData])

    const handleOpenLightbox = useCallback((index, images) => {
        setCurrentImages(images?.map(img => ({
            src: img.file,
            alt: img.file_name,
            type: img.file_type
        })));
        setCurrentImageIndex(index);
        setIsLightboxOpen(true);
    }, []);

    const handleCloseLightbox = useCallback(() => {
        setIsLightboxOpen(false);
    }, []);

    const helperStateData = useSelector(selectHelperState)

    const newChat = helperStateData?.chatData;

    const handleChangeTab = (e, chat) => {
        e.preventDefault();

        // Reset states first
        setOffset(0);
        setHasMore(true);
        setChatMessages([]);
        setIsLoading(true);
        setIsAdmin(false);

        // Create unique key for the new chat
        const uniqueId = chat.booking_id
            ? `${chat.partner_id}_${chat.booking_id}`
            : `${chat.partner_id}_pre`;

        // Update local state
        setSelectedChatTab(chat);

        // Update Redux state
        dispatch({
            type: 'chatUI/setIsAdmin',
            payload: false
        });

        dispatch({
            type: 'chatUI/setSelectedChat',
            payload: {
                ...chat,
                uniqueId
            }
        });

        dispatch({
            type: 'chatUI/setSelectedChatId',
            payload: uniqueId
        });

        if (mobileView) {
            setChatStep('chat');
            dispatch({
                type: 'chatUI/setChatStep',
                payload: 'chat'
            });
        }

        // Force fetch messages immediately
        fetchChatMessages(chat, 0, false);
    };

    const handleBackToList = () => {
        setChatStep('list');
        dispatch({
            type: 'chatUI/setChatStep',
            payload: 'list'
        });
        dispatch({
            type: 'chatUI/setSelectedChatId',
            payload: null
        });
        dispatch({
            type: 'chatUI/setSelectedChat',
            payload: null
        });
    };

    const handleFileAttachment = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            const fileSizeInMB = file.size / (1024 * 1024);
            if (fileSizeInMB > MaxFileSizeInMBCanBeSent) {
                toast.error(`${t("file")} ${file.name} ${t("exceedTheMaximumSizeOf")} ${MaxFileSizeInMBCanBeSent}${t("mb")}.`);
                return false;
            }
            return true;
        });

        if (attachedFiles.length + validFiles.length > MaxFilsOrImagesInOneMessage) {
            toast.error(`${t("youCanOnlyAttachUpTo")} ${MaxFilsOrImagesInOneMessage} ${t("filesOrImagesInOneMessage")}.`);
            validFiles.splice(MaxFilsOrImagesInOneMessage - attachedFiles.length);
        }

        setAttachedFiles(prevFiles => [...prevFiles, ...validFiles]);
    };

    const handleMessageChange = (e) => {
        const newMessage = e.target.value;
        if (newMessage.length <= MaxCharactersInTextMessage) {
            setMessage(newMessage);

            // Auto-resize textarea based on content with better height control
            if (e.target && e.target.tagName && e.target.tagName.toLowerCase() === 'textarea') {
                // Reset to standard height first to measure content accurately
                e.target.style.height = '40px';

                // Check if content requires more lines or has line breaks
                const hasLineBreaks = newMessage.includes('\n');
                const needsExpansion = e.target.scrollHeight > 40 || hasLineBreaks;

                if (needsExpansion) {
                    // Add expanded class for multi-line content
                    e.target.classList.add('expanded');
                    // Set specific height based on content
                    const contentHeight = Math.min(e.target.scrollHeight, 80);
                    e.target.style.height = contentHeight + 'px';
                } else {
                    // Remove expanded class for single-line appearance
                    e.target.classList.remove('expanded');
                    e.target.style.height = '40px';
                }
            }
        } else {
            toast.error(`${t("messageCannotExceed")} ${MaxCharactersInTextMessage} ${t("characters")}.`);
        }
    };

    const removeAttachedFile = (index) => {
        setAttachedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };
    const isImageFile = (file) => {
        return file.type.startsWith('image/');
    };

    const renderFilePreview = (file, index) => {
        if (isImageFile(file)) {
            return (
                <div key={index} className="file-card image-card relative flex flex-col gap-2 justify-center items-center border border-gray-300 rounded-sm p-1 card_bg">
                    <CustomImageTag src={URL.createObjectURL(file)} alt={file.name} className='w-[160px] h-[100px]' />
                    <span>{file.name}</span>
                    <button onClick={() => removeAttachedFile(index)} className='absolute -top-1 -right-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-full'>
                        <IoMdClose size={14} />
                    </button>
                </div>
            );
        } else {
            return (
                <div key={index} className="file-card relative flex flex-col gap-2 justify-center items-center border border-gray-300 rounded-sm p-1 card_bg">
                    <FaFile size={24} />
                    <span>{file.name}</span>
                    <button onClick={() => removeAttachedFile(index)} className='absolute -top-1 -right-1 bg-gray-200 p-1 rounded-full'>
                        <IoMdClose size={14} />
                    </button>
                </div>
            );
        }
    };

    useEffect(() => {
        if (newChat) {
            // Only set the new chat if there's no currently selected chat
            if (!chatUI.selectedChat) {
                setNewStoredChat(newChat);
                setSelectedChatTab(newChat);
                setIsAdmin(false);
                setChatMessages([]);

                const uniqueId = newChat.booking_id
                    ? `${newChat.partner_id}_${newChat.booking_id}`
                    : `${newChat.partner_id}_pre`;

                dispatch({
                    type: 'chatUI/setSelectedChat',
                    payload: {
                        ...newChat,
                        uniqueId
                    }
                });

                dispatch({
                    type: 'chatUI/setSelectedChatId',
                    payload: uniqueId
                });

                setChatStep('chat');
                dispatch({
                    type: 'chatUI/setChatStep',
                    payload: 'chat'
                });
            } else {
                // If there's a selected chat, just store the new chat data
                setNewStoredChat(newChat);
            }
        }
    }, [newChat]);



    const fetchList = async (offset = 0, filter = filterType, isFilterChange = false) => {
        // For pagination, check these conditions
        if (!isFilterChange && (!hasMoreChats || isLoadingMore)) return;

        setIsLoadingMore(true);
        setIsInitialLoading(offset === 0);

        try {
            const response = await fetch_providr_chat_list({
                limit: listLimit.toString(),
                offset: offset.toString(),
                filter_type: filter
            });

            const list = Array.isArray(response?.data) ? response.data : [];

            // Add uniqueId to each chat
            const listWithIds = list.map(chat => ({
                ...chat,
                uniqueId: chat.booking_id
                    ? `${chat.partner_id}_${chat.booking_id}`
                    : `${chat.partner_id}_pre`
            }));

            setChatList(prev => offset === 0 ? listWithIds : [...prev, ...listWithIds]);
            setListOffset(prev => prev + list.length);
            setHasMoreChats(list.length === listLimit);
        } catch (error) {
            console.error('Error fetching chat list:', error);
        } finally {
            setIsLoadingMore(false);
            setIsInitialLoading(false);
        }
    };

    const handleFilterChange = (newFilter) => {
        // Reset only necessary states
        setListOffset(0);
        setHasMoreChats(true);
        setChatMessages([]);
        setSelectedChatTab(null);

        // Reset selected chat in Redux
        dispatch({
            type: 'chatUI/setSelectedChat',
            payload: null
        });
        dispatch({
            type: 'chatUI/setSelectedChatId',
            payload: null
        });

        // If in mobile view, go back to list
        if (mobileView) {
            setChatStep('list');
            dispatch({
                type: 'chatUI/setChatStep',
                payload: 'list'
            });
        }

        // Update filter and fetch new list
        setFilterType(newFilter);
        fetchList(0, newFilter, true); // Added isFilterChange flag
    };

    const fetchChatMessages = async (selectedChat, newOffset = 0, append = false) => {

        // Skip if we're in a transition state or loading
        if (isLoading && !append) {
            return;
        }

        // Create a unique key for this chat context
        const contextKey = isAdmin ? 'admin' : selectedChat ?
            `provider-${selectedChat.partner_id}-${selectedChat.booking_id || 'pre'}` : null;

        // Skip if no valid context
        if (!contextKey) {
            return;
        }

        // Always clear messages first when not appending
        if (!append) {
            setChatMessages([]);
        }

        setIsLoading(true);
        try {
            const payload = {
                limit: msgListLimit.toString(),
                offset: newOffset.toString()
            };

            // Add type parameter based on chat context
            if (isAdmin) {
                payload.type = "0"; // Admin chat type
            } else if (selectedChat) {
                payload.type = "1"; // Provider chat type
                payload.provider_id = selectedChat.partner_id;
                if (selectedChat.booking_id) {
                    payload.booking_id = selectedChat.booking_id;
                }
            }
            const response = await fetch_chat_history(payload);

            // Validate we're still in the same context
            const currentContextKey = isAdmin ? 'admin' : selectedChat ?
                `provider-${selectedChat.partner_id}-${selectedChat.booking_id || 'pre'}` : null;

            if (contextKey !== currentContextKey) {

                return;
            }

            // Handle blocking status first
            if (!isAdmin && response) {
                const isBlocked = response.is_blocked === 1;
                const isBlockedByUser = response.is_block_by_user === 1;
                const isBlockedByProvider = response.is_block_by_provider === 1;

                setIsBlocked(isBlocked);
                setBlockedStatus({
                    isBlocked: isBlocked,
                    blockedByUser: isBlockedByUser,
                    blockedByProvider: isBlockedByProvider,
                    message: isBlockedByUser
                        ? t("youHaveBlockedThisProvider")
                        : isBlockedByProvider
                            ? t("providerHasBlockedYou")
                            : ""
                });
            }

            const messages = response?.data || [];

            if (messages.length < msgListLimit) {
                setHasMore(false);
            }

            if (append) {
                setChatMessages(prevMessages => [...prevMessages, ...messages]);
            } else {
                setChatMessages(messages);
            }

            setOffset(newOffset);

            // Scroll to bottom after a small delay for rendering
            setTimeout(scrollToBottom, 50);
        } catch (error) {
            console.error('Error fetching chat messages:', error);
            if (!append) {
                setChatMessages([]);
            }
            toast.error(t("errorFetchingMessages"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleScroll = (e) => {
        const { scrollTop } = e.currentTarget;
        if (scrollTop === 0 && !isLoading && hasMore) {
            fetchChatMessages(selectedChatTab, offset + 1, true);
        }
    };

    // This is only for the initial fetch when mounting the component
    // or when explicitly selecting a chat tab through UI
    useEffect(() => {
        // Skip if we're being managed by context tracking now
        if (prevChatContext.chatId || prevChatContext.isAdmin) {
            return;
        }

        if (selectedChatTab || isAdmin) {
            // Reset pagination and loading state
            setOffset(0);
            setHasMore(true);

            // Immediately clear messages before API call returns
            setChatMessages([]);

            // Set a small timeout to ensure state update happens before fetch
            setTimeout(() => {
                fetchChatMessages(selectedChatTab, 0, false);
            }, 50);
        }
    }, [selectedChatTab, isAdmin]);

    const handleChatListScroll = () => {
        if (chatListRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatListRef.current;
            if (scrollHeight - scrollTop <= clientHeight * 1.5 && !isLoadingMore && hasMoreChats) {
                fetchList(listOffset, filterType, false); // Normal pagination
            }
        }
    };

    useEffect(() => {
        fetchList();
    }, []); // Fetch initial chat list on component mount

    const renderMessage = (message) => {
        const TextMessages = message && message.message;
        let files;

        if (typeof message?.file === 'string') {
            try {
                files = JSON.parse(message.file);
            } catch (error) {
                console.error('Error parsing file string:', error);
                files = [];
            }
        } else if (Array.isArray(message?.file)) {
            files = message.file;
        } else {
            files = [];
        }

        const FileMessages = files.length > 0;
        const TextAndFiles = TextMessages && FileMessages;

        const imageFiles = Array.isArray(files) ? files.filter(file =>
            file.file_type === 'image/jpeg' ||
            file.file_type === 'image/png' ||
            file.file_type === 'image/jpg' ||
            file.file_type === 'image/svg+xml'
        ) : [];

        if (TextAndFiles) {
            return (
                <div className={`flex flex-col w-full ${(userData?.id === message?.sender_id || userData?.id === message?.sender_details?.id) ? 'justify-end items-end' : 'justify-start items-start'}`}>
                    <div className={`flex flex-col gap-1 ${(userData?.id === message?.sender_id || userData?.id === message?.sender_details?.id) ? 'justify-end items-end' : ''}`}>
                        {
                            message.message.trim() !== '' &&
                            <p className={`px-6 py-2 max-w-[230px] sm:max-w-[370px] xl:max-w-[440px] my-1 whitespace-pre-line break-words message
                            ${(userData?.id === message?.sender_id || userData?.id === message?.sender_details?.id) ? 'primary_bg_color text-white' : 'bg-[#F2F1F6] text-black'} 
                            `}>
                                {message.message}
                            </p>
                        }
                    </div>
                    {renderImageFiles(imageFiles && imageFiles)}
                    {renderNonImageFiles(files, imageFiles && imageFiles)}
                    <span className='text-[12px] description_color mb-2'>
                        {formatTimeDifference(message.created_at)}
                    </span>
                </div>
            );
        } else if (TextMessages) {
            return (
                <div className={`flex flex-col w-full ${(userData?.id === message?.sender_id || userData?.id === message?.sender_details?.id) ? 'justify-end items-end' : 'justify-start items-start'}`}>
                    <div className={`flex flex-col gap-1 ${(userData?.id === message?.sender_id || userData?.id === message?.sender_details?.id) ? 'justify-end items-end' : 'justify-start items-start'}`}>
                        {
                            message.message.trim() !== '' &&
                            <p className={`px-6 py-2 max-w-[230px] sm:max-w-[370px] xl:max-w-[440px] whitespace-pre-line break-words message ${(userData?.id === message?.sender_id || userData?.id === message?.sender_details?.id) ? 'primary_bg_color text-white' : 'bg-[#F2F1F6] text-black'} my-1`}>
                                {message.message}
                            </p>
                        }
                        <span className='text-[12px] description_color mb-2'>
                            {formatTimeDifference(message.created_at)}
                        </span>
                    </div>
                </div>
            );
        } else if (FileMessages) {
            return (
                <div className={`flex flex-col w-full  ${(userData?.id === message?.sender_id || userData?.id === message?.sender_details?.id) ? 'justify-end items-end' : 'justify-start items-start'}`}>
                    <div className={`flex flex-col gap-1 ${(userData?.id === message?.sender_id || userData?.id === message?.sender_details?.id) ? 'justify-end items-end' : ''}`}>
                        {renderImageFiles(imageFiles)}
                        {renderNonImageFiles(files, imageFiles)}
                        <span className='text-[12px] description_color mb-2'>
                            {formatTimeDifference(message.created_at)}
                        </span>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    };

    const renderImageFiles = (imageFiles) => {
        return (
            <>
                <div className='flex items-center justify-end gap-2 flex-wrap w-[70%] mb-1'>
                    {imageFiles.slice(0, 4).map((file, index) => {
                        return <div key={index} onClick={() => handleOpenLightbox(index, imageFiles)} className='cursor-pointer'>
                            {file.file_type === 'image/svg+xml' ? (
                                <CustomImageTag
                                    src={file.file}
                                    alt={file.file_name}
                                    className="image-item svg-item w-[160px] h-[100px] border rounded-sm object-fill"
                                />
                            ) : (
                                <CustomImageTag
                                    src={file.file}
                                    alt={file.file_name}
                                    className="image-item w-[160px] h-[100px] border rounded-sm"
                                />
                            )}
                        </div>
                    })}
                    {
                        imageFiles?.length > 5 &&
                        <div className='relative'>
                            <div className='absolute top-0 left-0 right-0 bottom-0 m-auto h-full w-full flex items-center justify-center bg-[#00000066] cursor-pointer' onClick={() => handleOpenLightbox(0, imageFiles)}>
                                <h4 className='text-white font-[600] text-2xl'>+{imageFiles?.length - 5}</h4>
                            </div>
                            <CustomImageTag src={imageFiles[5]} alt={imageFiles[5].name} className='w-[160px] h-[100px]' />
                        </div>
                    }
                </div>
            </>
        );
    };

    const renderNonImageFiles = (allFiles, imageFiles) => {
        const downloadFile = (fileUrl, fileName) => {
            var fileDownload = require('js-file-download');
            fileDownload(fileUrl, fileName);
        };

        // Ensure files is an array
        if (!Array.isArray(allFiles)) {
            console.error('Files is not an array:', allFiles);
            return null;
        }

        // Filter out empty objects and files that are in imageFiles
        const validFiles = allFiles.filter(file =>
            file &&
            Object.keys(file).length > 0 &&
            file.file &&
            file.file_name &&
            !imageFiles.includes(file)
        );

        return validFiles.length > 0 ? validFiles.map((file, index) => (
            file.file_type === 'video/mp4' ? (
                <div key={index} className="file-item py-2 flex items-center flex-col gap-1 mb-1">
                    <video controls className='w-[310px] rounded-sm'>
                        <source src={file.file} type="video/mp4" />
                        {t("yourBrowserDoesNotSupport")}
                    </video>
                    <span className="file-info px-2 text-[14px] sm:text-[16px]">{file.file_name}</span>
                </div>
            ) : (
                <button key={index} className="file-item p-2 flex items-center gap-1" onClick={() => downloadFile(file.file, file.file_name)}>
                    <div className="file-info text-[14px] sm:text-[16px]">
                        {file.file_name}
                    </div>
                    <span className="download-button">
                        <IoMdDownload />
                    </span>
                </button>
            )
        )) : null;
    };

    const formatTimeDifference = (timestamp) => {
        const now = moment();
        const messageTime = moment(timestamp);
        const diffInSeconds = now.diff(messageTime, 'seconds');
        const diffInHours = now.diff(messageTime, 'hours');

        if (diffInSeconds < 1) {
            return `1s ${t("ago")}`;
        } else if (diffInSeconds < 60) {
            return `${diffInSeconds}s ${t("ago")}`;
        } else if (diffInSeconds < 3600) {
            return `${Math.floor(diffInSeconds / 60)}m ${t("ago")}`;
        } else if (diffInHours < 12) {
            return `${Math.floor(diffInSeconds / 3600)}h ago`;
        } else if (diffInHours < 24 && now.isSame(messageTime, 'day')) {
            return `${t("todayAt")} ${messageTime.format('h:mm A')}`;
        } else if (diffInHours < 48 && now.isSame(messageTime.add(1, 'day'), 'day')) {
            return `${t("yesterdayAt")} ${messageTime.format('h:mm A')}`;
        } else {
            return messageTime.format('MM/DD/YYYY');
        }
    };

    const handleAdminChat = () => {

        // Reset states first
        setOffset(0);
        setHasMore(true);
        setChatMessages([]);
        setIsLoading(true);

        // Important: Set admin state before API call
        setIsAdmin(true);

        // Update Redux state
        dispatch({
            type: 'chatUI/setIsAdmin',
            payload: true
        });
        dispatch({
            type: 'chatUI/setSelectedChat',
            payload: null
        });
        dispatch({
            type: 'chatUI/setSelectedChatId',
            payload: null
        });

        if (mobileView) {
            setChatStep('chat');
            dispatch({
                type: 'chatUI/setChatStep',
                payload: 'chat'
            });
        }

        // Force fetch admin messages immediately with type 0
        const adminPayload = {
            type: "0",
            limit: msgListLimit.toString(),
            offset: "0"
        };


        // Direct API call for admin chat
        fetch_chat_history(adminPayload)
            .then(response => {
                // Check if response has data array and it's not empty
                if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
                    setChatMessages(response.data);
                    setHasMore(response.data.length === msgListLimit);
                } else {
                    // If no messages or empty array, set empty array to show pre-fill questions
                    setChatMessages([]);
                }
            })
            .catch(error => {
                console.error('Error fetching admin chat:', error);
                toast.error(t("errorFetchingMessages"));
                // On error, set empty array to show pre-fill questions
                setChatMessages([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const appendNewChat = (newChat) => {
        // If in admin mode, don't change anything
        if (isAdmin) return;

        // Determine the correct filter type for the new chat
        const isPostBooking = newChat.booking_id !== null;
        const correctFilterType = isPostBooking ? 'booking' : 'pre_booking';

        // If we're in the wrong filter type, switch to the correct one
        if (filterType !== correctFilterType) {
            setFilterType(correctFilterType);
            // Fetch the list with the new filter type
            fetchList(0, correctFilterType, true);
        }

        setChatList(prevChatList => {
            // Create unique ID for the new chat
            const uniqueId = newChat.booking_id
                ? `${newChat.partner_id}_${newChat.booking_id}`
                : `${newChat.partner_id}_pre`;

            const chatWithUniqueId = {
                ...newChat,
                uniqueId
            };

            // Update selected chat state
            setSelectedChatTab(chatWithUniqueId);

            // Update Redux state
            dispatch({
                type: 'chatUI/setSelectedChat',
                payload: chatWithUniqueId
            });
            dispatch({
                type: 'chatUI/setSelectedChatId',
                payload: uniqueId
            });

            if (mobileView) {
                setChatStep('chat');
                dispatch({
                    type: 'chatUI/setChatStep',
                    payload: 'chat'
                });
            }

            // Find if chat already exists
            const existingChatIndex = prevChatList.findIndex(chat => {
                if (newChat.booking_id !== null) {
                    return chat.partner_id === newChat.partner_id &&
                        chat.booking_id === newChat.booking_id;
                } else {
                    return chat.partner_id === newChat.partner_id &&
                        chat.booking_id === null;
                }
            });

            // If chat exists, update it
            if (existingChatIndex !== -1) {
                const updatedList = [...prevChatList];
                updatedList[existingChatIndex] = chatWithUniqueId;
                return updatedList;
            }

            // If chat doesn't exist, add it to the beginning
            return [chatWithUniqueId, ...prevChatList];
        });
    };

    // Add a new useEffect for initial data loading
    useEffect(() => {
        // First fetch the chat list
        fetchList();
    }, []); // Only run once on mount

    // Update the useEffect for chat context changes
    useEffect(() => {

        const currentChatKey = isAdmin ? 'admin' : selectedChatTab ?
            `provider-${selectedChatTab.partner_id}-${selectedChatTab.booking_id || 'pre'}` : null;

        // Skip if no valid context
        if (!currentChatKey) {
            return;
        }

        // Skip if it's the same context and we already have messages
        if (currentChatKey === prevChatContext.chatId && chatMessages.length > 0) {
            return;
        }

        // Reset states
        setOffset(0);
        setHasMore(true);

        // Only clear messages if switching to a different chat
        if (currentChatKey !== prevChatContext.chatId) {
            setChatMessages([]);
            setIsLoading(true);
        }

        // Update context tracking
        setPrevChatContext({
            isAdmin,
            chatId: currentChatKey
        });

        // Fetch messages immediately
        if (isAdmin) {
            handleAdminChat();
        } else {
            fetchChatMessages(selectedChatTab, 0, false);
        }
    }, [isAdmin, selectedChatTab]);

    // Add a cleanup effect
    useEffect(() => {
        return () => {
            // Reset all states when component unmounts
            setChatMessages([]);
            setOffset(0);
            setHasMore(true);
            setIsLoading(false);
            setPrevChatContext({
                isAdmin: false,
                chatId: null
            });
        };
    }, []);

    // Update UI when chat view changes 
    useEffect(() => {
        if (chatStep === 'chat') {
            // When showing chat view, scroll to bottom after a brief delay
            setTimeout(() => {
                scrollToBottom();
            }, 150);
        }
    }, [chatStep]);

    // Enhanced scroll to bottom to handle different chat views
    const scrollToBottom = () => {
        const chatScreens = document.querySelectorAll('.chat_messages_screen');
        if (chatScreens && chatScreens.length > 0) {
            chatScreens.forEach(screen => {
                screen.scrollTop = screen.scrollHeight;
            });
        }
    };

    // Ensure scroll happens after messages update
    useEffect(() => {
        if (chatMessages.length > 0) {
            // Use a small timeout to ensure DOM is updated
            setTimeout(scrollToBottom, 50);
        }
    }, [chatMessages]);

    // Add an initialization effect to set up initial state from Redux
    useEffect(() => {
        // Initialize states from Redux on component mount
        setIsAdmin(chatUI.isAdmin);
        setChatStep(chatUI.chatStep);

        // Check mobile view
        const checkMobile = () => {
            const isMobileDevice = window.innerWidth < 768;
            setMobileView(isMobileDevice);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, [chatUI.isAdmin, chatUI.chatStep]);

    // Check URL parameters for redirect source and handle initial chat state
    useEffect(() => {
        if (router.isReady) {
            const { source } = router.query;

            // If redirected from another page with source parameter
            if (source === 'redirect' || source === 'profile' || source === 'support') {
                // Force admin chat mode
                setIsAdmin(true);
                setSelectedChatTab(null);
                setChatMessages([]);

                // Update Redux state
                dispatch({
                    type: 'chatUI/setIsAdmin',
                    payload: true
                });

                // Always show chat view on redirect
                setChatStep('chat');
                dispatch({
                    type: 'chatUI/setChatStep',
                    payload: 'chat'
                });

                // Fetch admin messages after a small delay
                setTimeout(() => {
                    fetchChatMessages(null, 0, false);
                }, 150);
            }
        }
    }, [router.isReady, router.query]);

    // Add effect to listen for route changes and reset chat state
    useEffect(() => {
        // Function to handle route change start
        const handleRouteChangeStart = () => {
            // Reset chat messages
            setChatMessages([]);
            setSelectedChatTab(null);
            setMessage('');
            setAttachedFiles([]);

            // Reset Redux state
            dispatch(resetChatUI());
        };

        // Add event listener for route change start
        router.events.on('routeChangeStart', handleRouteChangeStart);

        // Clean up
        return () => {
            router.events.off('routeChangeStart', handleRouteChangeStart);

            // Also reset state when component unmounts
            setChatMessages([]);
            setSelectedChatTab(null);
            setMessage('');
            setAttachedFiles([]);
            dispatch(resetChatUI());
        };
    }, [router.events, dispatch]);

    const handleSend = async (e) => {
        // If an event is passed, prevent default behavior
        if (e) {
            e.preventDefault?.();
        }

        // If this is a direct send from PreBookingQuestions, the message is in e.target.value
        const messageToSend = e?.target?.value || message;

        if (messageToSend.trim() === '' && attachedFiles.length === 0) {
            toast.error(t("pleaseEnterMessageOrAttachFile"));
            return;
        }

        setIsSending(true);

        const newMessage = {
            message: messageToSend,
            file: attachedFiles.map(file => ({
                file: URL.createObjectURL(file),
                file_name: file.name,
                file_type: file.type
            })),
            sender_details: { id: userData?.id },
            sender_id: userData?.id
        };

        try {
            let receiverId = selectedChatTab?.partner_id;
            let bookingId = selectedChatTab?.booking_id ? selectedChatTab?.booking_id : null;
            let receiverType = isAdmin ? "0" : "1";

            // If in admin chat, use appropriate params
            if (isAdmin) {
                receiverId = null; // Admin chat may not need a specific receiver
                bookingId = null;
            }

            const response = await send_chat_message({
                receiver_id: receiverId,
                booking_id: bookingId,
                receiver_type: receiverType,
                message: messageToSend,
                attachment: attachedFiles,
            });

            // Update chat messages
            setChatMessages(prevMessages => [newMessage, ...prevMessages]);
            setMessage('');
            setAttachedFiles([]);

            // Reset textarea height
            const textareas = document.querySelectorAll('textarea.input-like');
            textareas.forEach(textarea => {
                textarea.style.height = '40px';
                textarea.classList.remove('expanded');
            });

            scrollToBottom();

            // Only update chat list if not in admin mode
            if (!isAdmin && newStoredChat) {
                if (newStoredChat.booking_id !== null || selectedChatTab?.booking_id !== null) {
                    // If either has a booking_id, compare booking_ids
                    if (newStoredChat.booking_id === selectedChatTab?.booking_id) {
                        // Update the chat list and select the new chat
                        appendNewChat(newStoredChat);
                    } else {
                        getChatData(null);
                    }
                }
                else {
                    // If both booking_ids are null, compare partner_ids
                    if (newStoredChat.partner_id === selectedChatTab?.partner_id) {
                        // Update the chat list and select the new chat
                        appendNewChat(newStoredChat);
                    } else {
                        getChatData(null);
                    }
                }
            }

        } catch (error) {
            console.log('error', error);
            toast.error(t('failedToSendMessage'));
        } finally {
            setIsSending(false);
        }
    };

    // Chat actions handlers
    const handleBlock = () => {
        setShowReportModal(true);
    };

    const handleUnblock = () => {
        setShowUnblockDialog(true);
    };

    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    const handleReportSubmit = async (data) => {
        try {
            const response = await blockUserApi({
                partner_id: selectedChatTab?.partner_id,
                reason_id: data.reason_id,
                additional_info: data.additional_info
            });

            if (response?.error === false) {
                // Update blocked status immediately
                setBlockedStatus({
                    isBlocked: true,
                    blockedByUser: true,
                    blockedByProvider: false,
                    message: t("youHaveBlockedThisProvider")
                });
                setIsBlocked(true);

                // Add to blocked providers list
                setBlockedProviders(prev => [
                    ...prev,
                    {
                        partner_id: selectedChatTab?.partner_id,
                        name: selectedChatTab?.partner_name,
                        image: selectedChatTab?.image,
                        reason: data.additional_info
                    }
                ]);

                setShowReportModal(false);
                toast.success(t("providerBlocked"));

                // If there are no messages, create an empty state to trigger UI update
                if (chatMessages.length === 0) {
                    setChatMessages([]);
                } else {
                    // If there are messages, refresh them
                    fetchChatMessages(selectedChatTab, 0, false);
                }
            } else {
                toast.error(response?.message || t("errorBlockingProvider"));
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            toast.error(t("errorBlockingProvider"));
        }
    };

    const handleUnblockConfirm = async () => {
        try {
            const response = await unblockUserApi({
                partner_id: selectedChatTab?.partner_id
            });

            if (response?.error === false) {
                setBlockedStatus({
                    isBlocked: response?.data?.is_blocked === 1,
                    blockedByUser: response?.data?.is_block_by_user === 1,
                    blockedByProvider: response?.data?.is_block_by_provider === 1,
                    message: response?.data?.is_block_by_provider === 1
                        ? t("providerHasBlockedYou")
                        : response?.data?.is_block_by_user === 1
                            ? t("youHaveBlockedThisProvider")
                            : ""
                });
                setShowUnblockDialog(false);
                toast.success(t("providerUnblocked"));

                // Stay in chat view, just refresh messages
                fetchChatMessages(selectedChatTab, 0, false);
            } else {
                toast.error(response?.message || t("errorUnblockingProvider"));
            }
        } catch (error) {
            console.error('Error unblocking provider:', error);
            toast.error(t("errorUnblockingProvider"));
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await deleteChatUserApi({
                partner_id: selectedChatTab?.partner_id,
                booking_id: selectedChatTab?.booking_id
            });

            if (response?.error === false) {
                // Clear chat messages and reset states
                setChatMessages([]);
                setMessage('');
                setAttachedFiles([]);

                // Remove chat from chatList based on both partner_id and booking_id
                setChatList(prevList =>
                    prevList.filter(chat => {
                        if (selectedChatTab?.booking_id) {
                            // For post-booking chats, match both partner_id and booking_id
                            return !(chat.partner_id === selectedChatTab.partner_id && 
                                   chat.booking_id === selectedChatTab.booking_id);
                        } else {
                            // For pre-booking chats, match partner_id and ensure it's also a pre-booking chat
                            return !(chat.partner_id === selectedChatTab.partner_id && 
                                   chat.booking_id === null);
                        }
                    })
                );

                // Close dialog
                setShowDeleteDialog(false);

                // Reset selected chat in Redux
                dispatch({
                    type: 'chatUI/setSelectedChat',
                    payload: null
                });
                dispatch({
                    type: 'chatUI/setSelectedChatId',
                    payload: null
                });

                // Only redirect to list view on delete action
                if (mobileView) {
                    setChatStep('list');
                    dispatch({
                        type: 'chatUI/setChatStep',
                        payload: 'list'
                    });
                }

                toast.success(t("messagesDeletedSuccessfully"));
            } else {
                toast.error(response?.message || t("errorDeletingMessages"));
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
            toast.error(t("errorDeletingMessages"));
        }
    };

    // Initialize from Redux state on mount
    useEffect(() => {
        if (chatUI.selectedChat) {
            setSelectedChatTab(chatUI.selectedChat);
            setIsAdmin(chatUI.isAdmin);
            setChatStep(chatUI.chatStep);

            // Fetch messages for the selected chat after a small delay
            setTimeout(() => {
                fetchChatMessages(chatUI.selectedChat, 0, false);
            }, 150);
        }
    }, []);

    const handleGetBlockedProviders = async () => {
        try {
            const response = await getBlockedProvidersApi();
            if (response?.error === false && Array.isArray(response?.data)) {
                setBlockedProviders(response.data);
            }
        } catch (error) {
            console.error("Error in getBlockedProviders:", error);
            toast.error(t("errorFetchingBlockedProviders"));
        }
    };

    const handleUnblockProvider = async (provider) => {
        try {
            const response = await unblockUserApi({
                partner_id: provider.id
            });

            if (response?.error === false) {
                // Remove provider from blocked list
                setBlockedProviders(prev => prev.filter(p => p.partner_id !== provider.partner_id));

                // Update block status if this is the currently selected chat
                if (selectedChatTab?.partner_id === provider.partner_id) {
                    setBlockedStatus({
                        isBlocked: false,
                        blockedByUser: false,
                        blockedByProvider: false,
                        message: ""
                    });
                }

                toast.success(t("providerUnblocked"));

                // Refresh messages if this is the current chat
                if (selectedChatTab?.partner_id === provider.partner_id) {
                    fetchChatMessages(selectedChatTab, 0, false);
                }
            } else {
                toast.error(response?.message || t("errorUnblockingProvider"));
            }
        } catch (error) {
            console.error('Error unblocking provider:', error);
            toast.error(t("errorUnblockingProvider"));
        }
    };

    return (
        <Layout>
            <BreadCrumb firstEle={t("chats")} firstEleLink="/chats" isMobile={isMobile} />

            <section className='container mb-0 md:mb-20'>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-3 hidden md:block">
                        <SideNavigation />
                    </div>
                    <div className='lg:col-span-9'>
                        <div className='flex flex-col md:flex-row border mx-auto rounded-lg'>
                            {/* Only show ChatList if not in admin chat mode */}
                            {(!mobileView || (mobileView && chatStep === 'list')) && 
                             !isAdmin && 
                             router.query.source !== 'support' && (
                                <ChatList
                                    isAdmin={isAdmin}
                                    chatListRef={chatListRef}
                                    handleChatListScroll={handleChatListScroll}
                                    chatList={chatList}
                                    handleAdminChat={handleAdminChat}
                                    selectedChatTab={selectedChatTab}
                                    handleChangeTab={handleChangeTab}
                                    isLoadingMore={isLoadingMore}
                                    onFilterChange={handleFilterChange}
                                    filterType={filterType}
                                    isLoading={isInitialLoading}
                                    blockedProviders={blockedProviders}
                                    onUnblockProvider={handleUnblockProvider}
                                    onGetBlockedProviders={handleGetBlockedProviders}
                                    setBlockedStatus={setBlockedStatus}
                                    fetchChatMessages={fetchChatMessages}
                                />
                            )}

                            {/* Show AdminChat component when in support mode or regular chat view */}
                            {(!mobileView || (mobileView && chatStep === 'chat')) && (
                                isAdmin ? (
                                    <AdminChat
                                        key="admin-chat-component"
                                        isLoading={isLoading}
                                        handleScroll={handleScroll}
                                        chatMessages={chatMessages}
                                        attachedFiles={attachedFiles}
                                        handleFileAttachment={handleFileAttachment}
                                        message={message}
                                        handleMessageChange={handleMessageChange}
                                        MaxCharactersInTextMessage={MaxCharactersInTextMessage}
                                        handleSend={handleSend}
                                        isSending={isSending}
                                        userData={userData}
                                        renderMessage={renderMessage}
                                        renderFilePreview={renderFilePreview}
                                        className="w-full" // Added full width for admin chat
                                    />
                                ) : (
                                    <ProviderChat
                                        key={`provider-chat-${selectedChatTab?.partner_id}-${selectedChatTab?.booking_id || 'pre'}`}
                                        handleScroll={handleScroll}
                                        isLoading={isLoading}
                                        chatMessages={chatMessages}
                                        attachedFiles={attachedFiles}
                                        handleFileAttachment={handleFileAttachment}
                                        message={message}
                                        handleMessageChange={handleMessageChange}
                                        MaxCharactersInTextMessage={MaxCharactersInTextMessage}
                                        handleSend={handleSend}
                                        isSending={isSending}
                                        userData={userData}
                                        renderMessage={renderMessage}
                                        selectedChatTab={selectedChatTab}
                                        renderFilePreview={renderFilePreview}
                                        chatList={chatList}
                                        handleOpenLightbox={handleOpenLightbox}
                                        hasMore={hasMore}
                                        setMessage={setMessage}
                                        isBlocked={isBlocked}
                                        setChatMessages={setChatMessages}
                                        setChatList={setChatList}
                                        blockedStatus={blockedStatus}
                                        setBlockedStatus={setBlockedStatus}
                                        onBlock={handleBlock}
                                        onUnblock={handleUnblock}
                                        onDelete={handleDelete}
                                        mobileView={mobileView}
                                        handleBackToList={handleBackToList}
                                    />
                                )
                            )}
                        </div>
                    </div>
                </div>

                {isLightboxOpen && (
                    <Lightbox
                        isLightboxOpen={isLightboxOpen}
                        images={currentImages}
                        initialIndex={currentImageIndex}
                        onClose={handleCloseLightbox}
                    />
                )}

                <ReportReasonModal
                    isOpen={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    onSubmit={handleReportSubmit}
                />

                <DeleteChatDialog
                    isOpen={showDeleteDialog}
                    onClose={() => setShowDeleteDialog(false)}
                    onConfirm={handleDeleteConfirm}
                />

                <UnblockDialog
                    isOpen={showUnblockDialog}
                    onClose={() => setShowUnblockDialog(false)}
                    onConfirm={handleUnblockConfirm}
                />
            </section>
        </Layout>
    );
}

export default withAuth(ChatPage)