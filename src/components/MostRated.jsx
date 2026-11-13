import { useEffect, useMemo, useRef, useState } from "react";
import { Box, IconButton, Skeleton, Stack, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { panelSx } from "../theme/theme";
import { SORTERS } from "../lib/sorters";
import TitleCard from "./TitleCard";

const MAX_ITEMS = 10;
const ITEM_WIDTH = { xs: 160, sm: 200 };

const arrowSx = {
  width: 44,
  height: 44,
  borderRadius: "10px",
  border: "1px solid var(--border)",
  bgcolor: "var(--bg)",
  "&:hover": { bgcolor: "var(--panel-raised)" },
};

// Horizontal, snap-scrolling row of the titles with the most ratings.
function MostRated({ titles, onOpen }) {
  const top = useMemo(
    () =>
      titles
        ?.filter((t) => t.ratingCount > 0)
        .sort(SORTERS.mostRated)
        .slice(0, MAX_ITEMS),
    [titles],
  );

  // Track whether we're at either end so the arrows can disable themselves.
  const scrollerRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => {
      setAtStart(el.scrollLeft <= 1);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
    };
    // ResizeObserver also fires once right away, which sets the initial state.
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [top]);

  const scrollByPage = (direction) => {
    const el = scrollerRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: direction * el.clientWidth * 0.8,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <Box
      component="section"
      aria-labelledby="most-rated-heading"
      sx={{ ...panelSx, p: { xs: 2, md: 3 }, minWidth: 0 }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 2.5 }}
      >
        <Typography id="most-rated-heading" variant="h2">
          Most rated by the group
        </Typography>

        {top?.length > 0 && (
          <Stack direction="row" spacing={1}>
            <IconButton
              aria-label="Scroll left"
              onClick={() => scrollByPage(-1)}
              disabled={atStart}
              sx={arrowSx}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              aria-label="Scroll right"
              onClick={() => scrollByPage(1)}
              disabled={atEnd}
              sx={arrowSx}
            >
              <ChevronRightIcon />
            </IconButton>
          </Stack>
        )}
      </Stack>

      {top === undefined ? (
        <Stack direction="row" spacing={2} sx={{ overflow: "hidden" }}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              sx={{ flexShrink: 0, width: ITEM_WIDTH, height: "auto", aspectRatio: "2 / 3" }}
            />
          ))}
        </Stack>
      ) : top.length === 0 ? (
        <Typography color="textSecondary" sx={{ py: 4, textAlign: "center" }}>
          Nothing rated yet. Rate a title and it will show up here.
        </Typography>
      ) : (
        <Box
          ref={scrollerRef}
          component="ol"
          sx={{
            listStyle: "none",
            m: 0,
            // room for the hover lift and focus outline, which overflow clips otherwise
            p: "6px 4px",
            mx: "-4px",
            display: "flex",
            gap: 2,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollPaddingInline: "4px",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {top.map((title, i) => (
            <Box
              component="li"
              key={title._id}
              sx={{ flexShrink: 0, width: ITEM_WIDTH, scrollSnapAlign: "start" }}
            >
              <TitleCard title={title} rank={i + 1} onOpen={onOpen} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default MostRated;
