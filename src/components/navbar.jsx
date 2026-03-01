import dayjs from "dayjs";
import { useState, useEffect, useMemo, useRef } from "react";

import { locations, navIcons, navLinks } from "#constants/intex";
import useLocationStore from "#store/location";
import useWindowStore from "#store/window";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

const isSubsequenceMatch = (query, text) => {
  let queryIndex = 0;
  for (let i = 0; i < text.length && queryIndex < query.length; i += 1) {
    if (text[i] === query[queryIndex]) queryIndex += 1;
  }
  return queryIndex === query.length;
};

const getMatchScore = (label, query) => {
  const normalizedLabel = label.toLowerCase();
  if (normalizedLabel.startsWith(query)) return 0;
  if (normalizedLabel.includes(query)) return 1;
  if (isSubsequenceMatch(query, normalizedLabel)) return 2;
  return -1;
};

const Navbar = () => {
  const { openWindow } = useWindowStore();
  const { setActiveLocation } = useLocationStore();
  const searchBoxRef = useRef(null);
  const suggestionRefs = useRef([]);

  const [time, setTime] = useState(dayjs());
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

  const folderItems = useMemo(() => {
    const folders = locations.work?.children ?? [];
    return folders.map((folder) => ({
      id: `folder-${folder.id}`,
      label: folder.name,
      folder,
    }));
  }, []);

  const suggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return folderItems;

    return folderItems
      .map((item) => ({
        item,
        score: getMatchScore(item.label, query),
      }))
      .filter(({ score }) => score >= 0)
      .sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
        return a.item.label.localeCompare(b.item.label);
      })
      .map(({ item }) => item);
  }, [folderItems, searchQuery]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(dayjs());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!searchBoxRef.current?.contains(event.target)) setShowSearch(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setShowSearch(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!showSearch) return;
    setActiveSuggestionIndex(0);
    suggestionRefs.current = [];
  }, [showSearch, searchQuery]);

  useEffect(() => {
    const target = suggestionRefs.current[activeSuggestionIndex];
    if (target) {
      target.scrollIntoView({ block: "nearest" });
    }
  }, [activeSuggestionIndex]);

  const openFolderFromSearch = (item) => {
    setActiveLocation(item.folder);
    openWindow("finder");
    setSearchQuery(item.label);
    setShowSearch(false);
  };

  const shiftSuggestion = (direction) => {
    if (!suggestions.length) return;
    setActiveSuggestionIndex((prev) => {
      if (direction > 0) return (prev + 1) % suggestions.length;
      return prev === 0 ? suggestions.length - 1 : prev - 1;
    });
  };

  const handleSearchKeyDown = (event) => {
    if (!suggestions.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      shiftSuggestion(1);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      shiftSuggestion(-1);
    }

    if (event.key === "Enter") {
      event.preventDefault();
      openFolderFromSearch(suggestions[activeSuggestionIndex]);
    }
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
              <li key={id} ref={searchBoxRef} className="relative">
                <button
                  type="button"
                  aria-label="Search folders"
                  onClick={() => setShowSearch((prev) => !prev)}
                  className="cursor-pointer"
                >
                  <img src={img} className="icon-hover" alt={`icon-${id}`} />
                </button>

                {showSearch && (
                  <div className="absolute top-8 right-0 z-[1400] w-80 rounded-xl border border-gray-200 bg-white/95 p-2 shadow-xl backdrop-blur-2xl">
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                      <Search className="h-4 w-4 text-gray-400" />
                      <input
                        autoFocus
                        type="text"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Search folders"
                        className="w-full bg-transparent text-sm outline-none"
                      />

                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          aria-label="Previous folder"
                          onClick={() => shiftSuggestion(-1)}
                          className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          aria-label="Next folder"
                          onClick={() => shiftSuggestion(1)}
                          className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto overscroll-contain pr-1">
                      {suggestions.length > 0 ? (
                        suggestions.map((item, index) => (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => openFolderFromSearch(item)}
                              onMouseEnter={() => setActiveSuggestionIndex(index)}
                              ref={(element) => {
                                suggestionRefs.current[index] = element;
                              }}
                              className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                                activeSuggestionIndex === index
                                  ? "bg-gray-100"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              <p className="truncate text-sm font-medium">
                                {item.label}
                              </p>
                              <p className="truncate text-xs text-gray-500">
                                Folder
                              </p>
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="px-3 py-2 text-sm text-gray-500">
                          No folder found
                        </li>
                      )}
                    </ul>
                  </div>
                )}
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
