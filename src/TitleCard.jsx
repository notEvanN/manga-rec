const TEASER_LENGTH = 100;

// Only phrasing elements (span, strong, img) are valid inside a <button>.
function TitleCard({ title, onOpen }) {
  const description = title.description ?? "";
  const teaser =
    description.length > TEASER_LENGTH ? `${description.slice(0, TEASER_LENGTH)}...` : description;

  return (
    <button className="title-card title-card-compact" onClick={() => onOpen(title._id)}>
      {title.coverUrl && (
        <img
          src={title.coverUrl}
          alt={title.name}
          referrerPolicy="no-referrer"
          className="title-card-cover"
        />
      )}
      <strong className="block">{title.name}</strong>

      {title.avgRating != null && (
        <span className="block rating">
          ⭐ {title.avgRating.toFixed(1)}/10 ({title.ratingCount})
        </span>
      )}

      <span className="block title-card-teaser">{teaser}</span>
      <span className="block title-card-tags">{title.tags.join(", ")}</span>

      {title.slop && <span className="block slop-badge">🚩 Slop</span>}
    </button>
  );
}

export default TitleCard;
