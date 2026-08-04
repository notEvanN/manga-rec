import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import Modal from "./Modal";

const statusLabels = {
  plan_to_read: "Plan to Read",
  reading: "Reading",
  completed: "Completed",
  dropped: "Dropped",
};

function TitleDetailModal({ title, currentUserId, users, onClose }) {
  const ratings = useQuery(api.ratings.forTitle, { titleId: title._id });
  const statuses = useQuery(api.readStatus.forTitle, { titleId: title._id });

  const rate = useMutation(api.ratings.rate);
  const setStatus = useMutation(api.readStatus.setStatus);

  const [score, setScore] = useState(5);
  const [actionError, setActionError] = useState("");

  const getUserName = (userId) => users?.find((u) => u._id === userId)?.name ?? "Unknown";
  const getStatusLabel = (status) => statusLabels[status] ?? status;

  const handleRate = async () => {
    if (!currentUserId) return alert("Select your name first");
    setActionError("");
    try {
      await rate({ userId: currentUserId, titleId: title._id, score: Number(score) });
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleStatus = async (status) => {
    if (!currentUserId) return alert("Select your name first");
    setActionError("");
    try {
      await setStatus({ userId: currentUserId, titleId: title._id, status });
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <Modal onClose={onClose} ariaLabel={title.name}>
      {title.coverUrl && (
        <img
          src={title.coverUrl}
          alt={title.name}
          referrerPolicy="no-referrer"
          style={{ height: "200px", display: "block", marginBottom: "0.5rem" }}
        />
      )}
      <h3>{title.name}</h3>

      {title.avgRating != null && (
        <p style={{ fontWeight: "bold" }}>
          ⭐ {title.avgRating.toFixed(1)}/10 ({title.ratingCount} rating{title.ratingCount !== 1 ? "s" : ""})
        </p>
      )}

      <p>{title.description}</p>
      <p>Tags: {title.tags.join(", ")}</p>
      {title.addedBy && <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>Added by: {getUserName(title.addedBy)}</p>}
      {title.slop && <p style={{ color: "#ef4444", fontWeight: "bold" }}>🚩 Slop</p>}

      <div style={{ marginTop: "0.75rem" }}>
        <select value={score} onChange={(e) => setScore(e.target.value)}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <button onClick={handleRate}>Rate</button>
      </div>

      <div className="status-buttons">
        <button onClick={() => handleStatus("plan_to_read")}>Plan to Read</button>
        <button onClick={() => handleStatus("reading")}>Reading</button>
        <button onClick={() => handleStatus("completed")}>Completed</button>
        <button onClick={() => handleStatus("dropped")}>Dropped</button>
      </div>

      {actionError && <p style={{ color: "#ef4444" }}>{actionError}</p>}

      <h4>Ratings</h4>
      {ratings?.map((r) => (
        <p key={r._id}>{getUserName(r.userId)}: {r.score}/10</p>
      ))}

      <h4>Status</h4>
      {statuses?.map((s) => (
        <p key={s._id}>{getUserName(s.userId)}: {getStatusLabel(s.status)}</p>
      ))}

      <div style={{ marginTop: "1rem" }}>
        <button onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

export default TitleDetailModal;