import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaBuilding,
  FaCarSide,
  FaChevronRight,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaPlus,
  FaReceipt,
  FaSyncAlt,
  FaWallet,
} from "react-icons/fa";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import { useCurrency } from "../../../../contexts/CurrencyContext";
import {
  apiCollectFinanceStatement,
  apiCreateFinanceAccount,
  apiCreateFinanceSettlement,
  apiCreateFinanceStatement,
  apiGetFinanceAccountLedger,
  apiGetFinanceAccounts,
  apiGetFinanceDriver,
  apiGetFinanceDrivers,
  apiGetFinancePackages,
  apiGetFinancePayments,
  apiGetFinanceRides,
  apiGetFinanceSettlement,
  apiGetFinanceSettlements,
  apiGetFinanceStatement,
  apiGetFinanceStatements,
  apiGetFinanceSummary,
  apiMarkFinanceSettlementSettled,
  apiPostFinancePayment,
  apiSendFinanceStatement,
  apiUpdateFinanceAccount,
  apiVoidFinanceSettlement,
  apiVoidFinanceStatement,
} from "../../../../services/FinanceCenterService";
import { formatDistanceFromMeters } from "../../../../utils/tenantFormatUtils";
import useDistanceUnit from "../../../../utils/hooks/useDistanceUnit";
import { useTimezoneFormatting } from "../../../../utils/timezoneUtils";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "accounts", label: "Accounts" },
  { key: "account-ledger", label: "Account Ledger" },
  { key: "payments", label: "Payments" },
  { key: "drivers", label: "Drivers" },
  { key: "driver-360", label: "Driver 360" },
  { key: "rides", label: "Rides" },
  { key: "statements", label: "Statements" },
  { key: "settlements", label: "Settlements" },
  { key: "packages", label: "Packages" },
];

const STATUS_OPTIONS = {
  overview: [
    ["all", "All statuses"],
    ["completed", "Completed"],
    ["pending", "Pending"],
    ["started", "Started"],
    ["arrived", "Arrived"],
    ["ongoing", "Ongoing"],
    ["cancelled", "Cancelled"],
  ],
  accounts: [
    ["all", "All ride statuses"],
    ["completed", "Completed rides"],
    ["pending", "Pending rides"],
    ["started", "Started rides"],
    ["arrived", "Arrived rides"],
    ["ongoing", "Ongoing rides"],
    ["cancelled", "Cancelled rides"],
  ],
  "account-ledger": [
    ["all", "All ride statuses"],
    ["completed", "Completed rides"],
    ["pending", "Pending rides"],
    ["started", "Started rides"],
    ["arrived", "Arrived rides"],
    ["ongoing", "Ongoing rides"],
    ["cancelled", "Cancelled rides"],
  ],
  drivers: [
    ["all", "All ride statuses"],
    ["completed", "Completed rides"],
    ["pending", "Pending rides"],
    ["started", "Started rides"],
    ["arrived", "Arrived rides"],
    ["ongoing", "Ongoing rides"],
    ["cancelled", "Cancelled rides"],
  ],
  "driver-360": [
    ["all", "All ride statuses"],
    ["completed", "Completed rides"],
    ["pending", "Pending rides"],
    ["started", "Started rides"],
    ["arrived", "Arrived rides"],
    ["ongoing", "Ongoing rides"],
    ["cancelled", "Cancelled rides"],
  ],
  rides: [
    ["all", "All statuses"],
    ["completed", "Completed"],
    ["pending", "Pending"],
    ["started", "Started"],
    ["arrived", "Arrived"],
    ["ongoing", "Ongoing"],
    ["cancelled", "Cancelled"],
  ],
  payments: [
    ["all", "All payments"],
    ["posted", "Posted"],
  ],
  statements: [
    ["all", "All statements"],
    ["draft", "Draft"],
    ["sent", "Sent"],
    ["partial", "Partial"],
    ["collected", "Collected"],
    ["void", "Void"],
  ],
  settlements: [
    ["all", "All settlements"],
    ["draft", "Draft"],
    ["pending", "Pending"],
    ["partial", "Partial"],
    ["settled", "Settled"],
    ["void", "Void"],
  ],
  packages: [
    ["all", "All packages"],
  ],
};

const RIDE_CHANNEL_OPTIONS = [
  ["all", "All channels"],
  ["cash", "Cash"],
  ["online", "Online"],
  ["account", "Account"],
];

const CHANNEL_OPTIONS = {
  overview: RIDE_CHANNEL_OPTIONS,
  accounts: RIDE_CHANNEL_OPTIONS,
  "account-ledger": RIDE_CHANNEL_OPTIONS,
  drivers: RIDE_CHANNEL_OPTIONS,
  "driver-360": RIDE_CHANNEL_OPTIONS,
  rides: RIDE_CHANNEL_OPTIONS,
  payments: [
    ["all", "All payment channels"],
    ["manual", "Manual"],
    ["manual_collection", "Manual collection"],
    ["manual_settlement", "Manual settlement"],
    ["account_collection", "Account collection"],
    ["driver_settlement", "Driver settlement"],
    ["cash", "Cash"],
    ["online", "Online"],
  ],
  statements: [["all", "All channels"]],
  settlements: [["all", "All channels"]],
  packages: [["all", "All channels"]],
};

const emptyForm = {
  name: "",
  company: "",
  email: "",
  phone_no: "",
  address: "",
  notes: "",
};

const FinanceCenter = () => {
  const { formatWithCurrency } = useCurrency();
  const { formatDateOnlyOr, getTodayDateString, currentTimezone } = useTimezoneFormatting();
  const distanceUnit = useDistanceUnit();
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState(() => {
    const endDate = getTodayDateString();

    return {
      start_date: `${endDate.slice(0, 8)}01`,
      end_date: endDate,
      search: "",
      status: "all",
      payment_channel: "all",
    };
  });
  const [summary, setSummary] = useState(null);
  const [tableRows, setTableRows] = useState([]);
  const [pageMeta, setPageMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [accountForm, setAccountForm] = useState(emptyForm);
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountLedger, setAccountLedger] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverDetail, setDriverDetail] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    payer_type: "account",
    payer_id: "",
    receiver_type: "company",
    channel: "manual",
    amount: "",
    reference: "",
    notes: "",
  });
  const [actionModal, setActionModal] = useState({
    type: null,
    record: null,
    amount: "",
    channel: "",
    reference: "",
    notes: "",
  });
  const [detailModal, setDetailModal] = useState({
    type: null,
    record: null,
  });

  const settingsLine = useMemo(() => {
    return `Timezone: ${currentTimezone || "UTC"} | Distance: ${distanceUnit}`;
  }, [currentTimezone, distanceUnit]);

  const formatFinanceDate = useCallback((date) => {
    if (!date) return "-";

    if (/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
      return formatDateOnlyOr(`${date}T12:00:00`);
    }

    return formatDateOnlyOr(date);
  }, [formatDateOnlyOr]);

  const formatDistance = useCallback((meters) => {
    return formatDistanceFromMeters(Number(meters || 0), distanceUnit);
  }, [distanceUnit]);

  const listParams = useMemo(() => ({
    ...filters,
    page: pageMeta.current_page,
    per_page: 20,
  }), [filters, pageMeta.current_page]);
  const activeStatusOptions = STATUS_OPTIONS[activeTab] || STATUS_OPTIONS.overview;
  const activeChannelOptions = CHANNEL_OPTIONS[activeTab] || RIDE_CHANNEL_OPTIONS;

  const money = useCallback((value) => formatWithCurrency(value ?? 0), [formatWithCurrency]);

  const loadSummary = useCallback(async () => {
    const response = await apiGetFinanceSummary(filters);
    if (response?.data?.success === 1) {
      setSummary(response.data.data);
    }
  }, [filters]);

  const loadLedger = useCallback(async (account) => {
    if (!account?.id) return;
    setLoading(true);
    try {
      const response = await apiGetFinanceAccountLedger(account.id, filters);
      if (response?.data?.success === 1) {
        setSelectedAccount(account);
        setAccountLedger(response.data.data);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load account ledger");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadDriverDetail = useCallback(async (driver) => {
    if (!driver?.id) return;
    setLoading(true);
    try {
      const response = await apiGetFinanceDriver(driver.id, filters);
      if (response?.data?.success === 1) {
        setSelectedDriver(driver);
        setDriverDetail(response.data.data);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load driver detail");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadTable = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === "accounts") response = await apiGetFinanceAccounts(listParams);
      if (activeTab === "payments") response = await apiGetFinancePayments(listParams);
      if (activeTab === "drivers") response = await apiGetFinanceDrivers(listParams);
      if (activeTab === "rides") response = await apiGetFinanceRides(listParams);
      if (activeTab === "statements") response = await apiGetFinanceStatements(listParams);
      if (activeTab === "settlements") response = await apiGetFinanceSettlements(listParams);
      if (activeTab === "packages") response = await apiGetFinancePackages(listParams);

      const payload = response?.data?.list;
      setTableRows(payload?.data || []);
      setPageMeta((prev) => ({
        ...prev,
        current_page: payload?.current_page || 1,
        last_page: payload?.last_page || 1,
        total: payload?.total || 0,
      }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load finance data");
    } finally {
      setLoading(false);
    }
  }, [activeTab, listParams]);

  useEffect(() => {
    loadSummary().catch(() => toast.error("Failed to load finance summary"));
  }, [loadSummary]);

  useEffect(() => {
    if (["accounts", "payments", "drivers", "rides", "statements", "settlements", "packages"].includes(activeTab)) {
      loadTable();
    }
  }, [activeTab, loadTable]);

  useEffect(() => {
    if (!activeStatusOptions.some(([value]) => value === filters.status)) {
      updateFilter("status", "all");
    }
  }, [activeStatusOptions, filters.status]);

  useEffect(() => {
    if (!activeChannelOptions.some(([value]) => value === filters.payment_channel)) {
      updateFilter("payment_channel", "all");
    }
  }, [activeChannelOptions, filters.payment_channel]);

  const refreshAll = async () => {
    setLoading(true);
    try {
      await loadSummary();
      if (["accounts", "payments", "drivers", "rides", "statements", "settlements", "packages"].includes(activeTab)) {
        await loadTable();
      }
      if (selectedAccount) await loadLedger(selectedAccount);
      if (selectedDriver) await loadDriverDetail(selectedDriver);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    setPageMeta((prev) => ({ ...prev, current_page: 1 }));
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const saveAccount = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = editingAccountId
        ? await apiUpdateFinanceAccount(editingAccountId, accountForm)
        : await apiCreateFinanceAccount(accountForm);

      if (response?.data?.success === 1) {
        toast.success(response.data.message || "Account saved");
        setAccountForm(emptyForm);
        setEditingAccountId(null);
        await loadTable();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Account save failed");
    } finally {
      setLoading(false);
    }
  };

  const savePayment = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await apiPostFinancePayment({
        ...paymentForm,
        amount: Number(paymentForm.amount),
        payer_id: paymentForm.payer_id ? Number(paymentForm.payer_id) : null,
      });

      if (response?.data?.success === 1) {
        toast.success(response.data.message || "Payment posted");
        setPaymentForm({
          payer_type: "account",
          payer_id: "",
          receiver_type: "company",
          channel: "manual",
          amount: "",
          reference: "",
          notes: "",
        });
        await refreshAll();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const createStatement = async (account = selectedAccount) => {
    if (!account?.id) {
      toast.error("Select an account first");
      return;
    }

    setLoading(true);
    try {
      const response = await apiCreateFinanceStatement({
        account_id: account.id,
        period_start: filters.start_date,
        period_end: filters.end_date,
      });
      if (response?.data?.success === 1) {
        toast.success(response.data.message || "Statement created");
        await refreshAll();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Statement could not be created");
    } finally {
      setLoading(false);
    }
  };

  const collectStatement = async (statement) => {
    setLoading(true);
    try {
      const response = await apiCollectFinanceStatement(statement.id, {
        amount: Number(actionModal.amount),
        channel: actionModal.channel || "manual_collection",
        reference: actionModal.reference,
        notes: actionModal.notes,
      });
      if (response?.data?.success === 1) {
        toast.success(response.data.message || "Collection posted");
        closeActionModal();
        await refreshAll();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Collection failed");
    } finally {
      setLoading(false);
    }
  };

  const statementAction = async (statement, action) => {
    setLoading(true);
    try {
      const response = action === "send"
        ? await apiSendFinanceStatement(statement.id)
        : await apiVoidFinanceStatement(statement.id);
      if (response?.data?.success === 1) {
        toast.success(response.data.message || "Statement updated");
        await refreshAll();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Statement update failed");
    } finally {
      setLoading(false);
    }
  };

  const createSettlement = async (driver = selectedDriver) => {
    if (!driver?.id) {
      toast.error("Select a driver first");
      return;
    }

    setLoading(true);
    try {
      const response = await apiCreateFinanceSettlement({
        driver_id: driver.id,
        period_start: filters.start_date,
        period_end: filters.end_date,
      });
      if (response?.data?.success === 1) {
        toast.success(response.data.message || "Settlement created");
        await refreshAll();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Settlement could not be created");
    } finally {
      setLoading(false);
    }
  };

  const settleDriver = async (settlement) => {
    setLoading(true);
    try {
      const response = await apiMarkFinanceSettlementSettled(settlement.id, {
        amount: Number(actionModal.amount),
        channel: actionModal.channel || "manual_settlement",
        reference: actionModal.reference,
        notes: actionModal.notes,
      });
      if (response?.data?.success === 1) {
        toast.success(response.data.message || "Settlement marked as settled");
        closeActionModal();
        await refreshAll();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Settlement failed");
    } finally {
      setLoading(false);
    }
  };

  const openCollectionModal = (statement) => {
    setActionModal({
      type: "statement_collection",
      record: statement,
      amount: String(statement.balance_amount || statement.total_amount || ""),
      channel: "manual_collection",
      reference: "",
      notes: "",
    });
  };

  const openSettlementModal = (settlement) => {
    setActionModal({
      type: "driver_settlement",
      record: settlement,
      amount: Math.abs(Number(settlement.net_amount || 0)).toFixed(2),
      channel: "manual_settlement",
      reference: "",
      notes: "",
    });
  };

  const closeActionModal = () => {
    setActionModal({
      type: null,
      record: null,
      amount: "",
      channel: "",
      reference: "",
      notes: "",
    });
  };

  const voidSettlement = async (settlement) => {
    setLoading(true);
    try {
      const response = await apiVoidFinanceSettlement(settlement.id);
      if (response?.data?.success === 1) {
        toast.success(response.data.message || "Settlement voided");
        await refreshAll();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Settlement update failed");
    } finally {
      setLoading(false);
    }
  };

  const openStatementDetail = async (statement) => {
    setLoading(true);
    try {
      const response = await apiGetFinanceStatement(statement.id);
      if (response?.data?.success === 1) {
        setDetailModal({ type: "statement", record: response.data.data });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Statement detail failed");
    } finally {
      setLoading(false);
    }
  };

  const openSettlementDetail = async (settlement) => {
    setLoading(true);
    try {
      const response = await apiGetFinanceSettlement(settlement.id);
      if (response?.data?.success === 1) {
        setDetailModal({ type: "settlement", record: response.data.data });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Settlement detail failed");
    } finally {
      setLoading(false);
    }
  };

  const editAccount = (account) => {
    setEditingAccountId(account.id);
    setAccountForm({
      name: account.name || "",
      company: account.company || "",
      email: account.email || "",
      phone_no: account.phone_no || "",
      address: account.address || "",
      notes: account.notes || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const metricCards = [
    { title: "Gross Revenue", value: summary?.totals?.gross_revenue, icon: FaFileInvoiceDollar, tint: "bg-blue-50 text-blue-700" },
    { title: "Account Receivable", value: summary?.totals?.account_receivable, icon: FaReceipt, tint: "bg-amber-50 text-amber-700" },
    { title: "Company Owes Drivers", value: summary?.totals?.company_owes_drivers, icon: FaCarSide, tint: "bg-emerald-50 text-emerald-700" },
    { title: "Drivers Owe Company", value: summary?.totals?.drivers_owe_company, icon: FaWallet, tint: "bg-rose-50 text-rose-700" },
  ];

  return (
    <div className="min-h-[calc(100vh-85px)] bg-[#f6f8fb] px-4 py-5 sm:p-6 lg:p-8">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <PageTitle title="Finance Center" />
          <p className="mt-1 text-sm text-slate-500">
            Central ledger for account collections, driver settlements, ride revenue, payments, and packages.
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{settingsLine}</p>
        </div>
        <button
          type="button"
          onClick={refreshAll}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#1F41BB] px-4 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
          disabled={loading}
        >
          <FaSyncAlt className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="mb-5 grid gap-3 rounded-md border border-slate-200 bg-white p-4 md:grid-cols-5">
        <Field label="From" type="date" value={filters.start_date} onChange={(value) => updateFilter("start_date", value)} />
        <Field label="To" type="date" value={filters.end_date} onChange={(value) => updateFilter("end_date", value)} />
        <Field label="Search" value={filters.search} onChange={(value) => updateFilter("search", value)} placeholder="Name, phone, ride, ref" />
        <Select label="Channel" value={filters.payment_channel} onChange={(value) => updateFilter("payment_channel", value)}>
          {activeChannelOptions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        <Select label="Status" value={filters.status} onChange={(value) => updateFilter("status", value)}>
          {activeStatusOptions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
      </div>

      <div className="mb-5 overflow-x-auto border-b border-slate-200">
        <div className="flex min-w-max gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                setPageMeta((prev) => ({ ...prev, current_page: 1 }));
              }}
              className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
                activeTab === tab.key
                  ? "border-[#1F41BB] text-[#1F41BB]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((card) => (
              <MetricCard key={card.title} {...card} money={money} />
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            {["cash", "online", "account"].map((channel) => (
              <ChannelPanel key={channel} title={channel} data={summary?.breakdown?.[channel]} money={money} />
            ))}
          </div>
          {summary?.warnings?.length > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              {summary.warnings.map((warning) => <p key={warning}>{warning}</p>)}
            </div>
          )}
        </div>
      )}

      {activeTab === "accounts" && (
        <div className="space-y-5">
          <AccountForm
            form={accountForm}
            setForm={setAccountForm}
            onSubmit={saveAccount}
            editing={Boolean(editingAccountId)}
            onCancel={() => {
              setEditingAccountId(null);
              setAccountForm(emptyForm);
            }}
          />
          <DataPanel loading={loading} rows={tableRows} meta={pageMeta} setMeta={setPageMeta}>
            <Table
              columns={["Account", "Contact", "Rides", "Receivable", "Unbilled", "Actions"]}
              rows={tableRows.map((account) => [
                <div>
                  <p className="font-semibold text-slate-900">{account.name || "-"}</p>
                  <p className="text-xs text-slate-500">{account.company || account.address || "-"}</p>
                </div>,
                <div>
                  <p>{account.email || "-"}</p>
                  <p className="text-xs text-slate-500">{account.phone_no || "-"}</p>
                </div>,
                account.rides || 0,
                money(account.receivable),
                money(account.unbilled),
                <div className="flex flex-wrap gap-2">
                  <ActionButton onClick={() => { setActiveTab("account-ledger"); loadLedger(account); }}>Ledger</ActionButton>
                  <ActionButton onClick={() => createStatement(account)}>Statement</ActionButton>
                  <ActionButton onClick={() => editAccount(account)}>Edit</ActionButton>
                </div>,
              ])}
            />
          </DataPanel>
        </div>
      )}

      {activeTab === "account-ledger" && (
        <LedgerPanel
          account={selectedAccount}
          ledger={accountLedger}
          loading={loading}
          money={money}
          onCreateStatement={() => createStatement(selectedAccount)}
        />
      )}

      {activeTab === "payments" && (
        <div className="space-y-5">
          <PaymentForm form={paymentForm} setForm={setPaymentForm} onSubmit={savePayment} />
          <DataPanel loading={loading} rows={tableRows} meta={pageMeta} setMeta={setPageMeta}>
            <Table
              columns={["Payment", "Payer", "Receiver", "Channel", "Amount", "Date", "Reference"]}
              rows={tableRows.map((payment) => [
                payment.payment_number,
                `${payment.payer_type || "-"} ${payment.payer_id || ""}`,
                `${payment.receiver_type || "-"} ${payment.receiver_id || ""}`,
                <Badge>{payment.channel || "-"}</Badge>,
                money(payment.amount),
                formatFinanceDate(payment.payment_date),
                payment.reference || "-",
              ])}
            />
          </DataPanel>
        </div>
      )}

      {activeTab === "drivers" && (
        <DataPanel loading={loading} rows={tableRows} meta={pageMeta} setMeta={setPageMeta}>
          <Table
            columns={["Driver", "Vehicle", "Rides", "Gross", "Company Owes", "Driver Owes", "Net", "Actions"]}
            rows={tableRows.map((driver) => [
              <div>
                <p className="font-semibold text-slate-900">{driver.name || "-"}</p>
                <p className="text-xs text-slate-500">{driver.email || driver.phone_no || "-"}</p>
              </div>,
              driver.plate_no || driver.vehicle || "-",
              driver.rides || 0,
              money(driver.gross_fares),
              money(driver.company_owes_driver),
              money(driver.driver_owes_company),
              money(driver.net_amount),
              <div className="flex flex-wrap gap-2">
                <ActionButton onClick={() => { setActiveTab("driver-360"); loadDriverDetail(driver); }}>360</ActionButton>
                <ActionButton onClick={() => createSettlement(driver)}>Settle</ActionButton>
              </div>,
            ])}
          />
        </DataPanel>
      )}

      {activeTab === "driver-360" && (
        <DriverPanel
          driver={selectedDriver}
          detail={driverDetail}
          loading={loading}
          money={money}
          onCreateSettlement={() => createSettlement(selectedDriver)}
        />
      )}

      {activeTab === "rides" && (
        <DataPanel loading={loading} rows={tableRows} meta={pageMeta} setMeta={setPageMeta}>
          <Table
            columns={["Ride", "Passenger", "Account", "Driver", "Distance", "Channel", "Fare", "Company Owes", "Driver Owes", "Status"]}
            rows={tableRows.map((ride) => [
              <div>
                <p className="font-semibold text-slate-900">#{ride.id}</p>
                <p className="max-w-[230px] truncate text-xs text-slate-500">{ride.pickup_point}</p>
              </div>,
              ride.passenger_name || "-",
              ride.account_name || "-",
              ride.driver_name || "-",
              formatDistance(ride.distance_meters),
              <Badge>{ride.payment_channel}</Badge>,
              money(ride.fare_amount),
              money(ride.company_owes_driver),
              money(ride.driver_owes_company),
              <Badge>{ride.booking_status}</Badge>,
            ])}
          />
        </DataPanel>
      )}

      {activeTab === "statements" && (
        <DataPanel loading={loading} rows={tableRows} meta={pageMeta} setMeta={setPageMeta}>
          <Table
            columns={["Statement", "Account", "Period", "Total", "Paid", "Balance", "Status", "Actions"]}
            rows={tableRows.map((statement) => {
              const hasPostedPayments = Number(statement.paid_amount || 0) > 0;
              const isVoid = statement.status === "void";

              return [
                statement.statement_number,
                statement.account?.name || statement.account_id,
                `${formatFinanceDate(statement.period_start)} to ${formatFinanceDate(statement.period_end)}`,
                money(statement.total_amount),
                money(statement.paid_amount),
                money(statement.balance_amount),
                <Badge>{statement.status}</Badge>,
                <div className="flex flex-wrap gap-2">
                  <ActionButton onClick={() => openStatementDetail(statement)}>View</ActionButton>
                  <ActionButton disabled={statement.status !== "draft"} onClick={() => statementAction(statement, "send")}>Send</ActionButton>
                  <ActionButton disabled={isVoid || Number(statement.balance_amount || 0) <= 0} onClick={() => openCollectionModal(statement)}>Collect</ActionButton>
                  <ActionButton disabled={isVoid || hasPostedPayments} tone="danger" onClick={() => statementAction(statement, "void")}>Void</ActionButton>
                </div>,
              ];
            })}
          />
        </DataPanel>
      )}

      {activeTab === "settlements" && (
        <DataPanel loading={loading} rows={tableRows} meta={pageMeta} setMeta={setPageMeta}>
          <Table
            columns={["Settlement", "Driver", "Period", "Gross", "Company Owes", "Driver Owes", "Net", "Status", "Actions"]}
            rows={tableRows.map((settlement) => {
              const hasPostedPayments = Number(settlement.paid_amount || 0) > 0;
              const isClosed = ["settled", "void"].includes(settlement.status);

              return [
                settlement.settlement_number,
                settlement.driver?.name || settlement.driver_id,
                `${formatFinanceDate(settlement.period_start)} to ${formatFinanceDate(settlement.period_end)}`,
                money(settlement.gross_fares),
                money(settlement.company_owes_driver),
                money(settlement.driver_owes_company),
                money(settlement.net_amount),
                <Badge>{settlement.status}</Badge>,
                <div className="flex flex-wrap gap-2">
                  <ActionButton onClick={() => openSettlementDetail(settlement)}>View</ActionButton>
                  <ActionButton disabled={isClosed} onClick={() => openSettlementModal(settlement)}>Settle</ActionButton>
                  <ActionButton disabled={settlement.status === "void" || hasPostedPayments} tone="danger" onClick={() => voidSettlement(settlement)}>Void</ActionButton>
                </div>,
              ];
            })}
          />
        </DataPanel>
      )}

      {activeTab === "packages" && (
        <DataPanel loading={loading} rows={tableRows} meta={pageMeta} setMeta={setPageMeta}>
          <Table
            columns={["Package", "Driver", "Type", "Pending Rides", "Commission", "Amount", "Dates"]}
            rows={tableRows.map((pack) => [
              pack.package_name || `Package #${pack.id}`,
              pack.driver_name || pack.driver_id || "-",
              <Badge>{pack.package_type || "-"}</Badge>,
              pack.pending_rides || "-",
              `${pack.commission_per || 0}%`,
              money(pack.amount),
              `${formatFinanceDate(pack.start_date)} to ${formatFinanceDate(pack.expire_date)}`,
            ])}
          />
        </DataPanel>
      )}

      {actionModal.type && (
        <ActionModal
          state={actionModal}
          setState={setActionModal}
          loading={loading}
          money={money}
          onClose={closeActionModal}
          onSubmit={() => {
            if (!Number(actionModal.amount)) {
              toast.error("Enter a valid amount");
              return;
            }
            if (actionModal.type === "statement_collection") {
              collectStatement(actionModal.record);
            } else {
              settleDriver(actionModal.record);
            }
          }}
        />
      )}

      {detailModal.type && (
        <DetailModal
          state={detailModal}
          setState={setDetailModal}
          money={money}
          formatFinanceDate={formatFinanceDate}
        />
      )}
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, tint, money }) => (
  <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
    <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md ${tint}`}>
      <Icon />
    </div>
    <p className="text-sm font-medium text-slate-500">{title}</p>
    <p className="mt-2 text-2xl font-semibold text-slate-950">{money(value)}</p>
  </div>
);

const ChannelPanel = ({ title, data, money }) => (
  <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-3 flex items-center gap-2 text-slate-900">
      {title === "cash" && <FaMoneyBillWave />}
      {title === "online" && <FaWallet />}
      {title === "account" && <FaBuilding />}
      <h3 className="text-base font-semibold capitalize">{title}</h3>
    </div>
    <dl className="grid gap-2 text-sm">
      <Line label="Rides" value={data?.rides || 0} />
      <Line label="Gross" value={money(data?.gross || 0)} />
      <Line label="Company collected" value={money(data?.company_collected || 0)} />
      <Line label="Driver cash collected" value={money(data?.driver_cash_collected || 0)} />
      <Line label="Receivable" value={money(data?.receivable || 0)} />
    </dl>
  </div>
);

const Line = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4">
    <dt className="text-slate-500">{label}</dt>
    <dd className="font-semibold text-slate-900">{value}</dd>
  </div>
);

const DataPanel = ({ loading, rows, meta, setMeta, children }) => (
  <div className="rounded-md border border-slate-200 bg-white shadow-sm">
    <div className="min-h-[320px] overflow-x-auto">
      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm font-semibold text-slate-500">Loading finance data...</div>
      ) : rows?.length ? (
        children
      ) : (
        <div className="flex min-h-[320px] items-center justify-center text-sm font-semibold text-slate-500">No finance records found for these filters.</div>
      )}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
      <span>{meta.total || 0} records</span>
      <div className="flex items-center gap-2">
        <ActionButton disabled={meta.current_page <= 1} onClick={() => setMeta((prev) => ({ ...prev, current_page: prev.current_page - 1 }))}>Previous</ActionButton>
        <span>Page {meta.current_page} of {meta.last_page}</span>
        <ActionButton disabled={meta.current_page >= meta.last_page} onClick={() => setMeta((prev) => ({ ...prev, current_page: prev.current_page + 1 }))}>Next</ActionButton>
      </div>
    </div>
  </div>
);

const Table = ({ columns, rows }) => (
  <table className="min-w-full text-left text-sm">
    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
      <tr>
        {columns.map((column) => <th key={column} className="whitespace-nowrap px-4 py-3 font-semibold">{column}</th>)}
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100">
      {rows.map((row, index) => (
        <tr key={index} className="hover:bg-slate-50">
          {row.map((cell, cellIndex) => <td key={cellIndex} className="whitespace-nowrap px-4 py-3 align-top text-slate-700">{cell}</td>)}
        </tr>
      ))}
    </tbody>
  </table>
);

const Field = ({ label, value, onChange, type = "text", placeholder = "" }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1F41BB] focus:ring-2 focus:ring-blue-100"
    />
  </label>
);

const Select = ({ label, value, onChange, children }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1F41BB] focus:ring-2 focus:ring-blue-100"
    >
      {children}
    </select>
  </label>
);

const ActionButton = ({ children, onClick, disabled, tone = "default" }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
      tone === "danger"
        ? "border border-rose-200 bg-rose-50 text-rose-700"
        : "border border-blue-100 bg-blue-50 text-[#1F41BB]"
    }`}
  >
    {children}
  </button>
);

const Badge = ({ children }) => (
  <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-700">{children || "-"}</span>
);

const AccountForm = ({ form, setForm, onSubmit, editing, onCancel }) => (
  <form onSubmit={onSubmit} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-4 flex items-center gap-2 text-slate-900">
      <FaPlus className="text-[#1F41BB]" />
      <h3 className="font-semibold">{editing ? "Edit Account" : "Create Account"}</h3>
    </div>
    <div className="grid gap-3 md:grid-cols-3">
      <Field label="Name" value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value }))} />
      <Field label="Company" value={form.company} onChange={(value) => setForm((prev) => ({ ...prev, company: value }))} />
      <Field label="Email" value={form.email} onChange={(value) => setForm((prev) => ({ ...prev, email: value }))} />
      <Field label="Phone" value={form.phone_no} onChange={(value) => setForm((prev) => ({ ...prev, phone_no: value }))} />
      <Field label="Address" value={form.address} onChange={(value) => setForm((prev) => ({ ...prev, address: value }))} />
      <Field label="Notes" value={form.notes} onChange={(value) => setForm((prev) => ({ ...prev, notes: value }))} />
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="submit" className="h-10 rounded-md bg-[#1F41BB] px-4 text-sm font-semibold text-white">
        {editing ? "Update Account" : "Create Account"}
      </button>
      {editing && <ActionButton onClick={onCancel}>Cancel</ActionButton>}
    </div>
  </form>
);

const PaymentForm = ({ form, setForm, onSubmit }) => (
  <form onSubmit={onSubmit} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-4 flex items-center gap-2 text-slate-900">
      <FaReceipt className="text-[#1F41BB]" />
      <h3 className="font-semibold">Post Payment</h3>
    </div>
    <div className="grid gap-3 md:grid-cols-4">
      <Select label="Payer Type" value={form.payer_type} onChange={(value) => setForm((prev) => ({ ...prev, payer_type: value }))}>
        <option value="account">Account</option>
        <option value="driver">Driver</option>
        <option value="company">Company</option>
      </Select>
      <Field label="Payer ID" value={form.payer_id} onChange={(value) => setForm((prev) => ({ ...prev, payer_id: value }))} />
      <Select label="Receiver" value={form.receiver_type} onChange={(value) => setForm((prev) => ({ ...prev, receiver_type: value }))}>
        <option value="company">Company</option>
        <option value="driver">Driver</option>
        <option value="account">Account</option>
      </Select>
      <Field label="Amount" type="number" value={form.amount} onChange={(value) => setForm((prev) => ({ ...prev, amount: value }))} />
      <Field label="Channel" value={form.channel} onChange={(value) => setForm((prev) => ({ ...prev, channel: value }))} />
      <Field label="Reference" value={form.reference} onChange={(value) => setForm((prev) => ({ ...prev, reference: value }))} />
      <Field label="Notes" value={form.notes} onChange={(value) => setForm((prev) => ({ ...prev, notes: value }))} />
    </div>
    <button type="submit" className="mt-4 h-10 rounded-md bg-[#1F41BB] px-4 text-sm font-semibold text-white">
      Post Payment
    </button>
  </form>
);

const ActionModal = ({ state, setState, loading, money, onClose, onSubmit }) => {
  const isCollection = state.type === "statement_collection";
  const title = isCollection ? "Collect Account Statement" : "Settle Driver Balance";
  const recordNumber = isCollection ? state.record?.statement_number : state.record?.settlement_number;
  const balance = isCollection ? state.record?.balance_amount : Math.abs(Number(state.record?.net_amount || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="w-full max-w-xl rounded-md bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">{recordNumber || "-"} - Open amount {money(balance || 0)}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100">
            Close
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Amount"
            type="number"
            value={state.amount}
            onChange={(value) => setState((prev) => ({ ...prev, amount: value }))}
          />
          <Field
            label="Channel"
            value={state.channel}
            onChange={(value) => setState((prev) => ({ ...prev, channel: value }))}
          />
          <Field
            label="Reference"
            value={state.reference}
            onChange={(value) => setState((prev) => ({ ...prev, reference: value }))}
          />
          <Field
            label="Notes"
            value={state.notes}
            onChange={(value) => setState((prev) => ({ ...prev, notes: value }))}
          />
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <ActionButton onClick={onClose} disabled={loading}>Cancel</ActionButton>
          <button
            type="button"
            disabled={loading}
            onClick={onSubmit}
            className="h-10 rounded-md bg-[#1F41BB] px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailModal = ({ state, setState, money, formatFinanceDate }) => {
  const isStatement = state.type === "statement";
  const record = state.record || {};
  const items = record.items || [];
  const close = () => setState({ type: null, record: null });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="max-h-[88vh] w-full max-w-6xl overflow-hidden rounded-md bg-white shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {isStatement ? record.statement_number : record.settlement_number}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
              <Badge>{record.status}</Badge>
              <span>{formatFinanceDate(record.period_start)} to {formatFinanceDate(record.period_end)}</span>
              <span>{isStatement ? money(record.total_amount) : money(record.net_amount)}</span>
            </div>
          </div>
          <button type="button" onClick={close} className="rounded-md px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100">
            Close
          </button>
        </div>
        <div className="max-h-[68vh] overflow-auto p-5">
          {items.length ? (
            isStatement ? (
              <Table
                columns={["Ride", "Date", "Pickup", "Destination", "Driver", "Fare", "Total", "Status"]}
                rows={items.map((item) => [
                  `#${item.booking_id}`,
                  formatFinanceDate(item.booking_date),
                  <span className="block max-w-[240px] truncate">{item.pickup_point || "-"}</span>,
                  <span className="block max-w-[240px] truncate">{item.destination_point || "-"}</span>,
                  item.driver_name || "-",
                  money(item.fare_amount),
                  money(item.total_amount),
                  <Badge>{item.booking_status}</Badge>,
                ])}
              />
            ) : (
              <Table
                columns={["Ride", "Date", "Channel", "Gross", "Commission", "Company Owes", "Driver Owes", "Net"]}
                rows={items.map((item) => [
                  item.booking_id ? `#${item.booking_id}` : "-",
                  formatFinanceDate(item.item_date),
                  <Badge>{item.payment_channel}</Badge>,
                  money(item.gross_amount),
                  money(item.commission_amount),
                  money(item.company_owes_driver),
                  money(item.driver_owes_company),
                  money(item.net_amount),
                ])}
              />
            )
          ) : (
            <div className="flex min-h-[220px] items-center justify-center text-sm font-semibold text-slate-500">No items found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const LedgerPanel = ({ account, ledger, loading, money, onCreateStatement }) => (
  <div className="rounded-md border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Account Ledger</h3>
        <p className="text-sm text-slate-500">{account?.name || "Select an account from the Accounts tab"}</p>
      </div>
      <ActionButton disabled={!account?.id} onClick={onCreateStatement}>Create Statement</ActionButton>
    </div>
    {!account?.id ? (
      <EmptyState />
    ) : loading ? (
      <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading ledger...</div>
    ) : (
      <>
        <div className="grid gap-3 p-4 md:grid-cols-4">
          <MiniStat label="Rides" value={ledger?.totals?.rides || 0} />
          <MiniStat label="Gross" value={money(ledger?.totals?.gross || 0)} />
          <MiniStat label="Paid" value={money(ledger?.totals?.paid || 0)} />
          <MiniStat label="Balance" value={money(ledger?.totals?.balance || 0)} />
        </div>
        <div className="overflow-x-auto">
          {(ledger?.rows || []).length ? (
            <Table
              columns={["Ride", "Date", "Passenger", "Driver", "Fare", "Paid", "Balance", "Statement"]}
              rows={(ledger?.rows || []).map((row) => [
                `#${row.id}`,
                row.booking_date || "-",
                row.passenger_name || "-",
                row.driver_name || "-",
                money(row.fare_amount),
                money(row.paid_amount),
                money(row.balance_amount),
                <Badge>{row.statement_status}</Badge>,
              ])}
            />
          ) : (
            <div className="flex min-h-[220px] items-center justify-center text-sm font-semibold text-slate-500">No ledger rows found for these filters.</div>
          )}
        </div>
      </>
    )}
  </div>
);

const DriverPanel = ({ driver, detail, loading, money, onCreateSettlement }) => (
  <div className="rounded-md border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Driver 360</h3>
        <p className="text-sm text-slate-500">{driver?.name || "Select a driver from the Drivers tab"}</p>
      </div>
      <ActionButton disabled={!driver?.id} onClick={onCreateSettlement}>Create Settlement</ActionButton>
    </div>
    {!driver?.id ? (
      <EmptyState />
    ) : loading ? (
      <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading driver history...</div>
    ) : (
      <>
        <div className="grid gap-3 p-4 md:grid-cols-3 xl:grid-cols-6">
          <MiniStat label="Gross fares" value={money(detail?.totals?.gross_fares || 0)} />
          <MiniStat label="Company owes" value={money(detail?.totals?.company_owes_driver || 0)} />
          <MiniStat label="Driver owes" value={money(detail?.totals?.driver_owes_company || 0)} />
          <MiniStat label="Net" value={money(detail?.totals?.net_amount || 0)} />
          <MiniStat label="Packages" value={money(detail?.totals?.package_spend || 0)} />
          <MiniStat label="Wallet +/-" value={`${money(detail?.totals?.wallet_additions || 0)} / ${money(detail?.totals?.wallet_deductions || 0)}`} />
        </div>
        <div className="grid gap-4 p-4 xl:grid-cols-3">
          <div className="overflow-x-auto rounded-md border border-slate-200">
            {(detail?.rows || []).length ? (
              <Table
                columns={["Ride", "Date", "Gross", "Commission", "Net", "Settlement"]}
                rows={(detail?.rows || []).map((row) => [
                  `#${row.booking_id}`,
                  row.item_date || "-",
                  money(row.gross_amount),
                  money(row.commission_amount),
                  money(row.net_amount),
                  <Badge>{row.settlement_status}</Badge>,
                ])}
              />
            ) : (
              <div className="flex min-h-[220px] items-center justify-center text-sm font-semibold text-slate-500">No ride rows found for these filters.</div>
            )}
          </div>
          <div className="overflow-x-auto rounded-md border border-slate-200">
            {(detail?.packages || []).length ? (
              <Table
                columns={["Package", "Type", "Amount", "Dates"]}
                rows={(detail?.packages || []).map((pack) => [
                  pack.package_name || `#${pack.id}`,
                  <Badge>{pack.package_type}</Badge>,
                  money(pack.amount),
                  `${pack.start_date || "-"} to ${pack.expire_date || "-"}`,
                ])}
              />
            ) : (
              <div className="flex min-h-[220px] items-center justify-center text-sm font-semibold text-slate-500">No packages found.</div>
            )}
          </div>
          <div className="overflow-x-auto rounded-md border border-slate-200">
            {(detail?.wallet || []).length ? (
              <Table
                columns={["Date", "Type", "Amount", "Comment"]}
                rows={(detail?.wallet || []).map((row) => [
                  row.date || "-",
                  <Badge>{row.type}</Badge>,
                  money(row.amount),
                  <span className="block max-w-[240px] truncate">{row.comment || "-"}</span>,
                ])}
              />
            ) : (
              <div className="flex min-h-[220px] items-center justify-center text-sm font-semibold text-slate-500">No wallet transactions found.</div>
            )}
          </div>
        </div>
      </>
    )}
  </div>
);

const MiniStat = ({ label, value }) => (
  <div className="rounded-md bg-slate-50 p-3">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
  </div>
);

const EmptyState = () => (
  <div className="flex min-h-[260px] items-center justify-center p-8 text-center text-sm font-semibold text-slate-500">
    <span className="inline-flex items-center gap-2">Choose a row first <FaChevronRight /></span>
  </div>
);

export default FinanceCenter;
