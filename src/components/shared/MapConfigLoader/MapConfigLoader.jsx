import Spinner from "../../ui/Spinner";

const MapConfigLoader = ({
  message = "Loading map configuration...",
  className = "",
  minHeight = "min-h-[120px]",
}) => (
  <div
    className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white text-gray-500 text-sm ${minHeight} ${className}`}
  >
    <Spinner size={32} />
    <span>{message}</span>
  </div>
);

export default MapConfigLoader;
