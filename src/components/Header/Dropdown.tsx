import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const Dropdown = ({ menuItem, stickyMenu, setNavigationOpen }: { menuItem: any, stickyMenu: any, setNavigationOpen?: (open: boolean) => void }) => {
  const [dropdownToggler, setDropdownToggler] = useState(false);
  const pathUrl = usePathname();

  return (
    <li
      className={`group relative before:hidden xl:before:block before:w-0 before:h-[3px] before:bg-blue before:absolute before:left-0 before:top-0 before:rounded-b-[3px] before:ease-out before:duration-200 hover:before:w-full ${
        pathUrl.includes(menuItem.title) && "before:!w-full"
      } ${menuItem.mobileOnly ? "xl:hidden" : ""}`}
    >
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setDropdownToggler(!dropdownToggler);
        }}
        className={`hover:text-blue text-custom-sm font-medium flex items-center gap-3 xl:gap-1.5 capitalize outline-none focus:outline-none ${
          stickyMenu ? "xl:py-4" : "xl:py-6"
        } py-2 xl:py-6 ${
          (pathUrl.includes(menuItem.title) || dropdownToggler) ? "text-blue" : "text-dark"
        }`}
      >
        <span className={`flex xl:hidden items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 flex-shrink-0 ${
          dropdownToggler ? "bg-blue text-white" : "bg-blue/5 text-blue"
        }`}>
          {menuItem.title === "Tautan Cepat" && (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          )}
          {menuItem.title === "Populer" && (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          )}
          {menuItem.title === "Toko" && (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          )}
          {menuItem.title === "Blog" && (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
          )}
          {menuItem.title === "Kontak" && (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          )}
          {/* Default icon if not specified */}
          {!["Populer", "Toko", "Blog", "Kontak", "Tautan Cepat"].includes(menuItem.title) && (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          )}
        </span>
        <span className="flex-1">{menuItem.title}</span>
        <svg
          className={`fill-current cursor-pointer transition-transform duration-200 ${dropdownToggler ? "rotate-180 text-blue" : ""}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2.95363 5.67461C3.13334 5.46495 3.44899 5.44067 3.65866 5.62038L7.99993 9.34147L12.3412 5.62038C12.5509 5.44067 12.8665 5.46495 13.0462 5.67461C13.2259 5.88428 13.2017 6.19993 12.992 6.37964L8.32532 10.3796C8.13808 10.5401 7.86178 10.5401 7.67453 10.3796L3.00787 6.37964C2.7982 6.19993 2.77392 5.88428 2.95363 5.67461Z"
            fill=""
          />
        </svg>
      </a>

      {/* <!-- Dropdown Start --> */}
      <ul
        className={`flex-col rounded-md bg-white transition-all duration-300 ${
          dropdownToggler ? "flex static visible opacity-100 translate-y-0 mt-1 pl-10 pb-2" : "hidden xl:flex xl:p-2.5"
        } xl:absolute xl:top-[110%] xl:left-0 xl:w-[250px] xl:shadow-lg xl:border xl:border-gray-3 xl:group-hover:top-full xl:group-hover:visible xl:group-hover:opacity-100`}
      >
        {menuItem.submenu.map((item, i) => (
          <li key={i}>
            <Link
              href={item.path}
              prefetch={item.prefetch}
              onClick={() => setNavigationOpen && setNavigationOpen(false)}
              className={`block text-custom-sm font-medium transition-all duration-200 ${
                pathUrl === item.path ? "text-blue" : "text-dark-4 hover:text-blue"
              } py-2 hover:bg-gray-1 rounded-md`}
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
};

export default Dropdown;
