import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { useAppSelector } from '../../../../store';
import PageTitle from '../../../../components/ui/PageTitle/PageTitle';
import CustomSelect from '../../../../components/ui/CustomSelect';
import Pagination from '../../../../components/ui/Pagination/Pagination';
import Loading from '../../../../components/shared/Loading/Loading';
import SnapshotCard from '../../../../components/shared/SnapshotCard/SnapshotCard';
import CompaniesIcon from '../../../../components/svg/CompaniesIcon';
import {
  COMPANY_OPTIONS,
  PAGE_SIZE_OPTIONS,
  STATUS_OPTIONS
} from '../../../../constants/selectOptions';
import CardContainer from '../../../../components/shared/CardContainer';
import SearchBar from '../../../../components/shared/SearchBar/SearchBar';
import RevenueStatementsCard from './components/RevenueStatementsCard/RevenueStatementsCard';

const RevenueStatements = () => {
  const [selectedCompany, setSelectedCompany] = useState(
    COMPANY_OPTIONS.find((o) => o.value === "all") ?? COMPANY_OPTIONS[0]
  );

  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [tableLoading, setTableLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const savedPagination = useAppSelector(
    (state) => state?.app?.app?.pagination?.companies
  );

  const DASHBOARD_CARDS = [
    {
      title: "Total Companies",
      value: "25",
      change: "+3 from last hour",
      icon: { component: CompaniesIcon },
      backgroundColor: "#e5f9f0",
      color: "#534CB4",
    },
    {
      title: "Active Companies",
      value: "15",
      change: "+3 from last hour",
       icon: { component: CompaniesIcon },
      backgroundColor: "#e5f9f0",
      color: "#3E9972",
    },
    {
      title: "Monthly Revenue",
      value: "$6,800",
      change: "+3 from last hour",
      icon: { component: CompaniesIcon },
      backgroundColor: "#e5f9f0",
      color: "#C29569",
    },
  ];

  const JOB_SUMMARY = [
    {
      title: 'Total Jobs',
      value: '125',
      icon: { component: CompaniesIcon },
      backgroundColor: "#e5f9f0",
      change: '+12%',
      color: 'text-blue-500'
    },
    {
      title: 'Completed',
      value: '98',
      icon: { component: CompaniesIcon },
      backgroundColor: "#e5f9f0",
      change: '+8%',
      color: 'text-green-500'
    },
    {
      title: 'In Progress',
      value: '15',
      icon: { component: CompaniesIcon },
      backgroundColor: "#e5f9f0",
      change: '+2%',
      color: 'text-yellow-500'
    },
    {
      title: 'Cancelled',
      value: '12',
      icon: { component: CompaniesIcon },
      backgroundColor: "#e5f9f0",
      change: '-2%',
      color: 'text-red-500'
    },
  ];

  const BID_DATA = [
    {
      id: 1,
      bidNumber: "BID-1001",
      date: "13-10-2025 at 20:25",
      usernName: "Dianne Russell",
      driverName: "john",
      amount: "45",
      status: "paid",
      paymentStatus: "Cash"
    },
    {
      id: 1,
      bidNumber: "BID-1001",
      date: "13-10-2025 at 20:25",
      usernName: "Dianne Russell",
      driverName: "john",
      amount: "45",
      status: "Failed",
      paymentStatus: "Credit Card"
    },
    {
      id: 1,
      bidNumber: "BID-1001",
      date: "13-10-2025 at 20:25",
      usernName: "Dianne Russell",
      driverName: "john",
      amount: "45",
      status: "paid",
      paymentStatus: "Online"
    },
    {
      id: 1,
      bidNumber: "BID-1001",
      date: "13-10-2025 at 20:25",
      usernName: "Dianne Russell",
      driverName: "john",
      amount: "45",
      status: "paid",
      paymentStatus: "Cash"
    }
  ];

  const formatDateRange = (start, end) => {
    if (!start || !end) return 'Select date range';
    return `${format(start, 'dd/MM/yy')} - ${format(end, 'dd/MM/yy')}`;
  };

  const handleDownload = () => {
    if (selectedCompany.value === 'all') {
      console.log('Downloading all companies');
    } else {
      console.log(`Downloading for: ${selectedCompany.label}`);
    }
  };

  const handleCompanyChange = (selectedOption) => {
    setSelectedCompany(selectedOption);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="px-4 py-5 sm:p-6 lg:p-8 min-h-[calc(100vh-85px)] bg-gray-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <PageTitle title="Revenue & Statements" />
        {/* <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-48">
            <CustomSelect
              variant={2}
              options={COMPANY_OPTIONS}
              value={selectedCompany}
              onChange={handleCompanyChange}
              placeholder="Select company..."
              isSearchable={true}
            />
          </div>
          <div className="relative w-full sm:w-56">
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              dateFormat="dd/MM/yy"
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholderText="Select date range"
              customInput={
                <div className="flex items-center justify-between cursor-pointer border border-gray-300 rounded-md h-10 px-3 w-full">
                  <span className="text-sm text-gray-700">
                    {formatDateRange(startDate, endDate)}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              }
            />
          </div>
        </div> */}
      </div>

      <div>
        <h1 className='text-lg font-semibold pb-2'>Financial Summary</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 1.5xl:grid-cols-3 gap-4 sm:gap-5">
          {DASHBOARD_CARDS.map((card, index) => (
            <SnapshotCard
              key={index}
              isChange={false}
              data={card}
              className={
                DASHBOARD_CARDS.length - 1 === index
                  ? "sm:col-span-2 1.5xl:col-span-1"
                  : "col-span-1"
              }
            />
          ))}
        </div>
      </div>

      <div className='my-4'>
        <h1 className='text-lg font-semibold pb-2'>Job Summary</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 1.5xl:grid-cols-4 gap-4 sm:gap-5">
          {JOB_SUMMARY.map((card, index) => (
            <SnapshotCard
              key={index}
              data={{
                ...card,
              }}
            />
          ))}
        </div>
      </div>
      <div>
        <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5]">
          <Loading loading={tableLoading} type="cover">
            <div className="flex flex-col gap-4 pt-4">
              {BID_DATA.map((revenue) => (
                <RevenueStatementsCard
                  key={revenue.id}
                  revenue={revenue}
                />
              ))}
            </div>
          </Loading>
          {Array.isArray(BID_DATA) &&
            BID_DATA.length > 0 ? (
            <div className="mt-4 sm:mt-4 border-t border-[#E9E9E9] pt-3 sm:pt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemsPerPageOptions={PAGE_SIZE_OPTIONS}
                pageKey="companies"
              />
            </div>
          ) : null}
        </CardContainer>
      </div>
    </div>
  );
};

export default RevenueStatements;
