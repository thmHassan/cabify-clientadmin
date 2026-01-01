import { useEffect, useRef, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { useAppSelector } from '../../../../store';
import PageTitle from '../../../../components/ui/PageTitle/PageTitle';
import Pagination from '../../../../components/ui/Pagination/Pagination';
import Loading from '../../../../components/shared/Loading/Loading';
import SnapshotCard from '../../../../components/shared/SnapshotCard/SnapshotCard';
import { PAGE_SIZE_OPTIONS } from '../../../../constants/selectOptions';
import CardContainer from '../../../../components/shared/CardContainer';
import RevenueStatementsCard from './components/RevenueStatementsCard/RevenueStatementsCard';
import TotalRevenuesIcon from '../../../../components/svg/TotalRevenuesIcon';
import RideEarningsIcon from '../../../../components/svg/RideEarningsIcon';
import CommissionIcon from '../../../../components/svg/CommissionIcon';
import JobsOfferedIcon from '../../../../components/svg/JobsOfferedIcon';
import JobsAcceptedIcon from '../../../../components/svg/JobsAcceptedIcon';
import AcceptanceRateIcon from '../../../../components/svg/AcceptanceRateIcon';
import CompletedsJobsIcon from '../../../../components/svg/CompletedsJobsIcon';
import { apiGetSubCompany } from '../../../../services/SubCompanyServices';

const RevenueStatements = () => {
  const [selectedCompany, setSelectedCompany] = useState();
  const [tableLoading, setTableLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [subCompanyList, setSubCompanyList] = useState([]);
  const [loadingSubCompanies, setLoadingSubCompanies] = useState(false);

  const savedPagination = useAppSelector(
    (state) => state?.app?.app?.pagination?.companies
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const DASHBOARD_CARDS = [
    {
      title: "Total Revenue",
      value: "25",
      change: "+3 from last hour",
      icon: { component: TotalRevenuesIcon },
      backgroundColor: "#e5f9f0",
      color: "#534CB4",
    },
    {
      title: "Ride Earnings",
      value: "15",
      change: "+3 from last hour",
      icon: { component: RideEarningsIcon },
      backgroundColor: "#e5f9f0",
      color: "#3E9972",
    },
    {
      title: "Commission",
      value: "$6,800",
      change: "+3 from last hour",
      icon: { component: CommissionIcon },
      backgroundColor: "#e5f9f0",
      color: "#C29569",
    },
  ];

  const JOB_SUMMARY = [
    {
      title: 'Jobs Offered',
      value: '125',
      icon: { component: JobsOfferedIcon },
      backgroundColor: "#e5f9f0",
      change: '+12%',
      color: 'text-blue-500'
    },
    {
      title: 'Jobs Accepted',
      value: '98',
      icon: { component: JobsAcceptedIcon },
      backgroundColor: "#e5f9f0",
      change: '+8%',
      color: 'text-green-500'
    },
    {
      title: 'Completed Jobs',
      value: '15',
      icon: { component: CompletedsJobsIcon },
      backgroundColor: "#e5f9f0",
      change: '+2%',
      color: 'text-yellow-500'
    },
    {
      title: 'Acceptance Rate',
      value: '12',
      icon: { component: AcceptanceRateIcon },
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
      status: "Paid",
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
      status: "Paid",
      paymentStatus: "Online"
    },
    {
      id: 1,
      bidNumber: "BID-1001",
      date: "13-10-2025 at 20:25",
      usernName: "Dianne Russell",
      driverName: "john",
      amount: "45",
      status: "Paid",
      paymentStatus: "Cash"
    }
  ];

  useEffect(() => {
    const fetchSubCompanies = async () => {
      setLoadingSubCompanies(true);
      try {
        const response = await apiGetSubCompany();
        if (response?.data?.success === 1) {
          const companies = response?.data?.list?.data || [];
          const options = companies.map(company => ({
            label: company.name,
            value: company.id.toString(),
          }));
          setSubCompanyList(options);
        }
      } catch (error) {
        console.error("Error fetching sub-companies:", error);
      } finally {
        setLoadingSubCompanies(false);
      }
    };
    fetchSubCompanies();
  }, []);

  const handleSelect = (company) => {
    setSelectedCompany(company);
    setIsOpen(false);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="px-4 py-5 sm:p-6 lg:p-8 min-h-[calc(100vh-85px)] bg-gray-50">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <PageTitle title="Revenue & Statements" />

        <div className="flex flex-col sm:flex-row gap-3">
          <div ref={dropdownRef} className="relative min-w-[300px]">
            <div
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between px-4 py-2 border-[1px] border-[#6C6C6C] rounded-[6px] cursor-pointer bg-white"
            >
              <span className="text-[#252525] font-medium">
                {selectedCompany ? selectedCompany.label : "Select a company"}
              </span>
              <span
                className={`ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"
                  }`}
              >
                <svg width="18" height="11" viewBox="0 0 20 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L10 10L19 1" stroke="#333333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>

              </span>
            </div>

            {/* Dropdown menu */}
            {isOpen && (
              <ul className="absolute z-10 mt-1 w-full bg-white border-[1px] border-[#6C6C6C] rounded-[6px] shadow-lg">
                {subCompanyList.map((company) => (
                  <li
                    key={company.value}
                    onClick={() => handleSelect(company)}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-[#252525] font-medium"
                  >
                    {company.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative min-w-[230px]">
            <div className="hidden md:flex flex-row gap-3 sm:gap-5 w-full sm:w-auto">
              <input
                type="date"
                className="border-[1px] border-[#6C6C6C] rounded-[6px] px-3 py-2"
                // value={_selectedDate}
                // onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="Select Date"
              />
            </div>
          </div>
        </div>
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
