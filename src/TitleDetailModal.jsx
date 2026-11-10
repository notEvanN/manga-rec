import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import Modal from "./Modal";
import { STATUS_OPTIONS, STATUS_LABELS, SCORES } from "./constants";

function TitleDetailModal({ title, currentUserId, users, onClose }) {
  const ratings = useQuery(api.ratings.forTitle, { titleId: title._id });
  const statuses = useQuery(api.readStatus.forTitle, { titleId: title._id });

  const rate = useMutation(api.ratings.rate);
  const setStatus = useMutation(api.readStatus.setStatus);
  const getLatestChapter = useAction(api.mangadex.latestChapter);

  // null = user hasn't touched the dropdown yet, so show their existing rating.
  const [pickedScore, setPickedScore] = useState(null);
  const [actionError, setActionError] = useState("");
  const [latestChapter, setLatestChapter] = useState(undefined);

  const myRating = ratings?.find((r) => r.userId === currentUserId);
  const score = pickedScore ?? myRating?.score ?? 5;
  const isSignedIn = Boolean(currentUserId);

  useEffect(() => {
    if (!title.mangaDexId) return;
    let cancelled = false;
    getLatestChapter({ mangaDexId: title.mangaDexId })
      .then((ch) => !cancelled && setLatestChapter(ch))
      .catch(() => !cancelled && setLatestChapter(null));
    return () => {
      cancelled = true;
    };
  }, [title.mangaDexId, getLatestChapter]);

  const getUserName = (userId) => users?.find((u) => u._id === userId)?.name ?? "Unknown";

  const runAction = async (fn) => {
    setActionError("");
    try {
      await fn();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleRate = () => runAction(() => rate({ titleId: title._id, score }));
  const handleStatus = (status) => runAction(() => setStatus({ titleId: title._id, status }));

  return (
    <Modal onClose={onClose} ariaLabel={title.name}>
      {title.coverUrl && (
        <img src={title.coverUrl} alt={title.name} referrerPolicy="no-referrer" className="detail-cover" />
      )}
      <h3>{title.name}</h3>

      {title.mangaDexId && latestChapter === undefined && (
        <p className="muted">Loading latest chapter...</p>
      )}
      {latestChapter && <p>Latest (EN): Chapter {latestChapter}</p>}

      {title.avgRating != null && (
        <p className="rating">
          ⭐ {title.avgRating.toFixed(1)}/10 ({title.ratingCount} rating{title.ratingCount !== 1 ? "s" : ""})
        </p>
      )}

      <p>{title.description}</p>
      <p>Tags: {title.tags.join(", ")}</p>
      {title.addedBy && <p className="muted">Added by: {getUserName(title.addedBy)}</p>}
      {title.slop && <p className="slop-badge">🚩 Slop</p>}

      <div className="section">
        <select
          aria-label="Your rating"
          value={score}
          onChange={(e) => setPickedScore(Number(e.target.value))}
          disabled={!isSignedIn}
        >
          {SCORES.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <button onClick={handleRate} disabled={!isSignedIn}>
          {myRating ? "Update rating" : "Rate"}
        </button>
      </div>

      <div className="status-buttons">
        {STATUS_OPTIONS.map(({ value, label }) => (
          <button key={value} onClick={() => handleStatus(value)} disabled={!isSignedIn}>
            {label}
          </button>
        ))}
      </div>

      {!isSignedIn && <p className="muted">Sign in to rate or track this title.</p>}
      {actionError && <p className="error">{actionError}</p>}

      <h4>Ratings</h4>
      {ratings?.map((r) => (
        <p key={r._id}>{getUserName(r.userId)}: {r.score}/10</p>
      ))}

      <h4>Status</h4>
      {statuses?.map((s) => (
        <p key={s._id}>{getUserName(s.userId)}: {STATUS_LABELS[s.status] ?? s.status}</p>
      ))}

      <div className="section">
        <button onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

export default TitleDetailModal;
