// import React, { useEffect, useState } from "react";
// import { apiGetDispatcherLog } from "../../../../../../services/DispatcherService";
// import Button from "../../../../../../components/ui/Button/Button";
// import AppLogoLoader from "../../../../../../components/shared/AppLogoLoader";

// const ViewLogModel = ({ dispatcher, setIsOpen }) => {
//     const [logs, setLogs] = useState([]);
//     const [loading, setLoading] = useState(false);

//     const today = new Date().toISOString().split("T")[0];

//     const fetchLogs = async () => {
//         if (!dispatcher?.id) return;

//         try {
//             setLoading(true);
//             const response = await apiGetDispatcherLog({
//                 dispatcher_id: dispatcher.id,
//                 date: today,
//             });

//             setLogs(response?.data?.logs ?? []);
//         } catch (error) {
//             console.error("Error fetching logs:", error);
//             setLogs([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchLogs();
//     }, [dispatcher]);

//     return (
//         <div>
//             <div className="text-xl sm:text-2xl lg:text-[26px] leading-7 sm:leading-8 lg:leading-9 font-semibold text-[#252525] mb-4 sm:mb-6 lg:mb-7 sm:max-w-[85%] lg:max-w-[75%] w-full">
//                 <p>{dispatcher?.name}</p>
//             </div>
//             <div className="flex flex-col gap-3 mb-3">
//                 {logs.map((log) => (
//                     <div
//                         key={log.id}
//                         className="bg-gray-100 rounded-[15px] p-4 gap-2 flex items-center justify-between hover:shadow-md overflow-x-auto"
//                     >

//                         <div className="flex items-center gap-3">
//                             <div className="w-60">
//                                 <p className="font-semibold text-xl">{log.type}</p>
//                             </div>
//                         </div>
//                         <div>
//                             <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-200 text-left whitespace-nowrap w-[175px]">
//                                 <p className="text-xs text-center text-[#6C6C6C]">Date-Time</p>
//                                 <p className="text-[#333333] text-center font-semibold text-sm">{log.datetime} </p>
//                             </div>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-end">
//                 <Button
//                     btnSize="md"
//                     type="filledGray"
//                     className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
//                     onClick={() => setIsOpen({ isOpen: false })}

//                 >
//                     <span>Close</span>
//                 </Button>

//             </div>
//         </div>
//     );
// };

// export default ViewLogModel;

import React, { useEffect, useState } from "react";
import { apiGetDispatcherLog } from "../../../../../../services/DispatcherService";
import Button from "../../../../../../components/ui/Button/Button";
import AppLogoLoader from "../../../../../../components/shared/AppLogoLoader";

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
        <div className="w-full w-[520px] max-w-[520px] mx-auto">
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

            {/* STATS */}
            {/* <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#F0F1FF] rounded-xl p-4">
                    <p className="text-xl font-bold">{logs.length}</p>
                    <p className="text-sm text-gray-600">Total Logs</p>
                </div>
                <div className="bg-[#F0F1FF] rounded-xl p-4">
                    <p className="text-xl font-bold">
                        {logs.filter((l) => l.type === "login").length}
                    </p>
                    <p className="text-sm text-gray-600">Login Count</p>
                </div>
            </div> */}

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
