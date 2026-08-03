import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function TitleCard({ title, currentUserId, users }) {
  const ratings = useQuery(api.ratings.forTitle, { titleId: title._id });
  const statuses = useQuery(api.readStatus.forTitle, { titleId: title._id });

  const rate = useMutation(api.ratings.rate);
  const setStatus = useMutation(api.readStatus.setStatus);

  const [score, setScore] = useState(5);
  const [descExpanded, setDescExpanded] = useState(false);

  const getUserName = (userId) => {
    return users?.find((u) => u._id === userId)?.name ?? "Unknown";
  };

  const statusLabels = {
    plan_to_read: "Plan to Read",
    reading: "Reading",
    completed: "Completed",
    dropped: "Dropped",
  };
  const getStatusLabel = (status) => statusLabels[status] ?? status;

  const handleRate = async () => {
    if (!currentUserId) return alert("Select your name first");
    await rate({ userId: currentUserId, titleId: title._id, score: Number(score) });
  };

  const handleStatus = async (status) => {
    if (!currentUserId) return alert("Select your name first");
    await setStatus({ userId: currentUserId, titleId: title._id, status });
  };

  const isLongDescription = title.description && title.description.length > 150;

  return (
    <div className="title-card">
      {title.coverUrl && (
        <img
          src={title.coverUrl}
          alt={title.name}
          referrerPolicy="no-referrer"
          style={{ height: "150px", display: "block", marginBottom: "0.5rem" }}
        />
      )}
      <strong>{title.name}</strong>
      {title.addedBy && <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>Added by: {getUserName(title.addedBy)}</p>}
      {title.avgRating != null && (
        <p style={{ fontWeight: "bold" }}>
          ⭐ {title.avgRating.toFixed(1)}/10 ({title.ratingCount} rating{title.ratingCount !== 1 ? "s" : ""})
        </p>
      )}

      <p>
        {isLongDescription && !descExpanded
          ? `${title.description.slice(0, 150)}...`
          : title.description}
        {isLongDescription && (
          <button
            onClick={() => setDescExpanded((v) => !v)}
            style={{
              background: "none",
              border: "none",
              color: "#3b82f6",
              cursor: "pointer",
              padding: 0,
              marginLeft: "0.3rem",
              font: "inherit",
            }}
          >
            {descExpanded ? "See less" : "See more..."}
          </button>
        )}
      </p>

      <p>Tags: {title.tags.join(", ")}</p>
      {title.slop && <p style={{ color: "#ef4444", fontWeight: "bold" }}>🚩 Slop</p>}

      <div>
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

      <h4>Ratings</h4>
      {ratings?.map((r) => (
        <p key={r._id}>{getUserName(r.userId)}: {r.score}/10</p>
      ))}

      <h4>Status</h4>
      {statuses?.map((s) => (
        <p key={s._id}>{getUserName(s.userId)}: {getStatusLabel(s.status)}</p>
      ))}
    </div>
  );
}

export default TitleCard;