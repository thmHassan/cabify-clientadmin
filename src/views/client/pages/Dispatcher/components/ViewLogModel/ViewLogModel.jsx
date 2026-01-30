import { useEffect, useState } from "react";
import { apiGetDispatcherLog } from "../../../../../../services/DispatcherService";
import Button from "../../../../../../components/ui/Button/Button";

const ViewLogModel = ({ dispatcher, setIsOpen }) => {
    const today = new Date().toISOString().split("T")[0];

    const [selectedDate, setSelectedDate] = useState(today);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchLogs = async (date) => {
        if (!dispatcher?.id) return;

        try {
            setLoading(true);
            const response = await apiGetDispatcherLog({
                dispatcher_id: dispatcher.id,
                date,
            });

            setLogs(response?.data?.logs ?? []);
        } catch (error) {
            console.error("Error fetching logs:", error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(selectedDate);
    }, [dispatcher, selectedDate]);

    return (
        <div className="w-[520px] max-w-[520px] mx-auto">
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-4">
                <div>
                    <p className="text-lg font-semibold">{dispatcher?.name}</p>
                    <p className="text-sm text-gray-500">{dispatcher?.email}</p>
                </div>
            </div>

            {/* DATE PICKER */}
            <div className="mb-4">
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* LOG LIST */}
            <div className="bg-[#F0F1FF] rounded-xl p-4 mb-5">
                <p className="font-semibold mb-3">Login - Logout</p>
                <div className="flex flex-col gap-2">
                    {logs.map((log) => (
                        <p key={log.id} className="text-sm">
                            {new Date(log.datetime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}{" "}
                            ({log.type})
                        </p>
                    ))}
                </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end">
                <Button
                    type="filledGray"
                    className="px-8 py-3 rounded-lg"
                    onClick={() => setIsOpen({ isOpen: false })}
                >
                    Close
                </Button>
            </div>
        </div>
    );
};

export default ViewLogModel;
