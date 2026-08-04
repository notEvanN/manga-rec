function TitleCard({ title, onOpen }) {
  const isLongDescription = title.description && title.description.length > 100;

  return (
    <button className="title-card title-card-compact" onClick={() => onOpen(title)}>
      {title.coverUrl && (
        <img
          src={title.coverUrl}
          alt={title.name}
          referrerPolicy="no-referrer"
          className="title-card-cover"
        />
      )}
      <strong>{title.name}</strong>

      {title.avgRating != null && (
        <p style={{ fontWeight: "bold" }}>
          ⭐ {title.avgRating.toFixed(1)}/10 ({title.ratingCount})
        </p>
      )}

      <p className="title-card-teaser">
        {isLongDescription ? `${title.description.slice(0, 100)}...` : title.description}
      </p>

      <p className="title-card-tags">{title.tags.join(", ")}</p>

      {title.slop && <p style={{ color: "#ef4444", fontWeight: "bold" }}>🚩 Slop</p>}
    </button>
  );
}

export default TitleCard;