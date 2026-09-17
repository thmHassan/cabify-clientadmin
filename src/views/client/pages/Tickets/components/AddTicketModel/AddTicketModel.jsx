import React, { useEffect, useRef, useState } from "react";
import { apiReplyTicket } from "../../../../../../services/TicketsServices";
import Button from "../../../../../../components/ui/Button/Button";
import { useTimezoneFormatting } from "../../../../../../utils/timezoneUtils";
import { getTenantData } from "../../../../../../utils/functions/tokenEncryption";
import { getTicketCreatorInfo } from "../TicketUserDetailModal";

const getClientAdminInfo = () => {
    try {
        const authUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
        const tenantData = getTenantData() || {};

        return {
            id: authUser?.id || tenantData?.company_id || "",
            name: authUser?.name || tenantData?.company_name || "Client Admin",
        };
    } catch (error) {
        return {
            id: "",
            name: "Client Admin",
        };
    }
};
const getReplyTypeLabel = (replyByType) => (
    replyByType === "dispatcher" ? "Dispatcher" : "Client Admin"
);

const getTicketImageUrl = (ticket) => ticket?.image_url || ticket?.image || null;

const AddTicketModel = ({ ticket, onClose, onReplyCreated, onUserClick, typingUser, socket }) => {
    const { formatDateOnly } = useTimezoneFormatting();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const typingTimeoutRef = useRef(null);
    const ticketImageUrl = getTicketImageUrl(ticket);

    const { displayName } = getTicketCreatorInfo(ticket);
    const replies = Array.isArray(ticket.replies) && ticket.replies.length > 0
        ? ticket.replies
        : ticket.reply_message
            ? [{
                message: ticket.reply_message,
                reply_by_type: ticket.reply_by_type,
                reply_by_name: ticket.reply_by_name,
                created_at: ticket.replied_at,
            }]
            : [];

    const emitTyping = (isTyping) => {
        if (!socket || !ticket?.id) return;

        const clientAdmin = getClientAdminInfo();
        socket.emit("ticket-typing", {
            database: socket?.io?.opts?.query?.database,
            ticket_id: ticket.id,
            ticket_reference: ticket.ticket_id,
            is_typing: isTyping,
            actor_type: "client_admin",
            actor_id: clientAdmin.id,
            actor_name: clientAdmin.name,
        });
    };

    const stopTyping = () => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        emitTyping(false);
    };

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            emitTyping(false);
        };
    }, [socket, ticket?.id]);
    const bottomRef = useRef(null);
useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [replies, typingUser]);


    const handleReplySubmit = async () => {
        if (!message.trim()) return alert("Please enter a reply message");

        setLoading(true);

        try {
            const clientAdmin = getClientAdminInfo();
            const formData = new FormData();
            formData.append("ticket_id", ticket.id);
            formData.append("reply_message", message);
            formData.append("reply_by_type", "client_admin");
            formData.append("reply_by_id", clientAdmin.id);
            formData.append("reply_by_name", clientAdmin.name);

            const response = await apiReplyTicket(formData);

            if (response?.data?.success === 1) {
                setMessage("");
                stopTyping();
                onReplyCreated?.(response.data.reply, response.data.reply_count);
            } else {
                alert("Failed to submit reply");
            }

        } catch (error) {
            console.error("Reply API Error:", error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
  <div className="w-full max-w-md bg-white rounded-2xl shadow-lg flex flex-col h-[85vh]">
    
    {/* Header */}
    <div className="p-4 border-b">
      <h2 className="text-lg font-bold text-gray-800">Ticket #{ticket.ticket_id}</h2>
      <p className="text-sm text-gray-500">
        Raised by <button onClick={() => onUserClick?.(ticket)} className="text-blue-600 hover:underline">{displayName}</button>
      </p>
      <p className="text-xs text-gray-400">{formatDateOnly(ticket.created_at)}</p>
    </div>

    {/* Scrollable Messages */}
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
         <div className="self-start bg-blue-100 px-4 py-2 rounded-xl">
                        <p>{ticket.message}</p>
                        {ticketImageUrl && (
                            <a href={ticketImageUrl} target="_blank" rel="noreferrer" className="block mt-3">
                                <img
                                    src={ticketImageUrl}
                                    alt="Ticket attachment"
                                    className="max-h-48 rounded-lg border object-cover"
                                />
                            </a>
                        )}
                    </div>
      {replies.map((reply, index) => (
        <div key={reply.id || index} className="self-end bg-gray-100 px-4 py-2 rounded-xl">
          <p className="text-xs text-gray-500 mb-1">
            {getReplyTypeLabel(reply.reply_by_type)} - {reply.reply_by_name}
          </p>
          <p>{reply.message}</p>
        </div>
      ))}
      {typingUser?.is_typing && (
        <div className="self-start text-sm text-gray-500 italic">
          {typingUser.actor_name || "Dispatcher"} is typing…
        </div>
      )}
      <div ref={bottomRef}></div>
    </div>

    {/* Input + Buttons (Fixed Bottom) */}
    <div className="p-4 border-t flex items-center gap-3">
      <textarea
        className="flex-1 border rounded-xl px-4 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500"
        rows="2"
        placeholder="Write reply..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
                    onClick={() => {
                        stopTyping();
                        onClose();
                    }}
                    className="px-4 py-2 border border-[#1F41BB] text-[#1F41BB] rounded-lg"
                >
                    Close
                </button>
      <Button
        type="filled"
        onClick={handleReplySubmit}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        {loading ? "…" : "Send"}
      </Button>
    </div>
  </div>
</div>

    );
};

export default AddTicketModel;
