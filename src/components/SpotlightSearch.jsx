import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { Search } from "lucide-react";
import { locations } from "#constants/intex";
import useLocationStore from "#store/location";
import useWindowStore from "#store/window";

const PROJECT_META = {
  "Modern ToDo list Website Application": {
    title: "Modern Todo Website Application",
    subtitle: "Task management web application",
    tech: "React • Node.js • MongoDB",
  },
  Weather: {
    title: "Weather App",
    subtitle: "Live weather search experience",
    tech: "React • OpenWeather API",
  },
  "Share Bite": {
    title: "Share Bite",
    subtitle: "Food Delivery Platform",
    tech: "React • Cloudflare Workers",
  },
  "My Personal Portfolio": {
    title: "Personal Portfolio",
    subtitle: "Interactive macOS Portfolio",
    tech: "React • Tailwind CSS • GSAP",
  },
  Cars: {
    title: "Cars",
    subtitle: "Automotive Showcase",
    tech: "React • Vercel",
  },
};

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

const getProjectDescription = (folder) => {
  const descriptionFile = folder.children?.find((item) => item.description);
  const description = descriptionFile?.description?.[0] ?? "";

  if (!description) return PROJECT_META[folder.name]?.subtitle ?? "Portfolio project";

  return description.length > 105 ? `${description.slice(0, 105).trim()}...` : description;
};

const SpotlightSearch = () => {
  const { openWindow } = useWindowStore();
  const { setActiveLocation } = useLocationStore();
  const searchBoxRef = useRef(null);
  const inputRef = useRef(null);
  const resultRefs = useRef([]);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

  const folderItems = useMemo(() => {
    const folders = locations.work?.children ?? [];

    return folders.map((folder) => ({
      id: `folder-${folder.id}`,
      label: PROJECT_META[folder.name]?.title ?? folder.name,
      subtitle: PROJECT_META[folder.name]?.subtitle ?? "Portfolio project",
      tech: PROJECT_META[folder.name]?.tech ?? "React • JavaScript",
      description: getProjectDescription(folder),
      folder,
    }));
  }, []);

  const suggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return folderItems;

    return folderItems
      .map((item) => ({
        item,
        score: Math.min(
          ...[item.label, item.subtitle, item.tech, item.description]
            .map((text) => getMatchScore(text, query))
            .filter((score) => score >= 0)
        ),
      }))
      .filter(({ score }) => Number.isFinite(score))
      .sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
        return a.item.label.localeCompare(b.item.label);
      })
      .map(({ item }) => item);
  }, [folderItems, searchQuery]);

  const topHit = suggestions[0];
  const projectResults = suggestions.slice(1);

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

    const handleOpenSpotlight = () => {
      setActiveSuggestionIndex(0);
      setShowSearch(true);
    };

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

  useEffect(() => {
    resultRefs.current = [];
  }, [searchQuery, showSearch]);

  useEffect(() => {
    const target = resultRefs.current[activeSuggestionIndex];
    if (target) target.scrollIntoView({ block: "nearest" });
  }, [activeSuggestionIndex]);

  const openFolderFromSearch = (item) => {
    setActiveLocation(item.folder);
    openWindow("finder");
    setSearchQuery("");
    setShowSearch(false);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setActiveSuggestionIndex(0);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "ArrowDown" && suggestions.length > 0) {
      event.preventDefault();
      setActiveSuggestionIndex((current) => (current + 1) % suggestions.length);
    }

    if (event.key === "ArrowUp" && suggestions.length > 0) {
      event.preventDefault();
      setActiveSuggestionIndex((current) =>
        current === 0 ? suggestions.length - 1 : current - 1
      );
    }

    if (event.key === "Enter" && suggestions.length > 0) {
      event.preventDefault();
      openFolderFromSearch(suggestions[activeSuggestionIndex]);
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
                  autoComplete="off"
                  spellCheck="false"
                  value={searchQuery}
                  onChange={handleSearchChange}
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

            <AnimatePresence>
              {suggestions.length > 0 && (
                <Motion.div
                  initial={{ opacity: 0, scale: 0.97, y: -8, filter: "blur(6px)" }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.98, y: -8, filter: "blur(6px)" }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="spotlight-results-panel"
                >
                  {topHit && (
                    <section className="spotlight-results-section">
                      <p className="spotlight-results-label">Top Hit</p>
                      <button
                        type="button"
                        ref={(element) => {
                          resultRefs.current[0] = element;
                        }}
                        onClick={() => openFolderFromSearch(topHit)}
                        onMouseEnter={() => setActiveSuggestionIndex(0)}
                        className={`spotlight-top-hit ${
                          activeSuggestionIndex === 0 ? "spotlight-result-active" : ""
                        }`}
                      >
                        <span className="spotlight-folder-icon">
                          <img src="/images/folder.png" alt="" />
                        </span>
                        <span className="spotlight-top-hit-content">
                          <span className="spotlight-result-title">{topHit.label}</span>
                          <span className="spotlight-result-description">
                            {topHit.description}
                          </span>
                          <span className="spotlight-result-tech">{topHit.tech}</span>
                        </span>
                      </button>
                    </section>
                  )}

                  {projectResults.length > 0 && (
                    <section className="spotlight-results-section">
                      <p className="spotlight-results-label">Projects</p>
                      <div className="spotlight-project-list">
                        {projectResults.map((item, index) => {
                          const resultIndex = index + 1;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              ref={(element) => {
                                resultRefs.current[resultIndex] = element;
                              }}
                              onClick={() => openFolderFromSearch(item)}
                              onMouseEnter={() => setActiveSuggestionIndex(resultIndex)}
                              className={`spotlight-project-result ${
                                activeSuggestionIndex === resultIndex
                                  ? "spotlight-result-active"
                                  : ""
                              }`}
                            >
                              <span className="spotlight-folder-icon spotlight-folder-icon-small">
                                <img src="/images/folder.png" alt="" />
                              </span>
                              <span className="spotlight-project-copy">
                                <span className="spotlight-result-title">{item.label}</span>
                                <span className="spotlight-result-subtitle">
                                  {item.subtitle}
                                </span>
                                <span className="spotlight-result-tech">{item.tech}</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </Motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SpotlightSearch;
