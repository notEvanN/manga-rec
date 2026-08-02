import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import TitleCard from "./TitleCard";

function App() {
  const users = useQuery(api.users.list);
  const titles = useQuery(api.titles.list);
  const addTitle = useMutation(api.titles.add);

  const [currentUserId, setCurrentUserId] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tags = tagsInput.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
    await addTitle({ name, description, tags });
    setName("");
    setDescription("");
    setTagsInput("");
  };

  return (
    <div>
      <h1>Manga Tracker</h1>

      <h2>Who are you?</h2>
      <select
        value={currentUserId}
        onChange={(e) => setCurrentUserId(e.target.value)}
      >
        <option value="">-- Select your name --</option>
        {users?.map((user) => (
          <option key={user._id} value={user._id}>
            {user.name}
          </option>
        ))}
      </select>
      {currentUserId && <p>Logged in as: {users?.find(u => u._id === currentUserId)?.name}</p>}

      <h2>Add a Title</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input placeholder="Title name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <input placeholder="Tags (comma separated)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
        </div>
        <button type="submit">Add Title</button>
      </form>

      <h2>Titles</h2>
      {titles?.map((title) => (
        <TitleCard key={title._id} title={title} currentUserId={currentUserId} users={users} />
      ))}
      {titles?.map((title) => (
        <div key={title._id} style={{ marginBottom: "1rem" }}>
          <strong>{title.name}</strong>
          <p>{title.description}</p>
          <p>Tags: {title.tags.join(", ")}</p>
        </div>
      ))}
    </div>
  );
}

export default App;