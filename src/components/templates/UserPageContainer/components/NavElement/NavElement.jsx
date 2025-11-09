import classNames from "classnames";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DownArrowIcon from "../../../../svg/DownArrowIcon";
import StaticTag from "../../../../ui/StaticTag";

const NavElement = ({ navItem }) => {
  const {
    // key,
    route,
    title,
    active,
    isSubMenu,
    icon: { component, active: activeIcon },
    isStatic,
  } = navItem;

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isActiveNav = [route, ...active].includes(pathname);

  const Icon = isActiveNav ? activeIcon : component;

  return (
    <button
      type="button"
      className="h-11 flex bg-[#ffffff] transition-all duration-300 ease-in-out group select-none"
      onClick={() => {
        navigate(route);
        // handleToggle(key);
      }}
    >
      <div
        className={classNames(
          "w-[5px] rounded-r-[10px] group-hover:bg-[#1F41BB] transition-all duration-200",
          {
            "bg-[#1F41BB]": isActiveNav,
          }
        )}
      ></div>
      <div className="w-[calc(100%-10px)] pl-2.5 pr-[5px]">
        <div className="pl-[17px] pr-5 group-hover:bg-[#1F41BB20] group-hover:scale-[1.025] transition-all duration-200 flex gap-[15px] items-center h-full rounded-lg">
          <div className="h-7 w-7 flex items-center justify-center">
            <Icon fill={isActiveNav ? "#1F41BB" : "#333333"} />
          </div>
          <div
            className={classNames(
              "font-semibold text-base leading-[18px] capitalize text-left flex items-center gap-1.5",
              isActiveNav ? "text-[#1F41BB]" : "text-[#333333]",
              isSubMenu ? "w-[calc(100%-74px)]" : "w-[calc(100%-42px)]"
            )}
          >
            {title}
            {isStatic && (
              <div className="pt-0.5">
                <StaticTag />
              </div>
            )}
          </div>
          {isSubMenu && (
            <div className="w-4 h-4 flex justify-center items-center">
              <DownArrowIcon />
            </div>
          )}
        </div>
      </div>
      <div className={classNames("w-[5px] rounded-r-[10px]")}></div>
    </button>
  );
};

export default NavElement;
