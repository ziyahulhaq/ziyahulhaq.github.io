import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { Search } from "lucide-react";
import { locations } from "#constants/intex";
import useLocationStore from "#store/location";
import useWindowStore from "#store/window";

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

const SpotlightSearch = () => {
  const { openWindow } = useWindowStore();
  const { setActiveLocation } = useLocationStore();
  const searchBoxRef = useRef(null);
  const inputRef = useRef(null);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

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
    const handleClickOutside = (event) => {
      if (!searchBoxRef.current?.contains(event.target)) setShowSearch(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setShowSearch(false);
    };

    const handleSpotlightShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setShowSearch(true);
      }
    };

    const handleOpenSpotlight = () => setShowSearch(true);

    if (showSearch) {
      inputRef.current?.focus();
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    document.addEventListener("keydown", handleSpotlightShortcut);
    window.addEventListener("open-spotlight-search", handleOpenSpotlight);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleSpotlightShortcut);
      window.removeEventListener("open-spotlight-search", handleOpenSpotlight);
    };
  }, [showSearch]);

  const openFolderFromSearch = (item) => {
    setActiveLocation(item.folder);
    openWindow("finder");
    setSearchQuery("");
    setShowSearch(false);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter" && suggestions.length > 0) {
      event.preventDefault();
      openFolderFromSearch(suggestions[0]);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showSearch && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={() => setShowSearch(false)}
            className="spotlight-page-backdrop"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSearch && (
          <div ref={searchBoxRef} className="spotlight-search-shell">
            <Motion.div
              initial={{ opacity: 0, scale: 0.94, y: -18, filter: "blur(8px)" }}
              animate={{
                opacity: 1,
                scale: isFocused ? 1.025 : 1,
                y: 0,
                filter: "blur(0px)",
              }}
              exit={{ opacity: 0, scale: 0.96, y: -14, filter: "blur(8px)" }}
              transition={{
                duration: 0.34,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`spotlight-search-container ${
                isFocused ? "spotlight-search-container-focused" : ""
              }`}
            >
              <div className="spotlight-search-inner">
                <Motion.div
                  animate={{
                    scale: isFocused ? 1.08 : 1,
                    x: isFocused ? 1 : 0,
                    opacity: isFocused ? 1 : 0.78,
                  }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="spotlight-search-icon"
                >
                  <Search size={22} strokeWidth={1.65} />
                </Motion.div>

                <input
                  ref={inputRef}
                  autoFocus
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Spotlight Search"
                  className="spotlight-search-input"
                  aria-label="Spotlight Search"
                />

                <Motion.kbd
                  className="spotlight-shortcut-badge"
                  initial={{ opacity: 0, scale: 0.85, x: 8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 0.12, duration: 0.24, ease: "easeOut" }}
                >
                  &#8984; K
                </Motion.kbd>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SpotlightSearch;
