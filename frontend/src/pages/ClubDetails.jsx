import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const clubs = [
  {
    id: 1,
    name: "Music Club",
    organizer: "Rahul Sharma",
    description: "A club for music lovers to explore and perform."
  },
  {
    id: 2,
    name: "Dance Club",
    organizer: "Priya Singh",
    description: "Join us to learn and perform different dance styles."
  },
  {
    id: 3,
    name: "Tech Club",
    organizer: "Ankit Verma",
    description: "Explore technology and coding challenges together."
  },
  {
    id: 4,
    name: "Art Club",
    organizer: "Neha Gupta",
    description: "Unleash your creativity with painting and sketching."
  }
];

const ClubDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const club = clubs.find((c) => c.id === parseInt(id));

  if (!club) {
    return <div className="text-center text-red-500 mt-10">Club not found</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-red-500 mb-4">{club.name}</h1>
      <p className="text-lg text-gray-300 mb-2">Organizer: {club.organizer}</p>
      <p className="text-gray-400 text-center max-w-xl mb-6">
        {club.description}
      </p>
      <button
        onClick={() => navigate(-1)}
        className="bg-red-500 px-6 py-2 rounded hover:bg-red-600"
      >
        Back to Clubs
      </button>
    </div>
  );
};

export default ClubDetails;
