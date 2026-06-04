import dayjs from "dayjs";
import { useState, useEffect } from "react";

import { navIcons, navLinks } from "#constants/intex";
import useWindowStore from "#store/window";

const Navbar = () => {
  const { openWindow } = useWindowStore();

  const [time, setTime] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(dayjs());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const openSpotlightSearch = () => {
    window.dispatchEvent(new Event("open-spotlight-search"));
  };

  return (
    <nav>
      <div>
        <img src="/images/logo.svg" alt="logo" />
        <p className="font-bold">Ziyavul Haq's PortFoloio</p>
        <ul>
          {navLinks.map(({ id, name, type }) => (
            <li key={id} onClick={() => openWindow(type)}>
              <p>{name}</p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <ul>
          {navIcons.map(({ id, img }) => {
            const isSearchIcon = img.includes("search");

            if (!isSearchIcon) {
              return (
                <li key={id}>
                  <img src={img} className="icon-hover" alt={`icon-${id}`} />
                </li>
              );
            }

            return (
              <li key={id}>
                <button
                  type="button"
                  aria-label="Open Spotlight Search"
                  onClick={openSpotlightSearch}
                  className="cursor-pointer"
                >
                  <img src={img} className="icon-hover" alt={`icon-${id}`} />
                </button>
              </li>
            );
          })}
        </ul>
        <time> {time.format("ddd MMM D  h:mm A")}</time>
      </div>
    </nav>
  );
};
export default Navbar;
