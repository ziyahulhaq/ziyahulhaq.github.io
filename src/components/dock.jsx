import { useRef } from 'react';
import gsap from 'gsap';
import { Tooltip } from 'react-tooltip';
import { dockApps } from '#constants/intex';
import { useGSAP } from '@gsap/react';
import useWindowStore from '#store/window';
const Dock = () => {
  const {openWindow, closeWindow, windows} = useWindowStore();
  const dockRef = useRef(null);

  useGSAP(() => {
    const dock = dockRef.current;
    if (!dock) return;

    const icons = dock.querySelectorAll('.dock-icon');

    const animateIcons = (mouseX) => {
      const { left: dockLeft } = dock.getBoundingClientRect();

      icons.forEach((icon) => {
        const { left: iconLeft, width } = icon.getBoundingClientRect();
        const center = iconLeft - dockLeft + width / 2;

        const distance = mouseX - center;

        let intensity = Math.exp(-Math.pow(Math.abs(distance), 2.5) / 20000);

        intensity = Math.max(0, Math.min(1, intensity));

        gsap.to(icon, {
          scale: 1 + 0.25 * intensity,
          y: -15 * intensity,
          duration: 0.2,
          ease: 'power1.out',
        });
      });
    };

    const handleMouseMove = (e) => {
      const { left: dockLeft } = dock.getBoundingClientRect();
      animateIcons(e.clientX - dockLeft);
    };

    const resetIcons = () =>
      icons.forEach((icon) =>
        gsap.to(icon, {
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: 'power1.out',
        })
      );

    dock.addEventListener('mousemove', handleMouseMove);
    dock.addEventListener('mouseleave', resetIcons);

    return () => {
      dock.removeEventListener('mousemove', handleMouseMove);
      dock.removeEventListener('mouseleave', resetIcons);
    };
  });

  const toggleApp = (app) => {
    console.log("he");
    
    if (!app.canOpen) return;
    console.log(app.id);
    const window = windows[app.id];
    console.log("he2");

    if (!window) {
      console.error(`Window not found for app: ${app.id}`);
      return;
    }
    console.log(window.isOpen, "isOpen");

    if(window.isOpen) {
    console.log(app.id,"he4");

      closeWindow(app.id);
    } else {
    console.log("he5");

      openWindow(app.id);
    }
  };

  return (
    <section id="dock">
      <div ref={dockRef} className="dock-container">
        {dockApps.map(({ id, name, icon, canOpen }) => (
          <div key={id} className="relative flex justify-center">
            <button
              type="button"
              className="dock-icon"
              aria-label={name}
              data-tooltip-id="dock-tooltip"
              data-tooltip-content={name}
              data-tooltip-delay-show={150}
              disabled={!canOpen}
              onClick={() => toggleApp({ id, canOpen })}
            >
              <img
                src={`/images/${icon}`}
                alt={name}
                loading="lazy"
                className={canOpen ? '' : 'opacity-60'}
              />
            </button>
          </div>
        ))}
        <Tooltip id="dock-tooltip" place="top" className="tooltip" />
      </div>
    </section>
  );
};

export default Dock;