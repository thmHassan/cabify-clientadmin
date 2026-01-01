import React from "react";
import GraphIcon from "../../svg/GraphIcon";
import ChildText from "../../ui/ChildText.jsx/ChildText";
import classNames from "classnames";

const SnapshotCard = ({ data, className, isChange = true }) => {
  const {
    title,
    value,
    change,
    backgroundColor,
    color,
    icon: { component: Icon, width, height, ...restIcon },
  } = data;
  return (
    <div
      className={classNames(
        "w-full min-h-[120px] sm:min-h-[150px] 2xl:min-h-[200px] rounded-[15px] p-4 sm:p-[15px] flex flex-col sm:flex-row gap-4 sm:gap-[18px]",
        className
      )}
      style={{ background: backgroundColor }}
    >
      {/* Icon */}
      <div className="shrink-0">
        <div className="w-14 h-14 sm:w-[60px] sm:h-[60px] rounded-md bg-white flex justify-center items-center">
          <Icon
            fill={color}
            width={width ?? 28}
            height={height ?? 29}
            {...restIcon}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Title + Change */}
        <div
          className={classNames("flex flex-col gap-1 mb-2", {
            "justify-center": !isChange,
          })}
        >
          <h5 className="text-[#252525] text-lg sm:text-xl leading-tight font-semibold">
            {title}
          </h5>

          {isChange && (
            <div
              className="flex gap-2 items-center text-sm sm:text-base font-semibold"
              style={{ color }}
            >
              <GraphIcon fill={color} />
              <ChildText size="md" text={change} style={{ color }} />
            </div>
          )}
        </div>

        {/* Value */}
        <div className="font-semibold text-2xl sm:text-4xl 2xl:text-[50px] leading-tight 2xl:leading-[68px] text-[#252525]">
          <span>{value}</span>
        </div>
      </div>
    </div>

  );
};

export default SnapshotCard;
