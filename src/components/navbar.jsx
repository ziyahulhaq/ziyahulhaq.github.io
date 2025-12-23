import dayjs from "dayjs";
import { useState, useEffect } from "react";

import { navIcons, navLinks } from "#constants/intex";
import useWindowStore from "#store/window";
import { Type } from "lucide-react";

const Navbar = () => {
const {openWindow} = useWindowStore()

  const [time, setTime] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(dayjs());
    }, 60000); 

    return () => clearInterval(interval); 
  }, []);

  return (

    <nav>
      <div>
        <img src="public_portfolio/public/images/logo.svg" alt="logo" />
        <p className="font-bold">Ziyavul Haq's PortFoloio</p>
        <ul>
          {navLinks.map(({ id, name ,type }) => (
            <li key={id} onClick={() => openWindow(type)}>
              <p>{name}</p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <ul>
          {navIcons.map(({ id, img }) => (
            <li key={id}>
              <img src={img} className="icon-hover" alt={`icon-${id}`} />
            </li>
          ))}
        </ul>
        <time> {time.format("ddd MMM D  h:mm A")}</time>
      </div>
    </nav>
  );
};
export default Navbar;
